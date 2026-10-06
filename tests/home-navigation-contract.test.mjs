import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("las cinco categorías conservan rutas y enlaces HTML visibles", () => {
  const constants = read("../src/lib/constants.ts");
  for (const route of ["magia-blanca/", "magia-roja/", "magia-negra/", "magia-verde/", "tarot/"]) assert.match(constants, new RegExp(`href: "${route}"`));
  const nav = read("../src/components/CategoryNav.astro");
  const grid = read("../src/components/ServiceGrid.astro");
  assert.match(nav, /<a href=\{`\$\{base\}\$\{category\.href\}`\}/);
  assert.match(nav, /data-cta-location="magic_category_nav"/);
  assert.match(grid, /<a class="service-card__cta" href=\{`\$\{base\}\$\{category\.href\}`\}/);
  assert.match(grid, /data-cta-location="category_grid"/);
});

test("los CTA comerciales de Home conservan el panel común y no usan wa.me directo", () => {
  const home = read("../src/pages/index.astro");
  for (const component of ["Hero", "IntentCards", "ProcessSection", "Testimonials", "FinalCTA"]) {
    assert.match(home, new RegExp(`<${component}(?: | \\n| \\r| />)`));
    const source = read(`../src/components/${component}.astro`);
    assert.match(source, /<WhatsAppCTA/);
    assert.doesNotMatch(source, /https:\/\/wa\.me/);
  }
  assert.match(read("../src/components/WhatsAppCTA.astro"), /data-whatsapp-trigger/);
});
