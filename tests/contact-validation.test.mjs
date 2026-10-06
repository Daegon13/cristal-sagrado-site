import test from "node:test";
import assert from "node:assert/strict";
import { isValidEmail, isValidPhone, isValidContact, validateContactData, isValidContactForm } from "../assets/js/contact-validation.js";
import { trackEvent } from "../assets/js/analytics.js";

test("emails comunes internacionales pasan y formatos inválidos fallan", () => {
  for (const value of ["luz@example.com", "consulta+tarot@mail.co.uk", "persona@ejemplo.uy"]) assert.equal(isValidEmail(value), true, value);
  for (const value of ["sin-arroba", "a@", "a@dominio", "a..b@example.com", "a@ejemplo..com"]) assert.equal(isValidEmail(value), false, value);
});

test("teléfonos plausibles locales e internacionales pasan", () => {
  for (const value of ["+598 99 123 456", "+57 300 123 4567", "099123456", "(598) 99 123 456", "+34 612 345 678"]) {
    assert.equal(isValidPhone(value), true, value);
    assert.equal(isValidContact(value), true, value);
  }
});

test("teléfonos falsos, demasiado cortos o largos fallan", () => {
  for (const value of ["00000000", "000000000000", "111111111111", "12345678", "1234567", "1234567890123456", "+598 abc 123456", "++59899123456"]) {
    assert.equal(isValidPhone(value), false, value);
    assert.equal(isValidContact(value), false, value);
  }
});

test("nombre, contacto y mensaje deben ser válidos antes de enviar", () => {
  assert.deepEqual(validateContactData({ name: "Luz", contact: "000000000000", message: "Consulta" }), { name: true, contact: false, message: true });
  assert.deepEqual(validateContactData({ name: " ", contact: "luz@example.com", message: "   " }), { name: false, contact: true, message: false });
  const form = (name, contact, message) => ({ elements: { namedItem: (key) => ({ value: { nombre: name, contacto: contact, mensaje: message }[key] }) } });
  assert.equal(isValidContactForm(form("Luz", "+598 99 123 456", "Quiero consultar")), true);
  assert.equal(isValidContactForm(form("Luz", "000000000000", "Quiero consultar")), false);
  assert.equal(isValidContactForm(form("Luz", "luz@example.com", " ")), false);
});

test("form_submit no se emite para contacto inválido ni contiene datos privados", () => {
  const form = { elements: { namedItem: (key) => ({ value: { nombre: "Luz", contacto: "000000000000", mensaje: "Texto privado" }[key] }) } };
  const events = [];
  const umami = { track: (...args) => events.push(args) };
  if (isValidContactForm(form)) trackEvent("form_submit", { page: "/", contact: "000000000000", message: "Texto privado" }, umami);
  assert.deepEqual(events, []);
  form.elements.namedItem = (key) => ({ value: { nombre: "Luz", contacto: "luz@example.com", mensaje: "Texto privado" }[key] });
  if (isValidContactForm(form)) trackEvent("form_submit", { page: "/", contact: "luz@example.com", message: "Texto privado" }, umami);
  assert.deepEqual(events, [["form_submit", { page: "/" }]]);
});
