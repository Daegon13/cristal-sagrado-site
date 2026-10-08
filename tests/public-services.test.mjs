import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sanitizePublicServices, validatePublicSnapshot, getServicesByCategory, getServiceBySlug, getServiceById, PUBLIC_FIELDS } from "../src/lib/public-services.js";
import { decodeFirestoreValue, fetchPublicServices, syncPublicServices } from "../scripts/sync-public-services.mjs";

const documents = [
  { id: "second", data: { name: "Zeta", category: "blanca", description: "Descripción Z", order: 2, active: true, privateNote: "NO PUBLICAR" } },
  { id: "first", data: { name: "Ámbar", category: "blanca", descriptionShort: "Descripción A", order: 1, active: true, featured: true } },
  { id: "hidden", data: { name: "Oculto", category: "roja", description: "Privado", active: false } }
];

test("normaliza, filtra, ordena y limita los campos públicos", () => {
  const services = sanitizePublicServices(documents);
  assert.deepEqual(services.map((service) => service.id), ["first", "second"]);
  assert.deepEqual(Object.keys(services[0]), PUBLIC_FIELDS);
  assert.equal(services[1].descriptionShort, "Descripción Z");
  assert.ok(!JSON.stringify(services).includes("NO PUBLICAR"));
  const snapshot = validatePublicSnapshot({ version: 1, services });
  assert.equal(getServicesByCategory(snapshot, "blanca").length, 2);
  assert.equal(getServicesByCategory(snapshot, "roja").length, 0);
  assert.equal(getServiceBySlug(snapshot, "blanca", "ambar").id, "first");
  assert.equal(getServiceById(snapshot, "second").name, "Zeta");
  assert.throws(() => validatePublicSnapshot({ version: 1, services: [{ ...services[0], email: "private@example.com" }] }));
});

test("decodifica respuesta REST y consulta solo servicios activos", async () => {
  assert.deepEqual(decodeFirestoreValue({ arrayValue: { values: [{ stringValue: "uno" }] } }), ["uno"]);
  const mock = async (_url, options) => {
    const query = JSON.parse(options.body).structuredQuery;
    assert.equal(query.from[0].collectionId, "services");
    assert.equal(query.where.fieldFilter.value.booleanValue, true);
    assert.ok(!query.select.fields.some((field) => field.fieldPath === "privateNote"));
    return { ok: true, json: async () => [{ document: { name: "projects/x/databases/(default)/documents/services/first", fields: { name: { stringValue: "Ámbar" }, category: { stringValue: "blanca" }, descriptionShort: { stringValue: "Descripción A" }, active: { booleanValue: true } } } }] };
  };
  assert.equal((await fetchPublicServices(mock))[0].slug, "ambar");
});

test("usa snapshot válida ante fallo y falla si no existe", async () => {
  const dir = await mkdtemp(join(tmpdir(), "cristal-services-"));
  const path = join(dir, "services.public.json");
  const snapshot = { version: 1, services: sanitizePublicServices(documents) };
  const failure = async () => { throw new Error("sin conexión"); };
  try {
    await writeFile(path, JSON.stringify(snapshot));
    const warnings = [];
    const result = await syncPublicServices({ fetchImpl: failure, path, warn: (message) => warnings.push(message) });
    assert.equal(result.source, "snapshot");
    assert.match(warnings[0], /Firestore no disponible/);
    assert.deepEqual(JSON.parse(await readFile(path, "utf8")), snapshot);
    await writeFile(path, "{}");
    await assert.rejects(syncPublicServices({ fetchImpl: failure, path }), /no existe snapshot pública válida/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
