import { slugifyServiceName } from "../assets/js/service-helpers.js";

const LEGACY_FIELDS = ["active", "slug", "descriptionShort", "descriptionLong", "featured", "order"];
const ORDER_FALLBACK = 9999;
const SHORT_DESCRIPTION_LIMIT = 180;

function hasOwn(obj, field) {
  return Object.prototype.hasOwnProperty.call(obj, field);
}

function isBlank(value) {
  return typeof value !== "string" || value.trim() === "";
}

function isValidOrder(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function truncateDescription(value, limit = SHORT_DESCRIPTION_LIMIT) {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trimEnd()}…`;
}

export function getMissingLegacyServiceFields(service = {}) {
  const source = service && typeof service === "object" ? service : {};
  return LEGACY_FIELDS.filter((field) => {
    if (field === "order") return !isValidOrder(source.order);
    return !hasOwn(source, field) || (typeof source[field] === "string" && source[field].trim() === "");
  });
}

export function buildLegacyServiceProposedPatch(service = {}) {
  const source = service && typeof service === "object" ? service : {};
  const patch = {};
  const name = String(source.name ?? source.title ?? "").trim();
  const description = String(source.description ?? "").trim();

  if (!hasOwn(source, "active")) patch.active = true;
  if (!hasOwn(source, "featured")) patch.featured = false;
  if ((!hasOwn(source, "slug") || isBlank(source.slug)) && name) patch.slug = slugifyServiceName(name);
  if ((!hasOwn(source, "descriptionShort") || isBlank(source.descriptionShort)) && description) {
    patch.descriptionShort = truncateDescription(description);
  }
  if ((!hasOwn(source, "descriptionLong") || isBlank(source.descriptionLong)) && description) {
    patch.descriptionLong = description;
  }
  if (!isValidOrder(source.order)) patch.order = ORDER_FALLBACK;

  return patch;
}

export function analyzeLegacyService(service = {}, id = "") {
  const source = service && typeof service === "object" ? service : {};
  const missingFields = getMissingLegacyServiceFields(source);
  const proposedPatch = buildLegacyServiceProposedPatch(source);
  const warnings = [];
  const name = String(source.name ?? source.title ?? "").trim();
  const description = String(source.description ?? "").trim();

  if (missingFields.includes("slug") && !name) {
    warnings.push("Falta name/title: no se genera slug automático.");
  }
  if ((missingFields.includes("descriptionShort") || missingFields.includes("descriptionLong")) && !description) {
    warnings.push("Falta description: no se inventa copy comercial.");
  }

  const proposedFields = Object.keys(proposedPatch);
  return {
    id: String(id ?? ""),
    missingFields,
    proposedPatch,
    safeToPatch: proposedFields.length > 0 && warnings.length === 0,
    warnings
  };
}

export function applyLegacyServicePatchVirtual(service = {}, proposedPatch = {}) {
  return { ...(service || {}), ...(proposedPatch || {}) };
}

export function summarizeLegacyAnalysis(results = []) {
  const list = Array.isArray(results) ? results : [];
  return {
    totalAnalyzed: list.length,
    totalWithProposedChanges: list.filter((item) => Object.keys(item.proposedPatch || {}).length > 0).length,
    totalWithWarnings: list.filter((item) => (item.warnings || []).length > 0).length,
    totalSafeToPatch: list.filter((item) => item.safeToPatch).length
  };
}
