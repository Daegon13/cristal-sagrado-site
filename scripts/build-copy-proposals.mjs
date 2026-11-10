import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { drafts } from '../docs/copy_3_0/drafts.mjs';

const snapshotPath = new URL('../src/data/generated/services.public.json', import.meta.url);
const proposalPath = new URL('../docs/PROPUESTAS_COPY_3_0.json', import.meta.url);
const reviewPath = new URL('../docs/REVISION_HUMANA_COPY_3_0.md', import.meta.url);
const expectedSha256 = 'f135837c794da7f8b66b767d8444d227516777bbf6e1d5dce449dce65ae1aab2';
const snapshotBytes = await readFile(snapshotPath);
const sha256 = createHash('sha256').update(snapshotBytes).digest('hex');
if (sha256 !== expectedSha256) throw new Error(`El snapshot cambió: ${sha256}. Reauditar antes de regenerar.`);
const snapshot = JSON.parse(snapshotBytes.toString('utf8'));
const active = snapshot.services.filter((service) => service.active);
if (active.length !== 52 || drafts.length !== active.length) throw new Error('Se esperan 52 registros activos y 52 propuestas.');

const score = (value, reason) => ({ score: value, reason });
const risky = (draft) => /control|coerci|sumisi|obedien|daño|perjudi|salud|médic|clínic|psicológ|veterinari|ansiedad|enfermedad|depresión|insomnio/i.test(`${draft.issue} ${draft.risk}`);
const items = active.map((service, index) => {
  const draft = drafts[index];
  if (service.id !== draft?.id) throw new Error(`Orden o ID diferente en el índice ${index}: ${service.id}`);
  if (draft.short.length < 140 || draft.short.length > 220 || draft.long.length < 450 || draft.long.length > 800) {
    throw new Error(`Longitud fuera de objetivo para ${service.id}: ${draft.short.length}/${draft.long.length}`);
  }
  const ambiguous = draft.risk.includes('REQUIERE ACLARACIÓN COMERCIAL');
  const severity = risky(draft) ? 'CRITICA' : ambiguous ? 'ALTA' : 'MEDIA';
  const proposed = {
    descriptionShort: draft.short,
    descriptionLong: draft.long,
    idealFor: draft.idealFor,
    benefits: draft.benefits,
    intent: draft.intent,
    notFor: draft.notFor
  };
  return {
    id: service.id,
    original: {
      name: service.name,
      category: service.category,
      slug: service.slug,
      descriptionShort: service.descriptionShort,
      descriptionLong: service.descriptionLong,
      price: service.price,
      order: service.order,
      active: service.active,
      updatedAt: service.updatedAt
    },
    proposed,
    audit: {
      severity,
      dimensions: {
        clarity: score(service.descriptionShort.length > 1000 ? 2 : 3, `La descripción actual tiene ${service.descriptionShort.length} caracteres; ${draft.issue}`),
        differentiation: score(ambiguous ? 1 : 3, draft.distinction),
        length: score(service.descriptionShort.length > 1800 ? 1 : service.descriptionShort.length > 1000 ? 2 : 3, `El mismo texto de ${service.descriptionShort.length} caracteres ocupa las dos descripciones; ${draft.issue}`),
        conversion: score(ambiguous ? 2 : 3, `Antes de decidir falta resolver: ${draft.risk}`),
        credibility: score(risky(draft) ? 1 : 2, draft.issue),
        communicationSafety: score(risky(draft) ? 1 : 3, draft.risk),
        brandIdentity: score(draft.benefits.length ? 4 : 3, draft.benefits.length ? `Conserva un imaginario ritual reconocible: ${draft.benefits[0]}.` : `El nombre conserva identidad esotérica, pero la finalidad del servicio no permite proponer beneficios verificables: ${draft.risk}`),
        informationQuality: score(1, `No constan pasos, duración ni condiciones verificadas para esta propuesta. ${draft.distinction}`)
      },
      issues: [draft.issue],
      reasonForChange: `Ajustar la consulta al foco documentado: ${draft.distinction}`,
      risksAndQuestions: [draft.risk],
      pendingValidation: ambiguous ? 'REQUIERE ACLARACIÓN COMERCIAL' : 'Validar texto, práctica, alcance y condiciones con Lucía'
    },
    status: 'PENDIENTE_APROBACION'
  };
});

const payload = {
  schemaVersion: 1,
  source: 'src/data/generated/services.public.json',
  sourceSha256: sha256,
  sourceType: 'snapshot público validado mediante lectura remota de solo lectura el 2026-11-10; no es garantía de estado futuro',
  approvalState: 'PENDIENTE_APROBACION',
  services: items
};
const escaped = (value) => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const quote = (value) => String(value).trim().split(/\r?\n/).map((line) => line.trimEnd() ? `> ${line.trimEnd()}` : '>').join('\n');
const rows = items.map((item, index) => `| ${index + 1} | ${escaped(item.original.name)} | ${escaped(item.original.category)} | ${escaped(item.audit.severity)} | ${escaped(item.original.descriptionShort.slice(0, 100))}… | ${escaped(item.proposed.descriptionShort)} | ${escaped(item.audit.pendingValidation)} |`);
const sections = items.map((item, index) => `## Servicio ${index + 1}: ${item.original.name}\n\n- ID Firestore: \`${item.id}\`\n- Categoría: ${item.original.category}\n- Precio original, solo referencia: ${item.original.price}\n- Estado: **${item.status}**\n- Severidad: ${item.audit.severity}\n\n### Texto actual completo\n\n${quote(item.original.descriptionLong)}\n\n### Propuesta corta (${item.proposed.descriptionShort.length} caracteres)\n\n${item.proposed.descriptionShort}\n\n### Propuesta larga (${item.proposed.descriptionLong.length} caracteres)\n\n${item.proposed.descriptionLong}\n\n### Campos de orientación propuestos\n\n- Ideal para: ${item.proposed.idealFor.length ? item.proposed.idealFor.join('; ') : 'pendiente de validación; no hay situación segura verificable'}.\n- Características o finalidades simbólicas: ${item.proposed.benefits.length ? item.proposed.benefits.join('; ') : 'pendiente de validación; sin beneficio verificable'}.\n- Intenciones: ${item.proposed.intent.join('; ')}.\n- No orientado a: ${item.proposed.notFor.length ? item.proposed.notFor.join('; ') : 'sin propuesta; validar si corresponde'}.\n\n### Juicio editorial\n\n- Problema: ${item.audit.issues.join('; ')}\n- Cambio: ${item.audit.reasonForChange}\n- Duda o riesgo: ${item.audit.risksAndQuestions.join('; ')}\n`);
const review = `# Revisión humana del copy 3.0\n\n**52 propuestas pendientes de aprobación.** El texto actual procede del snapshot público con SHA-256 \`${sha256}\`. Una lectura remota pública de solo lectura realizada el 2026-11-10 coincidió con sus 52 registros; validar de nuevo antes de aplicar. La tabla ofrece una vista rápida; cada sección contiene el texto original completo y ambas propuestas. Ningún precio se propone ni modifica.\n\n| N.º | Servicio | Categoría | Gravedad | Texto actual (inicio) | Propuesta corta | Pendiente |\n| ---: | --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n\n${sections.join('\n---\n\n')}`;
await writeFile(proposalPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
await writeFile(reviewPath, `${review.trimEnd()}\n`, 'utf8');
console.log(`Generadas ${items.length} propuestas y revisión humana; snapshot ${sha256}.`);
