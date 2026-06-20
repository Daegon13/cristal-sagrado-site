import assert from 'node:assert/strict';
import {
  buildServiceWhatsappPreviewUrl,
  linesToStringArray,
  sanitizeSlug,
  serviceFormDataToPayload,
  stringArrayToLines
} from '../admin/service-form-helpers.js';

assert.deepEqual(linesToStringArray(' Amor \n\nProtección\namor\nProtección '), ['Amor', 'Protección']);
assert.equal(stringArrayToLines([' Amor ', '', null, 'Protección']), 'Amor\nProtección');
assert.equal(sanitizeSlug('', 'Limpieza Energética Áurica'), 'limpieza-energetica-aurica');
assert.equal(sanitizeSlug('slug-manual', 'Otro nombre'), 'slug-manual');

const formData = new FormData();
formData.set('name', 'Tarot del amor');
formData.set('description', 'Legacy');
formData.set('price', '1500');
formData.set('duration', '7');
formData.set('order', '3');
formData.set('active', 'on');
formData.set('featured', 'on');
formData.set('descriptionShort', 'Corta');
formData.set('descriptionLong', 'Larga');
formData.set('intent', 'Volver\nClaridad\nVolver');
formData.set('benefits', 'Calma');
formData.set('idealFor', 'Consultas afectivas');
formData.set('notFor', 'Emergencias médicas');
formData.set('ctaText', 'Mensaje propio');

const now = new Date('2026-06-20T00:00:00.000Z');
const payload = serviceFormDataToPayload(formData, { category: 'roja', now });
assert.deepEqual(payload, {
  name: 'Tarot del amor',
  category: 'roja',
  description: 'Legacy',
  price: 1500,
  duration: 7,
  order: 3,
  active: true,
  slug: 'tarot-del-amor',
  descriptionShort: 'Corta',
  descriptionLong: 'Larga',
  featured: true,
  ctaText: 'Mensaje propio',
  updatedAt: '2026-06-20T00:00:00.000Z',
  intent: ['Volver', 'Claridad'],
  benefits: ['Calma'],
  idealFor: ['Consultas afectivas'],
  notFor: ['Emergencias médicas'],
  createdAt: '2026-06-20T00:00:00.000Z'
});

const unchecked = new FormData();
unchecked.set('name', 'Protección espiritual');
const uncheckedPayload = serviceFormDataToPayload(unchecked, { category: 'blanca', existing: { createdAt: 'old' }, now });
assert.equal(uncheckedPayload.active, false);
assert.equal(uncheckedPayload.featured, false);
assert.equal(uncheckedPayload.createdAt, undefined);
assert.equal(uncheckedPayload.order, 0);

const preview = buildServiceWhatsappPreviewUrl({ name: 'Tarot & amor' });
assert.equal(decodeURIComponent(preview.split('text=')[1]), 'Hola Luz, llego desde la web de Cristal Sagrado. Quiero consultar por Tarot & amor. Mi situación es:');
assert.ok(preview.startsWith('https://wa.me/59896106373?text='));

console.log('admin service form helpers ok');
