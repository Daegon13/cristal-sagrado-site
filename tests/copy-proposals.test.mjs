import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const sourceBytes = await readFile(new URL('src/data/generated/services.public.json', root));
const source = JSON.parse(sourceBytes.toString('utf8'));
const proposals = JSON.parse(await readFile(new URL('docs/PROPUESTAS_COPY_3_0.json', root), 'utf8'));
const sourceHash = createHash('sha256').update(sourceBytes).digest('hex');
const originalKeys = ['name', 'category', 'slug', 'descriptionShort', 'descriptionLong', 'price', 'order', 'active', 'updatedAt'];
const approvedProposalKeys = ['descriptionShort', 'descriptionLong', 'idealFor', 'benefits', 'intent', 'notFor'];
const dimensionKeys = ['clarity', 'differentiation', 'length', 'conversion', 'credibility', 'communicationSafety', 'brandIdentity', 'informationQuality'];
const expectedHash = 'f135837c794da7f8b66b767d8444d227516777bbf6e1d5dce449dce65ae1aab2';

function tokens(value) {
  return new Set(value.toLocaleLowerCase('es-UY').normalize('NFD').replace(/\p{Diacritic}/gu, '').match(/[a-z]{4,}/g) ?? []);
}
function overlap(a, b) {
  const left = tokens(a);
  const right = tokens(b);
  return [...left].filter((token) => right.has(token)).length / new Set([...left, ...right]).size;
}

test('el origen público permanece en la versión auditada y contiene 52 IDs activos únicos', () => {
  assert.equal(sourceHash, expectedHash);
  assert.equal(proposals.sourceSha256, sourceHash);
  const active = source.services.filter((item) => item.active);
  assert.equal(active.length, 52);
  assert.equal(new Set(active.map((item) => item.id)).size, 52);
  assert.equal(proposals.services.length, 52);
  assert.deepEqual(new Set(proposals.services.map((item) => item.id)), new Set(active.map((item) => item.id)));
});

test('cada propuesta conserva los originales exactos y limita los campos de escritura potencial', () => {
  const byId = new Map(source.services.map((item) => [item.id, item]));
  for (const item of proposals.services) {
    const original = byId.get(item.id);
    assert.ok(original, item.id);
    assert.deepEqual(Object.keys(item.original).sort(), originalKeys.sort(), item.id);
    for (const key of originalKeys) assert.deepEqual(item.original[key], original[key], `${item.id}: ${key}`);
    assert.deepEqual(Object.keys(item.proposed).sort(), approvedProposalKeys.sort(), item.id);
    assert.equal(item.status, 'PENDIENTE_APROBACION', item.id);
    assert.equal(item.original.descriptionShort, item.original.descriptionLong, item.id);
  }
});

test('los 52 pares de textos cumplen los límites y no son duplicados intercambiables', () => {
  const shorts = [];
  const longs = [];
  for (const item of proposals.services) {
    const { descriptionShort: short, descriptionLong: long } = item.proposed;
    assert.ok(short.length >= 140 && short.length <= 220, `${item.id}: short ${short.length}`);
    assert.ok(long.length >= 450 && long.length <= 800, `${item.id}: long ${long.length}`);
    assert.notEqual(short, long, item.id);
    assert.ok(!/\$\s?\d|\b\d+\s?(?:d[ií]as|semanas|horas)\b/i.test(`${short} ${long}`), `${item.id}: precio o plazo nuevo`);
    shorts.push(short);
    longs.push(long);
  }
  assert.equal(new Set(shorts).size, 52);
  assert.equal(new Set(longs).size, 52);
  for (let i = 0; i < 52; i++) {
    for (let j = i + 1; j < 52; j++) {
      assert.ok(overlap(shorts[i], shorts[j]) < 0.75, `Cortos demasiado parecidos: ${i}/${j}`);
      assert.ok(overlap(longs[i], longs[j]) < 0.75, `Largos demasiado parecidos: ${i}/${j}`);
    }
  }
});

test('orientación y puntuaciones son completas y trazables', () => {
  for (const item of proposals.services) {
    const p = item.proposed;
    if (p.idealFor.length === 0) {
      assert.equal(p.benefits.length, 0, `${item.id}: beneficio sin base`);
      assert.match(item.audit.risksAndQuestions.join(' '), /REQUIERE ACLARACIÓN COMERCIAL Y ÉTICA/, item.id);
    } else {
      assert.ok(p.idealFor.length >= 2 && p.idealFor.length <= 4, item.id);
      assert.ok(p.benefits.length > 0, item.id);
    }
    for (const key of ['idealFor', 'benefits', 'intent', 'notFor']) {
      assert.ok(Array.isArray(p[key]) && p[key].every((value) => typeof value === 'string' && value.trim()), `${item.id}: ${key}`);
    }
    assert.ok(item.audit.issues.length && item.audit.risksAndQuestions.length && item.audit.reasonForChange, item.id);
    assert.deepEqual(Object.keys(item.audit.dimensions).sort(), dimensionKeys.sort(), item.id);
    for (const [name, dimension] of Object.entries(item.audit.dimensions)) {
      assert.ok(Number.isInteger(dimension.score) && dimension.score >= 1 && dimension.score <= 5, `${item.id}: ${name}`);
      assert.ok(dimension.reason.length >= 25, `${item.id}: ${name} sin justificación`);
    }
  }
});
