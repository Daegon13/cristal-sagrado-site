// QA local del preview con Chrome headless y protocolo DevTools.
import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";

const origin = process.env.QA_ORIGIN || "http://127.0.0.1:4321";
const debuggerUrl = process.env.QA_CHROME || "http://127.0.0.1:9229";
const pages = await (await fetch(`${debuggerUrl}/json/list`)).json();
const page = pages.find((item) => item.type === "page");
assert.ok(page, "Chrome no tiene pestaña disponible");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener("open", resolve, { once: true }); ws.addEventListener("error", reject, { once: true }); });
let id = 0;
const pending = new Map();
ws.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id) return;
  const task = pending.get(message.id);
  if (!task) return;
  pending.delete(message.id);
  message.error ? task.reject(new Error(message.error.message)) : task.resolve(message.result);
});
const call = (method, params = {}) => new Promise((resolve, reject) => { const key = ++id; pending.set(key, { resolve, reject }); ws.send(JSON.stringify({ id: key, method, params })); });
const evaluate = async (expression) => {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
};
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const screenshot = async (name) => {
  if (!process.env.QA_SCREENSHOT_DIR) return;
  await mkdir(process.env.QA_SCREENSHOT_DIR, { recursive: true });
  const image = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(`${process.env.QA_SCREENSHOT_DIR}/${name}.png`, Buffer.from(image.data, "base64"));
};
await call("Page.enable");
await call("Runtime.enable");
await call("Network.enable");
await call("Page.addScriptToEvaluateOnNewDocument", { source: "window.__qaEvents = []; window.umami = { track: (name, data) => window.__qaEvents.push({ name, data }) };" });
await call("Network.setBlockedURLs", { urls: ["*://wa.me/*"] });
const bookRoutes = ["/libros/habitar-lo-posible/", "/libros/brujeria-para-principiantes/", "/libros/el-umbral-de-cristal/"];
const routes = ["/", "/libros/", ...bookRoutes, "/magia-blanca/"];
for (const [width, height] of [[320, 568], [390, 844], [1440, 900]]) {
  await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 });
  for (const route of routes) {
    await call("Page.navigate", { url: `${origin}${route}` });
    await pause(route.includes("magia-") ? 1200 : 350);
    const state = await evaluate(`(() => ({ title: document.title, h1: document.querySelectorAll('h1').length, overflow: document.documentElement.scrollWidth > innerWidth + 2, navBooks: [...document.querySelectorAll('header a')].some(a => a.pathname === '/libros/'), modalTrigger: [...document.querySelectorAll('[data-whatsapp-trigger]')].some(a => a.getClientRects().length > 0), comingSoon: document.querySelector('.book-detail__intro .book-pill')?.textContent.trim(), coverPath: document.querySelector('.book-cover--detail img')?.getAttribute('src'), samplePath: document.querySelector('[data-book-event="book_sample_download"]')?.getAttribute('href'), inquiry: document.querySelector('[data-book-event="book_interest_wa"]')?.href, purchaseCount: document.querySelectorAll('main [data-book-event="book_purchase_click"], main a[download]').length, sections: document.querySelectorAll('.book-editorial-section').length, events: window.__qaEvents?.map(item => item.name) || [] }))()`);
    assert.equal(state.h1, 1, `${width} ${route}: h1`);
    assert.equal(state.overflow, false, `${width} ${route}: scroll horizontal`);
    assert.equal(state.navBooks, true, `${width} ${route}: acceso a Libros`);
    assert.equal(state.modalTrigger, !route.startsWith("/libros/"), `${width} ${route}: flujo de contacto correspondiente`);
    if (bookRoutes.includes(route)) {
      const slug = route.split("/")[2];
      assert.equal(state.comingSoon, "PRÓXIMAMENTE", `${route}: estado`);
      assert.equal(state.coverPath, `/images/libros/${slug}-portada.webp`, `${route}: portada`);
      assert.equal(state.samplePath, `/muestras/${slug}-muestra.pdf`, `${route}: muestra`);
      assert.match(state.inquiry, /https:\/\/wa\.me\/59896106373\?text=/, `${route}: consulta editorial`);
      assert.equal(state.purchaseCount, 0, `${route}: sin pago u original`);
      assert.equal(state.sections, 2, `${route}: contenido editorial e índice`);
      assert.deepEqual(state.events, ["book_view"], `${route}: vista editorial`);
      if (width === 390) {
        const clicks = await evaluate(`(() => { for (const eventName of ['book_sample_download', 'book_interest_wa']) { const link = document.querySelector('[data-book-event="' + eventName + '"]'); link.addEventListener('click', e => e.preventDefault(), { capture: true, once: true }); link.click(); } return window.__qaEvents.map(item => item.name); })()`);
        assert.deepEqual(clicks.filter((name) => name.startsWith("book_")), ["book_view", "book_sample_download", "book_interest_wa"], `${route}: eventos editoriales`);
      }
    }
    if (width === 390 && ["/", "/libros/", ...bookRoutes].includes(route)) await screenshot(route === "/" ? "home-390" : route === "/libros/" ? "libros-390" : `${route.split("/")[2]}-390`);
    if (width === 1440 && route === "/libros/habitar-lo-posible/") await screenshot("habitar-1440");
  }
}
for (const route of bookRoutes) {
  const slug = route.split("/")[2];
  const response = await fetch(`${origin}/muestras/${slug}-muestra.pdf`, { method: "HEAD" });
  assert.equal(response.status, 200, `${slug}: HTTP de muestra`);
  assert.match(response.headers.get("content-type") || "", /application\/pdf/i, `${slug}: tipo MIME`);
}
await call("Page.navigate", { url: `${origin}/` });
await pause(400);
const spiritual = await evaluate(`(() => { window.__qaEvents = []; window.umami = { track: (name, data) => window.__qaEvents.push({ name, data }) }; const trigger = document.querySelector('.hero [data-whatsapp-trigger]'); trigger.click(); const area = document.querySelector('#contact-case'); const opened = !document.querySelector('.contact-overlay').hidden; document.querySelector('.contact-dialog form').requestSubmit(); const error = !document.querySelector('#contact-error').hidden; area.value = 'Necesito orientación sobre mi situación laboral.'; document.querySelector('.contact-dialog form').requestSubmit(); document.querySelector('.contact-dialog form').requestSubmit(); window.stop(); return { opened, error, events: window.__qaEvents.map(x => x.name), leaks: window.__qaEvents.some(x => JSON.stringify(x.data).includes('Necesito orientación')), disabled: document.querySelector('.contact-dialog [type="submit"]').disabled }; })()`);
assert.equal(spiritual.opened, true);
assert.equal(spiritual.error, true);
assert.equal(spiritual.leaks, false);
assert.equal(spiritual.disabled, true, "evita envío duplicado durante el intento");
assert.deepEqual(spiritual.events, ["nav_cta", "wa_open", "wa_validation_error", "wa_case_valid", "wa_outbound"]);
await pause(2700);
const timerRecovery = await evaluate(`(() => { const trigger = document.querySelector('.hero [data-whatsapp-trigger]'); const enabled = !document.querySelector('.contact-dialog [type="submit"]').disabled; trigger.click(); const reopened = !document.querySelector('.contact-overlay').hidden; document.body.classList.add('keyboard-open'); document.querySelector('[data-contact-cancel]').click(); window.dispatchEvent(new Event('resize')); return { enabled, reopened, closed: document.querySelector('.contact-overlay').hidden, keyboardClassCleared: !document.body.classList.contains('keyboard-open') }; })()`);
assert.deepEqual(timerRecovery, { enabled: true, reopened: true, closed: true, keyboardClassCleared: true });
const focusAttempt = await evaluate(`(() => { const trigger = document.querySelector('.hero [data-whatsapp-trigger]'); trigger.click(); const area = document.querySelector('#contact-case'); area.value = 'Necesito orientación sobre mi situación laboral.'; document.querySelector('.contact-dialog form').requestSubmit(); window.stop(); return document.querySelector('.contact-dialog [type="submit"]').disabled; })()`);
assert.equal(focusAttempt, true);
await pause(500);
const focusRecovery = await evaluate(`(() => { window.dispatchEvent(new Event('focus')); const enabled = !document.querySelector('.contact-dialog [type="submit"]').disabled; document.querySelector('.hero [data-whatsapp-trigger]').click(); const reopened = !document.querySelector('.contact-overlay').hidden; document.querySelector('[data-contact-cancel]').click(); return { enabled, reopened, keyboardClassCleared: !document.body.classList.contains('keyboard-open') }; })()`);
assert.deepEqual(focusRecovery, { enabled: true, reopened: true, keyboardClassCleared: true });
await call("Emulation.setScriptExecutionDisabled", { value: true });
await call("Page.navigate", { url: `${origin}/faq/` });
await pause(300);
const fallback = await evaluate(`(() => { const link = document.querySelector('[data-whatsapp-trigger]'); return { tag: link.tagName, href: link.getAttribute('href'), form: Boolean(document.querySelector('#formulario')) }; })()`);
assert.equal(fallback.tag, "A");
assert.equal(fallback.href, "/#formulario");
await call("Page.navigate", { url: `${origin}/` });
await pause(300);
const noJsForm = await evaluate(`(() => ({ form: Boolean(document.querySelector('#formulario')), caseRequired: document.querySelector('#mensaje')?.required, contactRequired: document.querySelector('#contacto-campo')?.required }))()`);
assert.deepEqual(noJsForm, { form: true, caseRequired: true, contactRequired: true });
await call("Emulation.setScriptExecutionDisabled", { value: false });
ws.close();
console.log(JSON.stringify({ viewports: 3, routes: routes.length, spiritual, timerRecovery, focusRecovery, fallback, noJsForm, screenshots: process.env.QA_SCREENSHOT_DIR || null }, null, 2));
