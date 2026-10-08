import { SITE } from "../lib/constants";
import snapshot from "../data/generated/services.public.json";
import { selectedServicePaths } from "../lib/seo-services.js";
import { seoGuides } from "../data/seo-guides.js";

export function GET() {
  const staticPaths = Object.keys(import.meta.glob("./**/index.astro"))
    .map((file) => file === "./index.astro" ? "/" : `/${file.slice(2, -"index.astro".length)}`)
    .filter((path) => !path.includes("[") );
  const paths = [...new Set([...staticPaths, ...selectedServicePaths(snapshot), ...seoGuides.map((guide) => `/guias/${guide.slug}/`)])]
    .sort((a, b) => a === "/" ? -1 : b === "/" ? 1 : a.localeCompare(b));
  const urls = paths.map((path) => `  <url><loc>${new URL(path, SITE.origin)}</loc></url>`).join("\n");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
