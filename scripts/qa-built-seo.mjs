import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import snapshot from "../src/data/generated/services.public.json" with { type: "json" };
import { getServicesByCategory } from "../src/lib/public-services.js";

for (const category of ["blanca", "roja", "negra", "verde"]) {
  const html = await readFile(new URL(`../dist/magia-${category}/index.html`, import.meta.url), "utf8");
  const services = getServicesByCategory(snapshot, category);
  assert.ok(services.length, `Sin servicios activos: ${category}`);
  assert.equal((html.match(/class="serv-card"/g) || []).length, services.length, `Cantidad de fichas: ${category}`);
  assert.ok(!html.includes("Los trabajos se están cargando."));
  for (const service of services) {
    assert.ok(html.includes(`data-id="${service.id}"`), `Falta ${service.id}`);
    assert.ok(html.includes(`data-service-slug="${service.slug}"`), `Falta metadata WhatsApp de ${service.id}`);
    assert.ok(html.includes(`data-category="${category}"`));
    assert.ok(html.includes(service.name.replaceAll("&", "&amp;")), `Falta nombre de ${service.id}`);
    assert.ok(html.includes(service.descriptionShort.slice(0, 24).replaceAll("&", "&amp;")), `Falta descripción de ${service.id}`);
  }
  assert.ok(html.includes("data-whatsapp-trigger"));
  assert.ok(html.includes(`rel="canonical" href="https://cristal-sagrado.com/magia-${category}/"`));
  console.log(`magia-${category}: ${services.length} fichas HTML`);
}
const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
for (const path of ["/", "/magia-blanca/", "/magia-roja/", "/magia-negra/", "/magia-verde/", "/tarot/", "/faq/", "/como-trabajamos/"]) assert.ok(sitemap.includes(`https://cristal-sagrado.com${path}`));
assert.ok(!sitemap.includes("/admin/"));
