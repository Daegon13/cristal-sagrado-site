import assert from 'node:assert/strict';
import {
  analyzeLegacyService,
  applyLegacyServicePatchVirtual,
  buildLegacyServiceProposedPatch,
  getMissingLegacyServiceFields,
  summarizeLegacyAnalysis
} from '../admin/legacy-service-backfill-helpers.js';

const legacy = { name: 'Tarot del amor', category: 'roja', description: 'Lectura completa para tomar decisiones con calma.' };
const analyzed = analyzeLegacyService(legacy, 'abc123456');
assert.ok(analyzed.missingFields.includes('active'));
assert.equal(analyzed.proposedPatch.active, true);
assert.equal(analyzed.proposedPatch.featured, false);
assert.equal(analyzed.proposedPatch.slug, 'tarot-del-amor');
assert.equal(analyzed.proposedPatch.descriptionLong, legacy.description);
assert.equal(analyzed.safeToPatch, true);

const noSlug = analyzeLegacyService({ title: 'Protección Áurica', description: 'Texto base', active: true, featured: false, descriptionShort: 'Texto base', descriptionLong: 'Texto base', order: 1 }, 'id');
assert.deepEqual(noSlug.proposedPatch, { slug: 'proteccion-aurica' });

const complete = { name: 'Completo', active: true, slug: 'completo', description: 'Base', descriptionShort: 'Corta', descriptionLong: 'Larga', featured: false, order: 2, extra: 'preservar' };
assert.deepEqual(analyzeLegacyService(complete, 'ok').proposedPatch, {});
assert.equal(analyzeLegacyService(complete, 'ok').safeToPatch, false);
assert.deepEqual(getMissingLegacyServiceFields(complete), []);

const withoutName = analyzeLegacyService({ description: 'Base' }, 'noname');
assert.ok(withoutName.warnings.some((warning) => warning.includes('name/title')));
assert.equal(withoutName.safeToPatch, false);
assert.equal(withoutName.proposedPatch.slug, undefined);

const withoutDescription = analyzeLegacyService({ name: 'Sin descripción' }, 'nodesc');
assert.ok(withoutDescription.warnings.some((warning) => warning.includes('description')));
assert.equal(withoutDescription.safeToPatch, false);
assert.equal(withoutDescription.proposedPatch.descriptionShort, undefined);
assert.equal(withoutDescription.proposedPatch.descriptionLong, undefined);

const original = { ...complete };
const patch = buildLegacyServiceProposedPatch(complete);
assert.deepEqual(complete, original);
assert.deepEqual(patch, {});

const existingFields = { name: 'Manual', description: 'Base', active: false, slug: 'manual', featured: true, descriptionShort: 'Corta', descriptionLong: 'Larga', order: 0 };
assert.deepEqual(buildLegacyServiceProposedPatch(existingFields), {});

const onlyMissing = buildLegacyServiceProposedPatch({ name: 'Orden faltante', description: 'Base', active: true, slug: 'orden-faltante', featured: false, descriptionShort: 'Corta', descriptionLong: 'Larga' });
assert.deepEqual(onlyMissing, { order: 9999 });

const virtual = applyLegacyServicePatchVirtual(legacy, analyzed.proposedPatch);
assert.notEqual(virtual, legacy);
assert.equal(legacy.active, undefined);
assert.equal(virtual.active, true);
assert.equal(virtual.category, 'roja');

assert.deepEqual(summarizeLegacyAnalysis([analyzed, withoutName]), {
  totalAnalyzed: 2,
  totalWithProposedChanges: 2,
  totalWithWarnings: 1,
  totalSafeToPatch: 1
});

console.log('legacy service backfill helpers ok');
