// Requiere Astro preview en 4321 y Chrome con --remote-debugging-port=9231.
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const origin = process.env.QA_ORIGIN || "http://127.0.0.1:4321";
const debuggerUrl = process.env.QA_CHROME || "http://127.0.0.1:9231";
const targets = await (await fetch(`${debuggerUrl}/json/list`)).json();
const page = targets.find((target) => target.type === "page");
if (!page) throw new Error("Chrome no tiene una pestaÃ±a de QA");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.addEventListener("open", resolve, { once: true }); ws.addEventListener("error", reject, { once: true }); });
let nextId = 0;
const pending = new Map();
ws.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
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
  if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const smoke = Boolean(process.env.QA_HEADER_SMOKE);
const sizes = smoke ? [[390,844]] : [[320,568],[360,640],[375,667],[390,844],[393,852],[412,915],[430,932],[768,1024],[1024,768],[1366,768],[1440,900]];
const routes = smoke ? ["/"] : ["/", "/tarot/", "/magia-blanca/", "/faq/", "/como-trabajamos/"];
const scrollStates = [0,.25,.5,.75,1];
const failures = [];
const snapshots = [];
let checks = 0;
const counts = {};
await call("Page.enable");
await call("Runtime.enable");
await call("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
for (const [width, height] of sizes) {
  await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 960 });
  for (const route of routes) {
    await call("Page.navigate", { url: `${origin}${route}` });
    await pause(route.includes("magia-") ? 1200 : 350);
    await evaluate(`document.documentElement.style.scrollBehavior = 'auto'`);
    const mobile = width < 960;
    for (const fraction of mobile ? scrollStates : [0,.5,1]) {
      await evaluate(`window.scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * ${fraction}))`);
      await pause(120);
      const state = await evaluate(`(() => {
        const header = document.querySelector('.site-header');
        const button = document.querySelector('.menu-toggle');
        const hr = header.getBoundingClientRect(), br = button.getBoundingClientRect();
        const x = br.left + br.width/2, y = br.top + br.height/2;
        const top = document.elementFromPoint(x,y);
        const style = getComputedStyle(button);
        const label = element => element ? element.tagName.toLowerCase() + (element.className && typeof element.className === 'string' ? '.' + element.className.trim().split(/\\s+/).join('.') : '') : null;
        return { scrollY, viewport: innerWidth, visualWidth: visualViewport?.width || innerWidth, visualOffset: visualViewport?.offsetLeft || 0,
          header: {left:hr.left,right:hr.right,top:hr.top,width:hr.width,z:getComputedStyle(header).zIndex},
          button: {left:br.left,right:br.right,top:br.top,bottom:br.bottom,width:br.width,height:br.height,display:style.display,visibility:style.visibility,opacity:Number(style.opacity),pointerEvents:style.pointerEvents,z:style.zIndex},
          topElement:label(top),topPointerEvents:top ? getComputedStyle(top).pointerEvents : null,topZ:top ? getComputedStyle(top).zIndex : null,
          hit:top === button || button.contains(top), menu:getComputedStyle(document.querySelector('.mobile-menu')).display };
      })()`);
      checks++;
      counts[width] ??= {};
      counts[width][fraction] = (counts[width][fraction] || 0) + 1;
      if (mobile) {
        const { header, button } = state;
        if (header.left < -1 || header.right > width + 1 || button.left < 0 || button.right > width || button.top < 0 || button.bottom > height || button.width < 44 || button.height < 44 || button.display === "none" || button.visibility !== "visible" || button.opacity <= 0 || button.pointerEvents === "none" || !state.hit) failures.push({ width,height,route,fraction,state });
        if (process.env.QA_HEADER_SCREENSHOTS && route === "/" && [320,390,430].includes(width) && (fraction === 0 || fraction === .5)) {
          const image = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
          const path = join(tmpdir(), `cristal-header-${process.env.QA_HEADER_LABEL || "qa"}-${width}-${fraction === 0 ? "top" : "mid"}.png`);
          await writeFile(path, Buffer.from(image.data, "base64")); snapshots.push(path);
        }
        const x = button.left + button.width/2, y = button.top + button.height/2;
        await call("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x,y }] });
        await call("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await pause(80);
        const open = await evaluate(`(() => { const button=document.querySelector('.menu-toggle'), menu=document.querySelector('.mobile-menu'), rect=menu.getBoundingClientRect(); const target=document.elementFromPoint(rect.left+Math.min(30,rect.width/2),rect.top+Math.min(30,rect.height/2)); return {expanded:button.getAttribute('aria-expanded'),display:getComputedStyle(menu).display,left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,hit:menu.contains(target),sticky:getComputedStyle(document.querySelector('.whatsapp-sticky')).display}; })()`);
        if (open.expanded !== "true" || open.display === "none" || open.left < -1 || open.right > width + 1 || !open.hit || open.sticky !== "none") failures.push({ width,height,route,fraction,open });
        if (width === 320 && route === "/" && fraction === 0 && !smoke) {
          await call("Emulation.setDeviceMetricsOverride", { width, height: 320, deviceScaleFactor: 1, mobile: true });
          await pause(80);
          const shortMenu = await evaluate(`(() => { const menu=document.querySelector('.mobile-menu'); menu.scrollTop=menu.scrollHeight; return { scrollTop:menu.scrollTop, lastBottom:menu.querySelector('a[data-whatsapp-trigger]').getBoundingClientRect().bottom, viewport:innerHeight }; })()`);
          if (shortMenu.scrollTop <= 0 || shortMenu.lastBottom > shortMenu.viewport + 1) failures.push({width,route,shortMenu});
          await call("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: true });
        }
        if (process.env.QA_HEADER_SCREENSHOTS && route === "/" && [320,390,430].includes(width) && fraction === 0) {
          const image = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
          const path = join(tmpdir(), `cristal-header-${process.env.QA_HEADER_LABEL || "qa"}-${width}-menu.png`);
          await writeFile(path, Buffer.from(image.data, "base64")); snapshots.push(path);
        }
        await call("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x,y }] });
        await call("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        await pause(50);
        const closed = await evaluate(`({ expanded:document.querySelector('.menu-toggle').getAttribute('aria-expanded'), display:getComputedStyle(document.querySelector('.mobile-menu')).display, bodyPosition:getComputedStyle(document.body).position })`);
        if (closed.expanded !== "false" || closed.display !== "none" || closed.bodyPosition === "fixed") failures.push({ width,height,route,fraction,closed });
        if (fraction === 0) {
          const escape = await evaluate(`(() => { const button=document.querySelector('.menu-toggle'); button.click(); document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})); return {expanded:button.getAttribute('aria-expanded'),focus:document.activeElement===button,menu:getComputedStyle(document.querySelector('.mobile-menu')).display}; })()`);
          if (escape.expanded !== "false" || !escape.focus || escape.menu !== "none") failures.push({width,height,route,escape});
        }
      } else if (state.menu !== "none" || state.button.display !== "none" || state.header.left < -1 || state.header.right > width + 1) failures.push({width,height,route,fraction,state});
    }
  }
}
let breakpoint = null;
let modalRecovery = null;
if (!smoke) {
  await call("Emulation.setDeviceMetricsOverride", { width: 959, height: 768, deviceScaleFactor: 1, mobile: true });
  await call("Page.navigate", { url: `${origin}/` });
  await pause(350);
  const opened = await evaluate(`(() => { document.querySelector('.menu-toggle').click(); return document.querySelector('.menu-toggle').getAttribute('aria-expanded'); })()`);
  await call("Emulation.setDeviceMetricsOverride", { width: 960, height: 768, deviceScaleFactor: 1, mobile: false });
  await pause(100);
  const desktop = await evaluate(`({ expanded:document.querySelector('.menu-toggle').getAttribute('aria-expanded'),menu:getComputedStyle(document.querySelector('.mobile-menu')).display,toggle:getComputedStyle(document.querySelector('.menu-toggle')).display,nav:getComputedStyle(document.querySelector('.desktop-nav')).display })`);
  await call("Emulation.setDeviceMetricsOverride", { width: 959, height: 768, deviceScaleFactor: 1, mobile: true });
  await pause(100);
  const returned = await evaluate(`(() => { const button=document.querySelector('.menu-toggle'); const before=button.getAttribute('aria-expanded'); button.click(); return {before,after:button.getAttribute('aria-expanded'),menu:getComputedStyle(document.querySelector('.mobile-menu')).display}; })()`);
  breakpoint = {opened,desktop,returned};
  if (opened !== "true" || desktop.expanded !== "false" || desktop.menu !== "none" || desktop.toggle !== "none" || desktop.nav === "none" || returned.before !== "false" || returned.after !== "true" || returned.menu === "none") failures.push({breakpoint});

  await call("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await call("Page.navigate", { url: `${origin}/` });
  await pause(350);
  modalRecovery = await evaluate(`(() => { const trigger=document.querySelector('.whatsapp-sticky [data-whatsapp-trigger]'); trigger.click(); const opened=!document.querySelector('.contact-overlay').hidden; document.querySelector('[data-contact-cancel]').click(); const button=document.querySelector('.menu-toggle'),rect=button.getBoundingClientRect(),top=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2); return {opened,closed:document.querySelector('.contact-overlay').hidden,bodyPosition:getComputedStyle(document.body).position,hit:top===button||button.contains(top),button:{x:rect.left+rect.width/2,y:rect.top+rect.height/2}}; })()`);
  await call("Input.dispatchTouchEvent", { type:"touchStart",touchPoints:[modalRecovery.button] });
  await call("Input.dispatchTouchEvent", { type:"touchEnd",touchPoints:[] });
  await pause(80);
  modalRecovery.menuOpened = await evaluate(`document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'true'`);
  if (!modalRecovery.opened || !modalRecovery.closed || modalRecovery.bodyPosition === "fixed" || !modalRecovery.hit || !modalRecovery.menuOpened) failures.push({modalRecovery});
}
ws.close();
console.log(JSON.stringify({ smoke, checks, sizes:sizes.map(([width])=>width),routes,counts,breakpoint,modalRecovery,failures,snapshots }, null, 2));
if (failures.length) process.exitCode = 1;
