// Run against local Astro preview and headless Chrome remote debugging on port 9231.
const origin = process.env.QA_ORIGIN || "http://127.0.0.1:4321";
const endpoint = process.env.QA_CHROME || "http://127.0.0.1:9231";
const targets = await (await fetch(`${endpoint}/json/list`)).json();
const page = targets.find((target) => target.type === "page");
if (!page) throw Error("Chrome QA tab missing");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let nextId = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id) return;
  const job = pending.get(message.id);
  if (!job) return;
  pending.delete(message.id);
  message.error ? job.reject(Error(message.error.message)) : job.resolve(message.result);
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const widths = [320, 360, 390, 430, 768, 1024, 1366, 1440];
const routes = ["/", "/tarot/", "/magia-blanca/", "/magia-roja/", "/magia-negra/", "/magia-verde/", "/faq/", "/como-trabajamos/"];
const failures = [];
await call("Page.enable");
await call("Runtime.enable");
for (const width of widths) {
  await call("Emulation.setDeviceMetricsOverride", { width, height: width < 768 ? 844 : 900, deviceScaleFactor: 1, mobile: width < 960 });
  for (const route of routes) {
    await call("Page.navigate", { url: `${origin}${route}` });
    await new Promise((resolve) => setTimeout(resolve, route.includes("magia-") ? 700 : 300));
    const result = await call("Runtime.evaluate", { returnByValue: true, expression: `(() => {
      const viewport = document.documentElement.clientWidth;
      const links = [...document.querySelectorAll('.button, .whatsapp-sticky__button, .serv-cta')].filter(el => getComputedStyle(el).display !== 'none');
      const wrapped = links.filter(el => {
        const range = document.createRange(); range.selectNodeContents(el);
        const rects = [...range.getClientRects()].filter(rect => rect.width > 1 && rect.height > 1);
        return rects.length > 1 && Math.max(...rects.map(rect => rect.bottom)) - Math.min(...rects.map(rect => rect.top)) > parseFloat(getComputedStyle(el).lineHeight) * 1.7;
      }).map(el => el.textContent.trim());
      const sticky = document.querySelector('.whatsapp-sticky__button')?.getBoundingClientRect();
      return { h1: document.querySelectorAll('h1').length, overflow: document.documentElement.scrollWidth - viewport,
        wrapped, stickyHeight: sticky?.height || 0, directWhatsApp: document.querySelectorAll('a[href^="https://wa.me/"],a[href^="https://api.whatsapp.com/"]').length,
        triggers: document.querySelectorAll('[data-whatsapp-trigger]').length };
    })()` });
    if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
    const state = result.result.value;
    if (state.h1 !== 1 || state.overflow > 1 || state.wrapped.length || state.stickyHeight > 70 || state.directWhatsApp || !state.triggers) failures.push({ width, route, ...state });
  }
}
await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await call("Page.navigate", { url: origin });
await new Promise((resolve) => setTimeout(resolve, 400));
const interaction = await call("Runtime.evaluate", { returnByValue: true, expression: `(() => {
  const form = document.querySelector('#formulario');
  form.querySelector('[type="submit"]').click();
  const formBlocksEmpty = form.querySelector('#nombre-error').hidden === false;
  document.querySelector('.hero [data-whatsapp-trigger]').click();
  const overlay = document.querySelector('.contact-overlay');
  const opens = !overlay.hidden;
  overlay.querySelector('[type="submit"]').click();
  const caseBlocksEmpty = overlay.querySelector('#contact-error').hidden === false && !overlay.hidden;
  overlay.querySelector('[data-contact-cancel]').click();
  return { formBlocksEmpty, opens, caseBlocksEmpty, closes: overlay.hidden };
})()` });
if (interaction.exceptionDetails) throw Error(interaction.exceptionDetails.text);
if (Object.values(interaction.result.value).some((value) => value !== true)) failures.push({ interaction: interaction.result.value });
socket.close();
console.log(JSON.stringify({ checked: widths.length * routes.length, widths, routes, interaction: interaction.result.value, failures }, null, 2));
if (failures.length) process.exitCode = 1;
