import assert from "node:assert/strict";
import test from "node:test";
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
