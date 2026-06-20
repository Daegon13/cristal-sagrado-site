import assert from 'node:assert/strict';
import {
  WHATSAPP_NUMBER,
  slugifyServiceName,
  normalizeService,
  buildServiceWhatsappUrl
} from '../assets/js/service-helpers.js';

assert.equal(slugifyServiceName('Limpieza Energética Áurica!!!'), 'limpieza-energetica-aurica');
assert.equal(slugifyServiceName(''), 'servicio');

const complete = normalizeService({
  name: 'Protección Espiritual',
  category: 'blanca',
  description: 'Base',
  descriptionShort: 'Corta',
  descriptionLong: 'Larga',
  price: '1500',
  duration: '7',
  order: '2',
  active: false,
  slug: 'proteccion-espiritual',
  intent: [' protección ', 33, ''],
  benefits: ['Calma'],
  idealFor: ['Hogar'],
  notFor: ['Emergencias médicas'],
  featured: 'true',
  ctaText: 'Mensaje personalizado',
  updatedAt: '2026-06-20T00:00:00.000Z'
}, 'abc');
assert.deepEqual(complete, {
  id: 'abc',
  name: 'Protección Espiritual',
  title: 'Protección Espiritual',
  category: 'blanca',
  description: 'Base',
  descriptionShort: 'Corta',
  descriptionLong: 'Larga',
  price: 1500,
  duration: 7,
  order: 2,
  active: false,
  slug: 'proteccion-espiritual',
  intent: ['protección', '33'],
  benefits: ['Calma'],
  idealFor: ['Hogar'],
  notFor: ['Emergencias médicas'],
  featured: true,
  ctaText: 'Mensaje personalizado',
  updatedAt: '2026-06-20T00:00:00.000Z'
});

const legacy = normalizeService({ name: 'Tarot del amor', description: 'Lectura completa' }, 'old');
assert.equal(legacy.descriptionShort, 'Lectura completa');
assert.equal(legacy.descriptionLong, 'Lectura completa');
assert.equal(legacy.active, true);
assert.equal(legacy.featured, false);
assert.equal(legacy.slug, 'tarot-del-amor');
assert.deepEqual(legacy.intent, []);

const corruptInput = { name: null, description: {}, price: 'abc', duration: undefined, order: 'x', active: 'nope', benefits: 'bad' };
const corrupt = normalizeService(corruptInput, 99);
assert.equal(corrupt.id, '99');
assert.equal(corrupt.name, 'Servicio');
assert.equal(corrupt.price, null);
assert.equal(corrupt.duration, null);
assert.equal(corrupt.order, Number.MAX_SAFE_INTEGER);
assert.equal(corrupt.active, true);
assert.deepEqual(corrupt.benefits, []);
assert.deepEqual(corruptInput, { name: null, description: {}, price: 'abc', duration: undefined, order: 'x', active: 'nope', benefits: 'bad' });

const url = buildServiceWhatsappUrl({ name: 'Tarot & amor' });
assert.ok(url.startsWith(`https://wa.me/${WHATSAPP_NUMBER}?text=`));
assert.equal(decodeURIComponent(url.split('text=')[1]), 'Hola Luz, llego desde la web de Cristal Sagrado. Quiero consultar por Tarot & amor. Mi situación es:');
assert.equal(buildServiceWhatsappUrl({ name: 'X', ctaText: 'Hola especial' }), `https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20especial`);

console.log('service helpers ok');
