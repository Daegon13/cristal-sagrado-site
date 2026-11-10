import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const sourcePath = new URL("src/data/generated/services.public.json", root);
const proposalPath = new URL("docs/PROPUESTAS_COPY_3_0.json", root);
const outputPath = new URL("src/data/approved-copy.public.json", root);
const fields = ["descriptionShort", "descriptionLong", "idealFor", "benefits", "intent", "notFor"];
const originalFields = ["name", "category", "slug", "descriptionShort", "descriptionLong", "price", "order", "active", "updatedAt"];

export async function prepareApprovedCopy({ write = false } = {}) {
  const sourceBytes = await readFile(sourcePath);
  const source = JSON.parse(sourceBytes.toString("utf8"));
  const proposals = JSON.parse(await readFile(proposalPath, "utf8"));
  const sourceSha256 = createHash("sha256").update(sourceBytes).digest("hex");
  if (sourceSha256 !== proposals.sourceSha256) throw new Error("La snapshot pública cambió desde la auditoría; revisar antes de publicar copy.");
  if (source.services.length !== 52 || proposals.services.length !== 52) throw new Error("Se esperaban 52 servicios activos y 52 propuestas.");
  const originals = new Map(source.services.map((item) => [item.id, item]));
  if (originals.size !== 52) throw new Error("IDs duplicados en la snapshot pública.");
  const result = {};
  for (const proposal of proposals.services) {
    const original = originals.get(proposal.id);
    if (!original || !original.active || proposal.status !== "PENDIENTE_APROBACION") throw new Error(`Propuesta inválida: ${proposal.id}`);
    for (const field of originalFields) if (proposal.original[field] !== original[field]) throw new Error(`El original cambió: ${proposal.id} ${field}`);
    if (Object.keys(proposal.proposed).sort().join() !== [...fields].sort().join()) throw new Error(`Campos no autorizados: ${proposal.id}`);
    const copy = {};
    for (const field of fields) {
      const value = proposal.proposed[field];
      if (typeof value === "string" && value.trim()) copy[field] = value;
      else if (Array.isArray(value)) {
        if (!value.every((part) => typeof part === "string" && part.trim())) throw new Error(`Valor inválido: ${proposal.id} ${field}`);
        if (value.length) copy[field] = value;
      } else if (value !== "") throw new Error(`Valor inválido: ${proposal.id} ${field}`);
    }
    if (!copy.descriptionShort || !copy.descriptionLong) throw new Error(`Descripciones incompletas: ${proposal.id}`);
    result[proposal.id] = { name: original.name, category: original.category, slug: original.slug, copy };
  }
  if (Object.keys(result).length !== 52) throw new Error("IDs duplicados o ausentes en las propuestas.");
  const expected = `${JSON.stringify({ version: 1, sourceSha256, services: result }, null, 2)}\n`;
  if (write) await writeFile(outputPath, expected, "utf8");
  else if (await readFile(outputPath, "utf8") !== expected) throw new Error("El copy aprobado no coincide con las propuestas; ejecutar npm run prepare:copy y revisar el diff.");
  return { count: 52, sourceSha256 };
}

if (process.argv[1] && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()) {
  prepareApprovedCopy({ write: process.argv.includes("--write") }).then(({ count }) => console.log(`Copy aprobado: ${count} servicios (${process.argv.includes("--write") ? "generado" : "verificado"})`)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
