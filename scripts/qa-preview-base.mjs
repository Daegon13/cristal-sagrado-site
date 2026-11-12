import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import manifest from "../docs/editorial/manifest.json" with { type: "json" };

const basePath = String(process.env.BASE_PATH || "").replace(/^\/+|\/+$/g, "");
assert.ok(basePath, "BASE_PATH requerido para validar la preview");
const base = `/${basePath}/`;
const catalog = await readFile(new URL("../dist/libros/index.html", import.meta.url), "utf8");
const service = await readFile(new URL("../dist/magia-verde/encuentro-reencuentro/index.html", import.meta.url), "utf8");
const home = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
const tarot = await readFile(new URL("../dist/tarot/index.html", import.meta.url), "utf8");
const local = await readFile(new URL("../dist/trabajos-espirituales-montevideo/index.html", import.meta.url), "utf8");
assert.ok(service.includes('href="https://wa.me/59896106373?text='), "CTA directo mantiene URL externa bajo BASE_PATH");
assert.ok(service.includes(`href="${base}#formulario"`), "CTA guiado conserva fallback bajo BASE_PATH");
assert.ok(home.includes(`href="${base}libros/"`), "Home enlaza biblioteca bajo BASE_PATH");
assert.ok(tarot.includes(`href="${base}guias/que-trabajo-consultar/"`), "Tarot enlaza guía bajo BASE_PATH");
assert.ok(home.includes(`href="${base}trabajos-espirituales-montevideo/"`), "Home enlaza landing local bajo BASE_PATH");
assert.ok(local.includes(`href="${base}#formulario"`) && local.includes(`href="${base}tarot/"`), "Landing local enlaza bajo BASE_PATH");
assert.ok(local.includes('name="robots" content="noindex,follow"'), "Landing preview noindex");

for (const item of manifest) {
  const cover = item.cover.replace(/^public\//, "");
  const sample = item.sample.replace(/^public\//, "");
  const html = await readFile(new URL(`../dist/libros/${item.slug}/index.html`, import.meta.url), "utf8");
  assert.ok(catalog.includes(`src="${base}${cover}"`), `${item.slug}: portada en catálogo`);
  assert.ok(html.includes(`src="${base}${cover}"`), `${item.slug}: portada en ficha`);
  assert.ok(html.includes(`href="${base}${sample}"`), `${item.slug}: muestra bajo BASE_URL`);
  assert.ok((await stat(new URL(`../dist/${sample}`, import.meta.url))).size === item.sample_bytes, `${item.slug}: muestra copiada íntegra`);
}

console.log(`${manifest.length} fichas: portadas y muestras enlazadas bajo ${base}`);
