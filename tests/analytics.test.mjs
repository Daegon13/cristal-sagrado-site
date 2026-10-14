import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { sanitizeAnalyticsUrl, sanitizeUmamiPayload, trackEvent } from "../assets/js/analytics.js";

test("analytics ausente no rompe y devuelve no-op", () => {
  assert.equal(trackEvent("wa_open", {} , null), false);
});

test("trackEvent filtra propiedades vacías, desconocidas y prohibidas", () => {
  let captured;
  const umami = { track: (...args) => { captured = args; } };
  assert.equal(trackEvent("wa_open", { page: "/", service: "Limpieza de luna ✨", case: "texto privado", message: "privado", intent: undefined, other: "ignored" }, umami), true);
  assert.deepEqual(captured, ["wa_open", { page: "/", service: "Limpieza de luna ✨" }]);
});

test("sanitiza search params y conserva solo UTM conocidos", () => {
  assert.equal(sanitizeAnalyticsUrl("https://cristal-sagrado.com/?utm_source=instagram&fbclid=secret&email=a%40b.com&utm_campaign=story"), "/?utm_source=instagram&utm_campaign=story");
  assert.equal(sanitizeAnalyticsUrl("/tarot/?case=secreto&utm_term=cartas", "https://cristal-sagrado.com"), "/tarot/?utm_term=cartas");
});

test("elimina claves privadas anidadas y limpia URL y referrer", () => {
  const safe = sanitizeUmamiPayload("event", {
    url: "https://cristal-sagrado.com/?token=privado&utm_medium=social",
    referrer: "https://instagram.com/?igshid=privado&utm_source=instagram",
    data: { service: "Tarot & amor ✨", caso: "no enviar", message: "no enviar" }
  });
  assert.deepEqual(safe, {
    url: "/?utm_medium=social",
    referrer: "https://instagram.com/?utm_source=instagram",
    data: { service: "Tarot & amor ✨" }
  });
});

test("elimina claves privadas camelCase y fragmentos de URL", () => {
  const safe = sanitizeUmamiPayload("event", { url: "/?utm_source=instagram#texto-privado", data: { caseText: "no", phoneNumber: "no", emailAddress: "no" } });
  assert.deepEqual(safe, { url: "/?utm_source=instagram", data: {} });
});

test("conserva solo el nombre estructural del evento", () => {
  const payload = { website: "website-id-de-prueba", name: "wa_open",
    data: { name: "Nombre privado", items: [{ name: "Otro nombre privado" }] } };
  assert.deepEqual(sanitizeUmamiPayload("event", payload), {
    website: "website-id-de-prueba", name: "wa_open", data: { items: [{}] }
  });
  assert.equal(sanitizeUmamiPayload("pageview", payload).name, undefined);
});

test("nombres de servicio con caracteres especiales no rompen el evento", () => {
  let captured;
  const umami = { track: (...args) => { captured = args; } };
  trackEvent("service_wa", { service: "Amor & vínculos: edición ‘luna’ 💜", category: "roja" }, umami);
  assert.equal(captured[1].service, "Amor & vínculos: edición ‘luna’ 💜");
});

test("nav_cta registra categoría estática y descarta contacto privado", () => {
  let captured;
  const umami = { track: (...args) => { captured = args; } };
  trackEvent("nav_cta", { page: "/", cta_location: "magic_category_nav", category: "roja", contact: "luz@example.com", message: "privado" }, umami);
  assert.deepEqual(captured, ["nav_cta", { page: "/", cta_location: "magic_category_nav", category: "roja" }]);
});

test("el hook publicado conserva el nombre de todos los eventos y elimina PII", async () => {
  const layout = await readFile(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8");
  const inlineScript = layout.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(inlineScript, "Falta el hook before-send");
  const window = {};
  runInNewContext(inlineScript, {
    window, location: { pathname: "/", href: "https://cristal-sagrado.com/" },
    URL, URLSearchParams
  });
  const website = "website-id-de-prueba";
  const sent = [];
  const umami = { track: (name, data) => {
    sent.push(window.cristalUmamiBeforeSend("event", {
      website, name, data: { ...data, name: "Nombre privado", message: "Texto privado",
        items: [{ name: "Otro nombre privado" }, { name: "Nombre privado 2" }] },
      url: "https://cristal-sagrado.com/?token=privado"
    }));
  } };
  const names = ["nav_cta", "wa_open", "wa_case_valid", "wa_outbound",
    "intent_click", "service_wa", "service_detail", "form_submit"];
  for (const name of names) assert.equal(trackEvent(name, { page: "/", service: "tarot" }, umami), true);
  assert.deepEqual(sent.map((payload) => payload.name), names);
  for (const payload of sent) {
    assert.equal(payload.website, website);
    assert.equal(payload.url, "/");
    assert.equal(payload.data.name, undefined);
    assert.equal(payload.data.message, undefined);
    assert.equal(payload.data.items[0].name, undefined);
    assert.equal(payload.data.items[1].name, undefined);
  }
});
