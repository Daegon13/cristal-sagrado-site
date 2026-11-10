import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import snapshot from "../src/data/generated/services.public.json" with { type: "json" };

const HEADER = "fecha\tservicio\torigen\tcampana\tconsulta_recibida\tventa_confirmada\timporte_cobrado";
const SERVICES = new Set(["Tarot", ...snapshot.services.map((item) => item.name)]);
const ORIGINS = new Set(["instagram", "google", "facebook", "tiktok", "web", "directo", "referido", "desconocido"]);
const campaignToken = (value) => !value || value.length <= 40 && /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(value) && !/\d{7,}/.test(value);
export function summarizeTsv(source) {
  const [header, ...lines] = source.replace(/\r?\n$/, "").split(/\r?\n/);
  if (header !== HEADER) throw new Error("Encabezado TSV inválido.");
  const totals = new Map();
  for (const [index, line] of lines.entries()) {
    if (!line.trim()) continue;
    const fields = line.split("\t");
    if (fields.length !== 7) throw new Error(`Fila ${index + 2}: se esperan siete columnas.`);
    const [date, service, origin, campaign, received, sold, amount] = fields.map((value) => value.trim());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !SERVICES.has(service) || !ORIGINS.has(origin) || !campaignToken(campaign) || !["si", "no"].includes(received) || !["si", "no"].includes(sold) || (sold === "si" && received !== "si") || (amount && (!/^\d+(?:\.\d{1,2})?$/.test(amount) || sold !== "si"))) throw new Error(`Fila ${index + 2}: datos inválidos.`);
    for (const [dimension, value] of [["servicio", service], ["origen", origin], ["campana", campaign || "sin_campana"]]) {
      const key = `${dimension}: ${value}`;
      const item = totals.get(key) || { consultas: 0, ventas: 0, cobrado: 0 };
      item.consultas += received === "si" ? 1 : 0;
      item.ventas += sold === "si" ? 1 : 0;
      item.cobrado += amount ? Number(amount) : 0;
      totals.set(key, item);
    }
  }
  return totals;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = process.argv[2];
  if (!file) throw new Error("Uso: node scripts/summarize-commercial.mjs .local/commercial-attribution.tsv");
  for (const [key, value] of summarizeTsv(readFileSync(file, "utf8"))) console.log(`${key}: ${value.consultas} consultas, ${value.ventas} ventas, ${value.cobrado.toFixed(2)} cobrado`);
}
