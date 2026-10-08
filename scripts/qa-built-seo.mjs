import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import snapshot from "../src/data/generated/services.public.json" with { type: "json" };
import { getServicesByCategory } from "../src/lib/public-services.js";
import { selectedServices } from "../src/lib/seo-services.js";
import { seoGuides } from "../src/data/seo-guides.js";

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
const staticPaths = ["/", "/magia-blanca/", "/magia-roja/", "/magia-negra/", "/magia-verde/", "/tarot/", "/faq/", "/como-trabajamos/"];
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const robots = await readFile(new URL("../dist/robots.txt", import.meta.url), "utf8");
const cname = await readFile(new URL("../dist/CNAME", import.meta.url), "utf8");
assert.match(robots, /^Sitemap: https:\/\/cristal-sagrado\.com\/sitemap\.xml\s*$/m);
assert.equal(cname.trim(), "cristal-sagrado.com");
assert.equal(new Set(urls).size, urls.length, "Sitemap sin URLs duplicadas");
assert.ok(urls.every((url) => !url.endsWith(".html")), "Sitemap sin rutas .html");
assert.ok(!sitemap.includes("/admin/"));
const entries = selectedServices(snapshot);
const actualServicePaths = [];
for (const category of ["blanca", "roja", "negra", "verde"]) {
  for (const item of await readdir(new URL(`../dist/magia-${category}/`, import.meta.url), { withFileTypes: true })) {
    if (item.isDirectory()) actualServicePaths.push(`/magia-${category}/${item.name}/`);
  }
}
assert.deepEqual(actualServicePaths.sort(), entries.map((entry) => entry.path).sort(), "Solo se generan rutas de servicios allowlisted");
const guidePaths = seoGuides.map((guide) => `/guias/${guide.slug}/`);
const expectedUrls = [...staticPaths, "/guias/", ...guidePaths, ...entries.map((entry) => entry.path)].map((path) => `https://cristal-sagrado.com${path}`);
assert.deepEqual(urls.slice().sort(), expectedUrls.slice().sort(), "Sitemap contiene exactamente las páginas públicas actuales");
const expected = [...entries.map((entry) => entry.path), "/guias/", ...guidePaths];
for (const path of expected) {
  const html = await readFile(new URL(`../dist${path}index.html`, import.meta.url), "utf8");
  assert.ok(sitemap.includes(`https://cristal-sagrado.com${path}`), `Sitemap: ${path}`);
  assert.ok(html.includes(`rel="canonical" href="https://cristal-sagrado.com${path}"`), `Canonical: ${path}`);
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]+"/);
  assert.match(html, /<h1[^>]*>[^<]+<\/h1>/);
  assert.ok(html.includes("data-whatsapp-trigger"), `CTA: ${path}`);
  assert.ok(html.includes("aria-label=\"Ruta de navegación\""), `Breadcrumb: ${path}`);
  assert.ok(html.includes("BreadcrumbList"), `Breadcrumb schema: ${path}`);
  assert.ok(html.includes("href="), `Links: ${path}`);
}
for (const entry of entries) {
  const html = await readFile(new URL(`../dist${entry.path}index.html`, import.meta.url), "utf8");
  assert.ok(html.includes(`data-cta-location="seo_service_page"`));
  assert.ok(html.includes(`data-service-slug="${entry.service.slug}"`));
  assert.ok(html.includes("data-cta-text="));
  assert.ok(html.includes(`data-service-name="${entry.service.name.replaceAll("&", "&amp;").replaceAll('"', '&quot;')}"`));
  const category = await readFile(new URL(`../dist/magia-${entry.service.category}/index.html`, import.meta.url), "utf8");
  assert.ok(category.includes(`href="${entry.path}"`), `Categoría enlaza ${entry.path}`);
}
for (const guide of seoGuides) {
  const html = await readFile(new URL(`../dist/guias/${guide.slug}/index.html`, import.meta.url), "utf8");
  assert.ok(html.includes(`data-cta-location="seo_guide"`));
  for (const slug of guide.services) assert.ok(html.includes(`/${slug}/`), `Guía ${guide.slug} enlaza ${slug}`);
}
assert.ok(entries.length >= 8 && entries.length <= 12);
assert.ok(seoGuides.length >= 5 && seoGuides.length <= 6);
for (const [oldPath, target] of Object.entries({
  "faq.html": "/faq/", "como-trabajamos.html": "/como-trabajamos/", "magia-blanca.html": "/magia-blanca/",
  "magia-roja.html": "/magia-roja/", "magia-negra.html": "/magia-negra/", "magia-verde.html": "/magia-verde/",
  "tarot.html": "/tarot/", "servicios.html": "/#servicios"
})) {
  const html = await readFile(new URL(`../dist/${oldPath}`, import.meta.url), "utf8");
  assert.match(html, /<meta name="robots" content="noindex,follow">/);
  assert.ok(html.includes(`rel="canonical" href="https://cristal-sagrado.com${target}"`), `Canonical redirect: ${oldPath}`);
  assert.match(html, /http-equiv="refresh"/);
}
for (const path of ["admin/index.html", "admin/app.js", "admin/config.js", "admin/service-form-helpers.js", "assets/js/service-helpers.js", "assets/js/whatsapp.js", "hero-ritual-desktop.webp", "hero-ritual-mobile.webp", "favicon_io/favicon-32x32.png"]) {
  assert.ok((await readFile(new URL(`../dist/${path}`, import.meta.url))).length > 0, `Asset requerido: ${path}`);
}
const allDistPaths = await readdir(new URL("../dist/", import.meta.url), { recursive: true });
assert.ok(!allDistPaths.some((path) => /Eclipse_small|\.mp4$|^css[\\/]|^scripts[\\/]|^assets[\\/]js[\\/](data|whatsapp-contact)\.js$/.test(path)), "Sin assets legacy en dist");
console.log(`${urls.length} URLs únicas: ${staticPaths.length} estáticas, 1 hub, ${seoGuides.length} guías y ${entries.length} landings SEO`);
