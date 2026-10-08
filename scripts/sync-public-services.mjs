import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { firebaseConfig } from "../admin/config.js";
import { sanitizePublicServices, validatePublicSnapshot } from "../src/lib/public-services.js";

const snapshotPath = resolve(dirname(fileURLToPath(import.meta.url)), "../src/data/generated/services.public.json");
const remoteFields = ["name", "title", "category", "description", "descriptionShort", "descriptionLong", "price", "duration", "order", "active", "slug", "intent", "benefits", "idealFor", "notFor", "featured", "ctaText", "updatedAt"];

export function decodeFirestoreValue(value) {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(decodeFirestoreValue);
  if ("nullValue" in value) return null;
  return undefined;
}

export async function fetchPublicServices(fetchImpl = fetch) {
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(firebaseConfig.projectId)}/databases/(default)/documents:runQuery?key=${encodeURIComponent(firebaseConfig.apiKey)}`;
  const documents = [];
  let startAt;
  do {
    const structuredQuery = {
      select: { fields: remoteFields.map((fieldPath) => ({ fieldPath })) },
      from: [{ collectionId: "services" }],
      where: { fieldFilter: { field: { fieldPath: "active" }, op: "EQUAL", value: { booleanValue: true } } },
      orderBy: [{ field: { fieldPath: "__name__" }, direction: "ASCENDING" }],
      limit: 100
    };
    if (startAt) structuredQuery.startAt = { values: [{ referenceValue: startAt }], before: false };
    const response = await fetchImpl(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ structuredQuery }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Firestore HTTP ${response.status}`);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error("Respuesta Firestore inválida");
    const batch = rows.filter((row) => row.document).map(({ document }) => ({ id: document.name.split("/").at(-1), data: Object.fromEntries(Object.entries(document.fields || {}).map(([key, value]) => [key, decodeFirestoreValue(value)])) }));
    documents.push(...batch);
    startAt = batch.length === 100 ? rows.filter((row) => row.document).at(-1).document.name : undefined;
  } while (startAt);
  return sanitizePublicServices(documents);
}

export async function syncPublicServices({ fetchImpl = fetch, path = snapshotPath, warn = console.warn } = {}) {
  try {
    const services = await fetchPublicServices(fetchImpl);
    const snapshot = validatePublicSnapshot({ version: 1, services });
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
    return { snapshot, source: "firestore" };
  } catch (error) {
    try {
      const snapshot = validatePublicSnapshot(JSON.parse(await readFile(path, "utf8")));
      warn(`ADVERTENCIA: Firestore no disponible (${error.message}). Se conserva la snapshot pública existente.`);
      return { snapshot, source: "snapshot" };
    } catch (snapshotError) {
      throw new Error(`No se pudo consultar Firestore (${error.message}) y no existe snapshot pública válida (${snapshotError.message}).`);
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  syncPublicServices().then(({ snapshot, source }) => console.log(`Servicios públicos: ${snapshot.services.length} (${source})`)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
