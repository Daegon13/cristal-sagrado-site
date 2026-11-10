import assert from "node:assert/strict";
import snapshot from "../src/data/generated/services.public.json" with { type: "json" };
import proposals from "../docs/PROPUESTAS_COPY_3_0.json" with { type: "json" };
import { selectedServices } from "../src/lib/seo-services.js";

const origin = process.env.QA_ORIGIN || "http://127.0.0.1:4322";
const debuggerUrl = process.env.QA_CHROME || "http://127.0.0.1:9231";
const targets = await (await fetch(`${debuggerUrl}/json/list`)).json();
const target = targets.find((item) => item.type === "page");
assert.ok(target, "Chrome QA no tiene pestaña");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener("open", resolve, { once: true }); ws.addEventListener("error", reject, { once: true }); });
let nextId = 0;
const pending = new Map();
const firestoreRequests = [];
const exceptions = [];
ws.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === "Network.requestWillBeSent" && /firestore\.googleapis\.com/.test(message.params.request.url)) firestoreRequests.push(message.params.request);
  if (message.method === "Runtime.exceptionThrown") exceptions.push(message.params.exceptionDetails.text);
  const job = pending.get(message.id);
  if (!job) return;
  pending.delete(message.id);
  message.error ? job.reject(Error(message.error.message)) : job.resolve(message.result);
});
const call = (method, params = {}) => new Promise((resolve, reject) => { const id = ++nextId; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
};
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await call("Page.enable");
await call("Runtime.enable");
await call("Network.enable");
const source = new Map(snapshot.services.map((item) => [item.id, item]));
const proposed = new Map(proposals.services.map((item) => [item.id, item.proposed]));
const counts = { roja: 18, blanca: 20, negra: 5, verde: 9 };
for (const width of [320, 390, 430, 1366]) {
  await call("Emulation.setDeviceMetricsOverride", { width, height: 844, deviceScaleFactor: 1, mobile: width < 768 });
  for (const [category, expected] of Object.entries(counts)) {
    await call("Page.navigate", { url: `${origin}/magia-${category}/` });
    await pause(1000);
    const state = await evaluate(`(() => ({ cards: [...document.querySelectorAll('.serv-card[data-id]')].map(card => ({ id: card.dataset.id, name: card.querySelector('.serv-title')?.textContent, price: card.querySelector('.serv-price')?.textContent, short: card.querySelector('.serv-desc')?.textContent, long: card.querySelector('.serv-long')?.textContent, longHidden: card.querySelector('.serv-long')?.hidden, intent: [...card.querySelectorAll('.serv-intent-chip')].map(x => x.textContent), idealFor: [...card.querySelectorAll('.serv-ideal-for li')].map(x => x.textContent), benefits: [...card.querySelectorAll('.serv-benefits li')].map(x => x.textContent), notFor: [...card.querySelectorAll('.serv-not-for li')].map(x => x.textContent) })), overflow: document.documentElement.scrollWidth > innerWidth + 2, preview: !!document.querySelector('.copy-preview-control') }))()`);
    assert.equal(state.cards.length, expected, `${width} ${category}: cantidad`);
    assert.equal(state.overflow, false, `${width} ${category}: desbordamiento`);
    assert.equal(state.preview, false, `${width} ${category}: sin selector`);
    for (const card of state.cards) {
      const original = source.get(card.id);
      const copy = proposed.get(card.id);
      assert.ok(original && copy, `${category}: ID ${card.id}`);
      assert.equal(original.category, category);
      assert.equal(card.name.trim(), original.name.trim());
      assert.equal(card.price, `$${original.price}`);
      assert.equal(card.short, copy.descriptionShort);
      assert.equal(card.long, copy.descriptionLong);
      assert.equal(card.longHidden, true);
      for (const field of ["intent", "idealFor", "benefits", "notFor"]) assert.deepEqual(card[field], copy[field]);
    }
    const interaction = await evaluate(`(() => { const card = document.querySelector('.serv-card'); const button = card.querySelector('.serv-toggle'); button.click(); const expanded = card.querySelector('.serv-long')?.hidden === false; const search = document.querySelector('#buscador-servicios'); search.value = 'zz-no-existe-zz'; search.dispatchEvent(new Event('input')); const filtered = [...document.querySelectorAll('.serv-card')].every(x => x.hidden); search.value = ''; search.dispatchEvent(new Event('input')); return { expanded, filtered, restored: [...document.querySelectorAll('.serv-card')].every(x => !x.hidden) }; })()`);
    assert.deepEqual(interaction, { expanded: true, filtered: true, restored: true });
  }
}
for (const entry of selectedServices(snapshot)) {
  await call("Page.navigate", { url: `${origin}${entry.path}` });
  await pause(250);
  const state = await evaluate(`(() => ({ lead: document.querySelector('.seo-lead')?.textContent, long: document.querySelector('.seo-service-copy')?.textContent, price: document.querySelector('section[aria-labelledby="datos"] dd')?.textContent, preview: !!document.querySelector('.copy-preview-control') }))()`);
  assert.equal(state.lead, proposed.get(entry.id).descriptionShort, entry.path);
  assert.equal(state.long, proposed.get(entry.id).descriptionLong, entry.path);
  assert.equal(state.price, `$${source.get(entry.id).price}`, entry.path);
  assert.equal(state.preview, false, entry.path);
}
assert.ok(firestoreRequests.length > 0, "Se esperaba actualización dinámica desde Firestore");
assert.ok(firestoreRequests.every((request) => request.method === "POST" || request.method === "GET"), "Solo lecturas públicas");
assert.ok(firestoreRequests.every((request) => !/:commit|:batchWrite|Write\/channel/i.test(request.url)), "Sin endpoints de escritura Firestore");
assert.deepEqual(exceptions, [], "Sin excepciones JavaScript");
ws.close();
console.log(`Copy oficial: 52 IDs, 4 categorías, 4 anchos, 10 fichas SEO, expansión, búsqueda y precios OK; ${firestoreRequests.length} consultas Firestore`);
