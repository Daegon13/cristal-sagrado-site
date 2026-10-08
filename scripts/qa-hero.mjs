// Run against `npm run preview` with Chrome remote debugging on port 9231.
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const origin = process.env.QA_ORIGIN || "http://127.0.0.1:4321";
const targets = await (await fetch(process.env.QA_CHROME || "http://127.0.0.1:9231/json/list")).json();
const page = targets.find((target) => target.type === "page");
if (!page) throw Error("Chrome QA tab missing");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener("open", resolve, { once: true }); ws.addEventListener("error", reject, { once: true }); });
let id = 0;
const pending = new Map();
let requests = [];
ws.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === "Network.requestWillBeSent") requests.push(message.params.request.url);
  if (!message.id) return;
  const item = pending.get(message.id);
  if (!item) return;
  pending.delete(message.id);
  message.error ? item.reject(Error(message.error.message)) : item.resolve(message.result);
});
const call = (method, params = {}) => new Promise((resolve, reject) => {
  const current = ++id;
  pending.set(current, { resolve, reject });
  ws.send(JSON.stringify({ id: current, method, params }));
});
async function evaluate(expression) {
  const result = await call("Runtime.evaluate", { expression, returnByValue: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
  return result.result.value;
}
await call("Page.enable");
await call("Runtime.enable");
await call("Network.enable");
const sizes = [[320,568],[360,640],[375,667],[390,844],[393,852],[412,915],[430,932],[959,768],[960,720],[1024,768],[1366,768],[1440,900],[1920,1080]];
const results = [];
for (const [width,height] of sizes) {
  await call("Emulation.setDeviceMetricsOverride", { width,height,deviceScaleFactor:1,mobile:width<960 });
  requests = [];
  await call("Page.navigate", { url: `${origin}/` });
  await new Promise((resolve) => setTimeout(resolve, 700));
  const layout = await evaluate(`(() => {
    const hero=document.querySelector('.hero'), panel=document.querySelector('.hero__content'), cta=hero.querySelector('.button--primary'), sticky=document.querySelector('.whatsapp-sticky');
    const rect=(node)=>{const r=node.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height}};
    return {bg:getComputedStyle(hero).backgroundImage,hero:rect(hero),panel:rect(panel),cta:rect(cta),sticky:rect(sticky),overflow:document.documentElement.scrollWidth>innerWidth,viewport:innerWidth};
  })()`);
  const assets = requests.filter((url) => /hero-ritual|Eclipse_small/.test(url)).map((url) => new URL(url).pathname);
  const expected = width < 960 ? "/hero-ritual-mobile.webp" : "/hero-ritual-desktop.webp";
  const pass = assets.length === 1 && assets[0] === expected && layout.bg.includes(expected) && !layout.overflow && layout.panel.left >= 0 && layout.panel.right <= width && layout.cta.left >= 0 && layout.cta.right <= width && layout.panel.bottom <= layout.hero.bottom + 1;
  if ([320,390,960,1366,1920].includes(width)) {
    const shot = await call("Page.captureScreenshot", { format:"png",captureBeyondViewport:false });
    await writeFile(join(tmpdir(), `cristal-hero-${width}.png`), Buffer.from(shot.data,"base64"));
  }
  results.push({width,height,assets,pass,layout});
}
const secondary = [];
for (const route of ["magia-blanca", "magia-negra", "magia-roja", "magia-verde", "tarot", "faq", "como-trabajamos"]) {
  requests = [];
  await call("Page.navigate", { url: `${origin}/${route}/` });
  await new Promise((resolve) => setTimeout(resolve, 700));
  secondary.push({route,assets:requests.filter((url) => /hero-ritual|Eclipse_small/.test(url))});
}
ws.close();
console.log(JSON.stringify({results,secondary},null,2));
if (results.some((result) => !result.pass) || secondary.some((route) => route.assets.length)) process.exitCode = 1;
