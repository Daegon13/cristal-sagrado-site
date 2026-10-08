// QA local no destructiva: Astro preview + Chrome con remote-debugging-port.
import assert from "node:assert/strict";
import snapshot from "../src/data/generated/services.public.json" with { type: "json" };
import { selectedServicePaths } from "../src/lib/seo-services.js";
import { seoGuides } from "../src/data/seo-guides.js";

const origin = process.env.QA_ORIGIN || "http://127.0.0.1:4321";
const debuggerUrl = process.env.QA_CHROME || "http://127.0.0.1:9229";
const paths = ["/", "/magia-blanca/", "/magia-roja/", "/magia-negra/", "/magia-verde/", "/tarot/", "/faq/", "/como-trabajamos/", "/guias/", ...seoGuides.map((guide) => `/guias/${guide.slug}/`), ...selectedServicePaths(snapshot)];
const oldPaths = ["faq.html", "como-trabajamos.html", "magia-blanca.html", "magia-roja.html", "magia-negra.html", "magia-verde.html", "tarot.html", "servicios.html"];

for (const path of [...paths, "/admin/", ...oldPaths.map((item) => `/${item}`)]) {
  const response = await fetch(`${origin}${path}`, { redirect: "manual" });
  assert.equal(response.status, 200, `HTTP ${path}`);
}

const targets = await (await fetch(`${debuggerUrl}/json/list`)).json();
const page = targets.find((target) => target.type === "page");
assert.ok(page, "Chrome debe tener una página de QA");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener("open", resolve, { once: true }); ws.addEventListener("error", reject, { once: true }); });
let id = 0;
const pending = new Map();
const outbound = [];
ws.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === "Network.requestWillBeSent" && message.params.request.url.startsWith("https://wa.me/")) outbound.push(message.params.request.url);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  message.error ? reject(Error(message.error.message)) : resolve(message.result);
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const key = ++id;
  pending.set(key, { resolve, reject });
  ws.send(JSON.stringify({ id: key, method, params }));
});
const evaluate = async (expression) => {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
};
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await call("Page.enable");
await call("Runtime.enable");
await call("Network.enable");
await call("Network.setBlockedURLs", { urls: ["*://wa.me/*", "*://formspree.io/*"] });

for (const width of [390, 1440]) {
  await call("Emulation.setDeviceMetricsOverride", { width, height: width === 390 ? 844 : 900, deviceScaleFactor: 1, mobile: width === 390 });
  for (const path of paths) {
    await call("Page.navigate", { url: `${origin}${path}` });
    await pause(path.startsWith("/magia-") && path.split("/").length === 3 ? 500 : 120);
    const state = await evaluate(`(() => ({ path: location.pathname, h1: document.querySelectorAll('h1').length, overflow: document.documentElement.scrollWidth > innerWidth + 2, trigger: document.querySelectorAll('[data-whatsapp-trigger]').length, oldCss: document.querySelectorAll('link[href*="/css/"]').length, video: document.querySelectorAll('video,source[src*="Eclipse_small"]').length }))()`);
    assert.equal(state.path, path, `Ruta Chrome ${path}`);
    assert.equal(state.h1, 1, `H1 ${path}`);
    assert.equal(state.overflow, false, `Overflow ${width} ${path}`);
    assert.ok(state.trigger > 0, `WhatsApp CTA ${path}`);
    assert.equal(state.oldCss, 0, `CSS legacy ${path}`);
    assert.equal(state.video, 0, `Video legacy ${path}`);
  }
}

await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await call("Page.navigate", { url: `${origin}/` });
await pause(250);
const home = await evaluate(`(() => { const form=document.querySelector('#formulario'); form.requestSubmit(); const invalid=[...form.querySelectorAll('[aria-invalid="true"]')].length; const cta=document.querySelector('.hero [data-whatsapp-trigger]'); cta.click(); const open=!document.querySelector('.contact-overlay').hidden; document.querySelector('.contact-dialog form').requestSubmit(); const error=!document.querySelector('#contact-error').hidden; document.querySelector('[data-contact-cancel]').click(); return { form:form.action, invalid, open, error, closed:document.querySelector('.contact-overlay').hidden, direct:document.querySelectorAll('a[href^="https://wa.me/"]').length }; })()`);
assert.ok(home.form.startsWith("https://formspree.io/"));
assert.ok(home.invalid > 0 && home.open && home.error && home.closed);
assert.equal(home.direct, 0);
const conversion = await evaluate(`(() => { window.__qaEvents=[]; window.umami={track:(name,data)=>window.__qaEvents.push({name,data})}; const cta=document.querySelector('.hero [data-whatsapp-trigger]'); cta.click(); const area=document.querySelector('#contact-case'); area.value='Quiero orientación sobre mi situación actual.'; document.querySelector('.contact-dialog form').requestSubmit(); return window.__qaEvents; })()`);
await pause(250);
assert.ok(outbound.at(-1)?.includes("wa.me/"), "Salida WhatsApp tras caso válido");
assert.deepEqual(conversion.map((item) => item.name), ["nav_cta", "wa_open", "wa_case_valid", "wa_outbound"]);
assert.ok(!JSON.stringify(conversion).includes("Quiero orientación"), "Caso fuera de analytics");

await call("Page.navigate", { url: `${origin}/magia-verde/` });
await pause(1500);
const category = await evaluate(`(() => { const cards=document.querySelectorAll('.serv-card').length; const input=document.querySelector('#buscador-servicios'); input.value='zzzz_sin_resultado'; input.dispatchEvent(new Event('input',{bubbles:true})); const empty=!document.querySelector('.serv-search-empty')?.hidden; input.value=''; input.dispatchEvent(new Event('input',{bubbles:true})); return { cards, empty, restored:[...document.querySelectorAll('.serv-card')].every(card=>!card.hidden), seoLink:!!document.querySelector('.serv-card a[href*="/magia-verde/"]') }; })()`);
assert.ok(category.cards > 0 && category.empty && category.restored && category.seoLink, JSON.stringify(category));

await call("Page.navigate", { url: `${origin}/admin/` });
await pause(300);
const admin = await evaluate(`({ title:document.title, login:!!document.querySelector('#authOverlay #formLogin'), publicFlow:!!document.querySelector('.contact-overlay') })`);
assert.ok(admin.title.includes("Administración"));
assert.equal(admin.login, true);
assert.equal(admin.publicFlow, false);
ws.close();
console.log(JSON.stringify({ httpRoutes: paths.length + oldPaths.length + 1, browserRoutes: paths.length * 2, home, category, admin, status: "PASS" }, null, 2));
