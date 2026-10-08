// QA local: iniciar `npx astro preview --host 127.0.0.1` y Chrome con --remote-debugging-port=9229.
const origin = process.env.QA_ORIGIN || "http://127.0.0.1:4321";
const debuggerUrl = process.env.QA_CHROME || "http://127.0.0.1:9229";
const targets = await (await fetch(`${debuggerUrl}/json/list`)).json();
const page = targets.find((target) => target.type === "page");
if (!page) throw new Error("No hay una página Chrome disponible para QA");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener("open", resolve, { once: true }); ws.addEventListener("error", reject, { once: true }); });
let nextId = 0;
const pending = new Map();
const outbound = [];
ws.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === "Network.requestWillBeSent" && message.params.request.url.startsWith("https://wa.me/")) outbound.push(message.params.request.url);
  if (!message.id) return;
  const item = pending.get(message.id);
  if (!item) return;
  pending.delete(message.id);
  message.error ? item.reject(Error(message.error.message)) : item.resolve(message.result);
});
function call(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
}
async function evaluate(expression) {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
  return result.result.value;
}
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const sizes = process.env.QA_SERVICE_ONLY ? [[390,844]] : process.env.QA_HOME_ONLY ? [[320,568],[390,844]] : [[320,568],[360,640],[390,844],[393,852],[430,932],[768,1024],[1024,768],[1366,768],[1440,900]];
const routes = process.env.QA_SERVICE_ONLY ? ["/magia-blanca/"] : process.env.QA_HOME_ONLY ? ["/"] : ["/", "/magia-blanca/", "/tarot/", "/faq/", "/como-trabajamos/"];
const failures = [];
let serviceObservation = null;
await call("Page.enable");
await call("Runtime.enable");
await call("Network.enable");
await call("Network.setBlockedURLs", { urls: ["*://wa.me/*"] });
for (const [width, height] of sizes) {
  await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 });
  for (const route of routes) {
    await call("Page.navigate", { url: `${origin}${route}` });
    await pause(route.includes("magia-") ? (process.env.QA_SERVICE_ONLY ? 4000 : 1000) : 250);
    const result = await evaluate(`(() => {
      const width = innerWidth;
      const ignored = '.video-background,.sr-only,.honeypot,.whatsapp-sticky,.contact-overlay';
      const outside = [...document.querySelectorAll('body *')].filter(el => {
        if (el.matches(ignored) || el.closest('.video-background,.sr-only,.honeypot,.contact-overlay')) return false;
        const style = getComputedStyle(el), rect = el.getBoundingClientRect();
        if (style.display === 'none' || style.visibility === 'hidden' || !rect.width || !rect.height || style.position === 'fixed') return false;
        return rect.left < -2 || rect.right > width + 2;
      }).map(el => ({ selector: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).join('.') : ''), left: Math.round(el.getBoundingClientRect().left), right: Math.round(el.getBoundingClientRect().right) })).slice(0,8);
      return { outside, direct: document.querySelectorAll('a[href^="https://wa.me/"],a[href^="https://api.whatsapp.com/"]').length, trigger: document.querySelectorAll('[data-whatsapp-trigger]').length, header: document.querySelector('.menu-toggle')?.getBoundingClientRect().right <= width + 2, services: document.querySelectorAll('.serv-card').length };
    })()`);
    if (result.outside.length || result.direct || !result.trigger || !result.header) failures.push({ width, height, route, ...result });
    if (width === 390 && route === "/magia-blanca/") {
      serviceObservation = { cards: result.services, fallback: result.services === 0 };
      if (process.env.QA_SERVICE_ONLY && !result.services) failures.push({ serviceObservation, reason: "Firestore no cargó servicios" });
      if (process.env.QA_SERVICE_ONLY && result.services) {
        const service = await evaluate(`(() => { const cta = document.querySelector('.serv-card [data-whatsapp-trigger]'); window.__events = []; window.umami = { track: (name, payload) => window.__events.push({ name, payload }) }; const context = { name: cta.dataset.serviceName, ctaText: cta.dataset.ctaText || '', category: cta.dataset.category, location: cta.dataset.ctaLocation }; cta.click(); const opened = !document.querySelector('.contact-overlay').hidden; const area = document.querySelector('#contact-case'); area.value = 'Quiero saber si este servicio ayuda a mi situación.'; document.querySelector('.contact-dialog form').requestSubmit(); return { context, opened, events: window.__events }; })()`);
        await pause(500);
        const url = outbound.at(-1);
        const text = url && new URL(url).searchParams.get("text");
        serviceObservation = { ...serviceObservation, context: service.context, opened: service.opened, outbound: Boolean(url), messageHasService: Boolean(text?.includes(service.context.name)), messageHasCase: Boolean(text?.includes("Quiero saber si este servicio ayuda a mi situación.")), events: service.events.map((item) => item.name), analyticsContainsCase: service.events.some((item) => JSON.stringify(item.payload).includes("Quiero saber")) };
        if (!serviceObservation.opened || !serviceObservation.outbound || !serviceObservation.messageHasCase || !serviceObservation.messageHasService || serviceObservation.analyticsContainsCase || serviceObservation.events.join(",") !== "nav_cta,service_wa,wa_open,wa_case_valid,wa_outbound") failures.push({ serviceObservation });
      }
    }
    if (width <= 430 && route === "/") {
      const menu = await evaluate(`(() => { const toggle = document.querySelector('[data-menu-toggle]'); toggle.click(); const open = toggle.getAttribute('aria-expanded') === 'true' && getComputedStyle(document.querySelector('[data-side-nav]')).display !== 'none'; toggle.click(); return { open, closed: toggle.getAttribute('aria-expanded') === 'false' }; })()`);
      if (!menu.open || !menu.closed) failures.push({ width, route, menu });
      const modal = await evaluate(`(() => { document.querySelector('.hero [data-whatsapp-trigger]').click(); const box = document.querySelector('.contact-dialog').getBoundingClientRect(); const empty = document.querySelector('.contact-dialog form'); empty.requestSubmit(); return { open: !document.querySelector('.contact-overlay').hidden, error: !document.querySelector('#contact-error').hidden, left: box.left, right: box.right, top: box.top, bottom: box.bottom, sticky: getComputedStyle(document.querySelector('.whatsapp-sticky')).display }; })()`);
      if (!modal.open || !modal.error || modal.left < -2 || modal.right > width + 2 || modal.bottom > height + 2 || modal.sticky !== "none") failures.push({ width, route, modal });
      if (width === 320) {
        await call("Emulation.setDeviceMetricsOverride", { width, height: 320, deviceScaleFactor: 1, mobile: true });
        await pause(100);
        const keyboard = await evaluate(`(() => { const panel = document.querySelector('.contact-dialog'); panel.scrollTop = panel.scrollHeight; return { buttonBottom: document.querySelector('.contact-dialog [type="submit"]').getBoundingClientRect().bottom, viewport: innerHeight }; })()`);
        if (keyboard.buttonBottom > keyboard.viewport + 2) failures.push({ width, route, keyboard });
        await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: true });
      }
      const cancel = await evaluate(`(() => { document.querySelector('[data-contact-cancel]').click(); return { closed: document.querySelector('.contact-overlay').hidden, focus: document.activeElement === document.querySelector('.hero [data-whatsapp-trigger]') }; })()`);
      if (!cancel.closed || !cancel.focus) failures.push({ width, route, cancel });
      const keyboardClose = await evaluate(`(() => { const trigger = document.querySelector('.hero [data-whatsapp-trigger]'); trigger.click(); const area = document.querySelector('#contact-case'); area.focus(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })); const trapped = document.activeElement === document.querySelector('.contact-dialog [type="submit"]'); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); return { trapped, closed: document.querySelector('.contact-overlay').hidden, focus: document.activeElement === trigger }; })()`);
      if (!keyboardClose.trapped || !keyboardClose.closed || !keyboardClose.focus) failures.push({ width, route, keyboardClose });
      if (width === 390) {
        const names = await evaluate(`(() => { window.__events = []; window.umami = { track: (name, payload) => window.__events.push({ name, payload }) }; document.querySelector('.whatsapp-sticky [data-whatsapp-trigger]').click(); const area = document.querySelector('#contact-case'); area.value = '   '; document.querySelector('.contact-dialog form').requestSubmit(); area.value = 'Necesito ayuda con mi situación personal y laboral.'; document.querySelector('.contact-dialog form').requestSubmit(); return window.__events.map(item => item.name); })()`);
        await pause(500);
        const url = outbound.at(-1);
        if (!url || !new URL(url).searchParams.get("text")?.includes("Necesito ayuda con mi situación personal y laboral.") || names.join(",") !== "nav_cta,wa_open,wa_case_valid,wa_outbound") failures.push({ width, route, outbound: Boolean(url), names });
      }
    }
  }
}
await call("Emulation.setScriptExecutionDisabled", { value: true });
await call("Page.navigate", { url: `${origin}/faq/` });
await pause(350);
await call("Emulation.setScriptExecutionDisabled", { value: false });
const noJsFallback = await evaluate(`({ tag: document.querySelector('[data-whatsapp-trigger]')?.tagName, type: document.querySelector('[data-whatsapp-trigger]')?.getAttribute('type'), formLinks: document.querySelectorAll('[data-whatsapp-trigger][href*="#formulario"]').length, direct: document.querySelectorAll('a[href^="https://wa.me/"]').length })`);
if (noJsFallback.tag !== "BUTTON" || noJsFallback.type !== "button" || noJsFallback.formLinks || noJsFallback.direct) failures.push({ noJsFallback });
ws.close();
console.log(JSON.stringify({ viewports: sizes.length, routes: routes.length, checks: sizes.length * routes.length, serviceObservation, noJsFallback, failures }, null, 2));
if (failures.length) process.exitCode = 1;
