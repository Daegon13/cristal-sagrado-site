import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import snapshot from "../src/data/generated/services.public.json" with { type: "json" };
import { getServicesByCategory } from "../src/lib/public-services.js";
import { selectedServices } from "../src/lib/seo-services.js";
import { seoGuides } from "../src/data/seo-guides.js";
import editorialManifest from "../docs/editorial/manifest.json" with { type: "json" };

const homeHtml = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
if (homeHtml.includes("data-before-send=\"cristalUmamiBeforeSend\"")) {
  const hookScript = [...homeHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1]).find((script) => script.includes("window.cristalUmamiBeforeSend"));
  assert.ok(hookScript, "El build con Umami debe incluir before-send");
  const window = {};
  runInNewContext(hookScript, {
    window, location: { pathname: "/", href: "https://cristal-sagrado.com/" },
    URL, URLSearchParams
  });
  const pageview = window.cristalUmamiBeforeSend("event", { website: "qa-id", url: "/" });
  const event = window.cristalUmamiBeforeSend("event", {
    website: "qa-id", name: "diagnostic_test", url: "/",
    data: { source: "qa", name: "Nombre privado", message: "Texto privado",
      items: [{ name: "Otro nombre privado" }, { name: "Nombre privado 2" }] }
  });
  assert.equal(pageview.website, "qa-id");
  assert.equal(event.website, "qa-id");
  assert.equal(event.name, "diagnostic_test", "El build elimina el nombre de eventos Umami");
  assert.equal(event.data.source, "qa");
  assert.equal(event.data.name, undefined);
  assert.equal(event.data.message, undefined);
  assert.equal(event.data.items[0].name, undefined);
  assert.equal(event.data.items[1].name, undefined);
}

for (const category of ["blanca", "roja", "negra", "verde"]) {
  const html = await readFile(new URL(`../dist/magia-${category}/index.html`, import.meta.url), "utf8");
  const services = getServicesByCategory(snapshot, category);
  assert.ok(services.length, `Sin servicios activos: ${category}`);
  assert.equal((html.match(/class="serv-card"/g) || []).length, services.length, `Cantidad de fichas: ${category}`);
  assert.ok(!html.includes("serv-duration"), `Sin duración publicada: ${category}`);
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
const staticPaths = ["/", "/magia-blanca/", "/magia-roja/", "/magia-negra/", "/magia-verde/", "/tarot/", "/faq/", "/como-trabajamos/", "/libros/"];
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
const bookPaths = editorialManifest.map((item) => `/libros/${item.slug}/`);
const expectedUrls = [...staticPaths, "/guias/", ...guidePaths, ...bookPaths, ...entries.map((entry) => entry.path)].map((path) => `https://cristal-sagrado.com${path}`);
assert.deepEqual(urls.slice().sort(), expectedUrls.slice().sort(), "Sitemap contiene exactamente las páginas públicas actuales");
for (const item of editorialManifest) {
  const path = `/libros/${item.slug}/`;
  const html = await readFile(new URL(`../dist${path}index.html`, import.meta.url), "utf8");
  assert.ok(html.includes(`rel="canonical" href="https://cristal-sagrado.com${path}"`), `Canonical: ${path}`);
  assert.ok(html.includes("BreadcrumbList") && html.includes('"@type":"Book"'), `Book schema: ${path}`);
  assert.ok(html.includes("PRÓXIMAMENTE") && html.includes("Qué vas a encontrar en este libro") && html.includes("Selección del índice"), `Presentación editorial: ${path}`);
  assert.ok(html.includes(`src="/${item.cover.replace(/^public\//, "")}"`), `Portada: ${path}`);
  assert.ok(html.includes(`href="/${item.sample.replace(/^public\//, "")}"`), `Muestra: ${path}`);
  assert.ok(html.includes('data-book-event="book_sample_download"') && html.includes('data-book-event="book_interest_wa"'), `Eventos editoriales: ${path}`);
  assert.ok(!html.includes('data-book-event="book_purchase_click"') && !html.includes("Ir a compra") && !html.includes("Descargar libro"), `Sin venta prematura: ${path}`);
  assert.ok(!html.includes(item.full_original_name), `Original privado ausente: ${path}`);
  const publicSample = await readFile(new URL(`../${item.sample}`, import.meta.url));
  const builtSample = await readFile(new URL(`../dist/${item.sample.replace(/^public\//, "")}`, import.meta.url));
  assert.ok(publicSample.equals(builtSample), `Muestra copiada sin cambios: ${path}`);
}
const catalogHtml = await readFile(new URL("../dist/libros/index.html", import.meta.url), "utf8");
for (const item of editorialManifest) assert.ok(catalogHtml.includes(`src="/${item.cover.replace(/^public\//, "")}"`), `Catálogo muestra portada: ${item.slug}`);
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
  assert.ok(!html.includes("Duración indicada en el catálogo"), `Sin duración publicada: ${entry.path}`);
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
assert.deepEqual(
  allDistPaths.filter((path) => path.toLowerCase().endsWith(".pdf")).map((path) => path.replaceAll("\\", "/")).sort(),
  editorialManifest.map((item) => item.sample.replace(/^public\//, "")).sort(),
  "dist solo contiene las tres muestras autorizadas"
);
assert.ok(!allDistPaths.some((path) => /Eclipse_small|\.mp4$|^css[\\/]|^scripts[\\/]|^assets[\\/]js[\\/](data|whatsapp-contact)\.js$/.test(path)), "Sin assets legacy en dist");
console.log(`${urls.length} URLs únicas: ${staticPaths.length} estáticas, ${bookPaths.length} fichas de libro, 1 hub de guías, ${seoGuides.length} guías y ${entries.length} landings SEO`);
