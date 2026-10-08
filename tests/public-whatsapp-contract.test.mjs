import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const components = readdirSync(new URL("../src/components/", import.meta.url)).filter((name) => name.endsWith(".astro"));

test("los CTA públicos no ofrecen salida directa sin caso", () => {
  for (const name of components) assert.doesNotMatch(read(`../src/components/${name}`), /https:\/\/(?:wa\.me|api\.whatsapp\.com)/, name);
  const data = read("../assets/js/data.js");
  assert.doesNotMatch(data, /buildWhatsappUrl|buildServiceWhatsappUrl|target\s*=\s*["']_blank/);
  assert.match(data, /dataset\.whatsappTrigger/);
  const trigger = read("../src/components/WhatsAppCTA.astro");
  assert.match(trigger, /data-whatsapp-trigger/);
  assert.match(trigger, /<button type="button"/);
  assert.doesNotMatch(trigger, /#formulario|href=/);
  assert.match(data, /createTextElement\("button", "serv-cta"/);
  assert.doesNotMatch(data, /#formulario/);
});

test("la salida pública se construye solo después de validar y conserva contexto", () => {
  const flow = read("../assets/js/whatsapp-contact.js");
  const validation = flow.indexOf("if (!validCase(textarea.value))");
  const build = flow.indexOf("buildWhatsappUrl(buildWhatsappMessage");
  assert.ok(validation >= 0 && build > validation);
  assert.match(flow, /serviceName: trigger\.dataset\.serviceName/);
  assert.match(flow, /ctaText: trigger\.dataset\.ctaText/);
  assert.match(flow, /intent: trigger\.dataset\.intent/);
  assert.match(flow, /category: trigger\.dataset\.category/);
  assert.doesNotMatch(flow, /trackEvent\([^\n]*textarea\.value/);
  assert.equal((flow.match(/trackEvent\("wa_open"/g) || []).length, 1);
  assert.equal((flow.match(/trackEvent\("wa_case_valid"/g) || []).length, 1);
  assert.equal((flow.match(/trackEvent\("wa_outbound"/g) || []).length, 1);
});

test("admin conserva su vista previa independiente", () => {
  const admin = read("../admin/service-form-helpers.js");
  assert.match(admin, /buildWhatsappPreviewMessage/);
  assert.doesNotMatch(admin, /whatsapp-contact/);
});
