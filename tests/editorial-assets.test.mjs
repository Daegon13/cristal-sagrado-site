import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import manifest from "../docs/editorial/manifest.json" with { type: "json" };

test("solo se publican las tres muestras limitadas y sus portadas", async () => {
  assert.equal(manifest.length, 3);
  const expectedPdfs = manifest.map((item) => item.sample.split("/").at(-1)).sort();
  const publicPdfs = (await readdir(new URL("../public/", import.meta.url), { recursive: true }))
    .filter((name) => name.toLowerCase().endsWith(".pdf"))
    .map((name) => name.split(/[\\/]/).at(-1)).sort();
  assert.deepEqual(publicPdfs, expectedPdfs);

  for (const item of manifest) {
    const cover = new URL(`../${item.cover}`, import.meta.url);
    const sample = new URL(`../${item.sample}`, import.meta.url);
    const [coverBytes, sampleBytes] = await Promise.all([readFile(cover), readFile(sample)]);
    assert.equal(coverBytes.length, item.cover_bytes, `${item.slug}: tamaño de portada`);
    assert.equal(sampleBytes.length, item.sample_bytes, `${item.slug}: tamaño de muestra`);
    assert.ok(coverBytes.length < 250_000 && coverBytes.toString("ascii", 0, 4) === "RIFF" && coverBytes.toString("ascii", 8, 12) === "WEBP", `${item.slug}: WebP válida`);
    assert.ok(sampleBytes.length < 5_000_000 && sampleBytes.toString("ascii", 0, 5) === "%PDF-" && sampleBytes.toString("ascii").includes("%%EOF"), `${item.slug}: PDF íntegro y apto para móvil`);
    assert.equal((sampleBytes.toString("latin1").match(/\/Type\s*\/Page\b/g) || []).length, item.preview_pages, `${item.slug}: páginas seleccionadas`);
    assert.equal(item.preview_pages, 4);
    assert.ok((await stat(sample)).isFile());
  }
});
