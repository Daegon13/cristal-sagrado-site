import test from "node:test";
import assert from "node:assert/strict";
import snapshot from "../src/data/generated/services.public.json" with { type: "json" };
import { seoServices } from "../src/data/seo-services.js";
import { seoGuides } from "../src/data/seo-guides.js";
import { selectedServices, selectedServicePaths } from "../src/lib/seo-services.js";
import { buildCampaignLink, normalizeToken, parseArgs } from "../scripts/campaign-link.mjs";
import { trackEvent } from "../assets/js/analytics.js";

test("allowlist genera solo servicios activos, con slugs reales y metadata distinta", () => {
  const entries = selectedServices(snapshot);
  assert.ok(entries.length >= 8 && entries.length <= 12);
  assert.equal(new Set(entries.map((item) => item.id)).size, entries.length);
  assert.equal(new Set(entries.map((item) => item.path)).size, entries.length);
  assert.equal(new Set(entries.map((item) => item.title)).size, entries.length);
  assert.equal(new Set(entries.map((item) => item.description)).size, entries.length);
  for (const entry of entries) {
    assert.equal(entry.service.active, true);
    assert.equal(entry.path, `/magia-${entry.service.category}/${entry.service.slug}/`);
    assert.ok(entry.intro && entry.situation && entry.approach);
  }
  assert.deepEqual(selectedServicePaths(snapshot), entries.map((item) => item.path));
  assert.throws(() => selectedServices({ ...snapshot, services: snapshot.services.filter((item) => item.id !== seoServices[0].id) }), /ausente o inactivo/);
});

test("guías enlazan solo landings seleccionadas y mantienen slugs únicos", () => {
  assert.ok(seoGuides.length >= 5 && seoGuides.length <= 6);
  assert.equal(new Set(seoGuides.map((item) => item.slug)).size, seoGuides.length);
  const slugs = new Set(selectedServices(snapshot).map((item) => item.service.slug));
  for (const guide of seoGuides) {
    assert.ok(guide.sections.length >= 3);
    assert.ok(guide.services.length);
    assert.ok(guide.services.every((slug) => slugs.has(slug)));
  }
});

test("generador UTM normaliza y codifica, rechaza rutas y datos personales", () => {
  assert.equal(normalizeToken("Educación Amor", "campaign"), "educacion_amor");
  const result = buildCampaignLink(parseArgs(["--path", "/guias/amarre-vs-endulzamiento/", "--source", "Instagram", "--medium", "Reel", "--campaign", "Educación Amor", "--content", "variante 01"]));
  const url = new URL(result);
  assert.equal(url.origin, "https://cristal-sagrado.com");
  assert.equal(url.searchParams.get("utm_campaign"), "educacion_amor");
  assert.equal(url.searchParams.get("utm_content"), "variante_01");
  assert.deepEqual(parseArgs(["/", "instagram", "bio", "principal"]), { path: "/", source: "instagram", medium: "bio", campaign: "principal", content: undefined, term: undefined });
  assert.throws(() => buildCampaignLink({ path: "/admin/", source: "instagram", medium: "bio", campaign: "x" }), /ruta publicada/);
  assert.throws(() => buildCampaignLink({ path: "/", source: "instagram", medium: "bio", campaign: "persona@example.com" }), /datos personales/);
  assert.throws(() => buildCampaignLink({ path: "/", source: "instagram", medium: "bio", campaign: "59896106373" }), /datos personales/);
});

test("analytics de CTA SEO conserva solo contexto permitido", () => {
  const calls = [];
  const umami = { track: (event, data) => calls.push({ event, data }) };
  trackEvent("wa_outbound", { page: "/guias/amarre-vs-endulzamiento/", cta_location: "seo_guide", guide: "amarre-vs-endulzamiento", case: "texto privado", email: "persona@example.com" }, umami);
  trackEvent("wa_open", { page: "/magia-roja/endulzamiento-fuerte/", cta_location: "seo_service_page", service: "endulzamiento-fuerte", category: "roja", message: "texto privado" }, umami);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].data.cta_location, "seo_guide");
  assert.equal(calls[1].data.service, "endulzamiento-fuerte");
  assert.ok(!JSON.stringify(calls).includes("texto privado"));
  assert.ok(!JSON.stringify(calls).includes("persona@example.com"));
});
