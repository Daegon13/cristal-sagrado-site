import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import snapshot from "../src/data/generated/services.public.json" with { type: "json" };
import { selectedServicePaths } from "../src/lib/seo-services.js";
import { seoGuides } from "../src/data/seo-guides.js";

const allowedPaths = new Set(["/", "/guias/", ...selectedServicePaths(snapshot), ...seoGuides.map((guide) => `/guias/${guide.slug}/`)]);
const allowedKeys = new Set(["path", "source", "medium", "campaign", "content", "term"]);
const allowedMediums = new Set(["bio", "story", "reel", "post"]);

export function normalizeToken(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Falta --${label}`);
  const token = value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
  if (token.length > 40 || !/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(token) || /\d{7,}/.test(token)) throw new Error(`--${label} debe ser una etiqueta corta, sin datos personales`);
  return token;
}

export function buildCampaignLink(options) {
  const path = options.path;
  if (!allowedPaths.has(path)) throw new Error("--path debe ser una ruta publicada de Home, guía o landing SEO");
  const source = normalizeToken(options.source, "source");
  const medium = normalizeToken(options.medium, "medium");
  if (source !== "instagram" || !allowedMediums.has(medium)) throw new Error("Se admite source=instagram y medium=bio, story, reel o post");
  const url = new URL(path, "https://cristal-sagrado.com");
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", normalizeToken(options.campaign, "campaign"));
  if (options.content) url.searchParams.set("utm_content", normalizeToken(options.content, "content"));
  if (options.term) url.searchParams.set("utm_term", normalizeToken(options.term, "term"));
  return url.toString();
}

export function parseArgs(argv) {
  // En PowerShell, npm consume los nombres --clave y deja sus valores posicionales.
  if (argv.length >= 4 && argv.length <= 6 && argv.every((item) => !item.startsWith("--"))) {
    const [path, source, medium, campaign, content, term] = argv;
    return { path, source, medium, campaign, content, term };
  }
  const options = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, "");
    if (!argv[i]?.startsWith("--") || !allowedKeys.has(key) || !argv[i + 1] || argv[i + 1].startsWith("--") || key in options) throw new Error("Uso: --path /ruta/ --source instagram --medium story --campaign tema [--content variante]");
    options[key] = argv[i + 1];
  }
  return options;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try { console.log(buildCampaignLink(parseArgs(process.argv.slice(2)))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
