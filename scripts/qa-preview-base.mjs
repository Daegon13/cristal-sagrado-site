import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import manifest from "../docs/editorial/manifest.json" with { type: "json" };

const basePath = String(process.env.BASE_PATH || "").replace(/^\/+|\/+$/g, "");
assert.ok(basePath, "BASE_PATH requerido para validar la preview");
const base = `/${basePath}/`;
const catalog = await readFile(new URL("../dist/libros/index.html", import.meta.url), "utf8");

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
