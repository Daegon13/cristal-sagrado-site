import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("Home selecciona imágenes rituales por media query desde BASE_URL", () => {
  const hero = read("../src/components/Hero.astro");
  const home = read("../src/pages/index.astro");
  const css = read("../src/styles/components.css");
  assert.match(home, /<Hero ritualImage\b/);
  assert.match(hero, /import\.meta\.env\.BASE_URL/);
  assert.match(hero, /hero-ritual-mobile\.webp/);
  assert.match(hero, /hero-ritual-desktop\.webp/);
  assert.match(css, /\.hero--ritual\s*\{[^}]*var\(--hero-mobile\)/);
  assert.match(css, /@media \(min-width: 60rem\)[\s\S]*\.hero--ritual\s*\{[^}]*var\(--hero-desktop\)/);
  for (const file of ["desktop", "mobile"]) assert.ok(statSync(new URL(`../public/hero-ritual-${file}.webp`, import.meta.url)).size > 0);
});

test("el video global no se renderiza y las páginas secundarias no activan imágenes de Home", () => {
  const layout = read("../src/layouts/BaseLayout.astro");
  assert.doesNotMatch(layout, /VideoBackground|Eclipse_small\.mp4/);
  assert.match(layout, /video-poster\.svg/);
  for (const path of ["faq", "como-trabajamos", "tarot"]) {
    assert.doesNotMatch(read(`../src/pages/${path}/index.astro`), /ritualImage|hero-ritual/);
  }
});
