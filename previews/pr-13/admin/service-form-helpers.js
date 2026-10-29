import { slugifyServiceName } from "../assets/js/service-helpers.js";
import { WHATSAPP_NUMBER, buildWhatsappUrl, buildWhatsappPreviewMessage } from "../assets/js/whatsapp.js";

const ARRAY_FIELDS = ["intent", "benefits", "idealFor", "notFor"];

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

export function linesToStringArray(value) {
  const seen = new Set();
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      const key = line.toLocaleLowerCase("es");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function stringArrayToLines(value) {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .join("\n");
}

export function sanitizeSlug(value, fallbackName = "") {
  const manualSlug = String(value ?? "").trim();
  return manualSlug || slugifyServiceName(fallbackName);
}

export function getServiceWhatsappMessage({ name = "", ctaText = "" } = {}) {
  return buildWhatsappPreviewMessage({ serviceName: name, ctaText });
}

export function buildServiceWhatsappPreviewUrl(service, whatsappNumber = WHATSAPP_NUMBER) {
  return buildWhatsappUrl(getServiceWhatsappMessage(service), whatsappNumber);
}

export function serviceFormDataToPayload(formData, { category, existing = null, now = new Date() } = {}) {
  const name = String(formData.get("name") ?? formData.get("title") ?? "").trim();
  const payload = {
    name,
    category: String(category ?? formData.get("category") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price: parseOptionalNumber(formData.get("price")),
    duration: parseOptionalNumber(formData.get("duration")),
    order: parseOptionalNumber(formData.get("order"), 0),
    active: formData.has("active"),
    slug: sanitizeSlug(formData.get("slug"), name),
    descriptionShort: String(formData.get("descriptionShort") ?? "").trim(),
    descriptionLong: String(formData.get("descriptionLong") ?? "").trim(),
    featured: formData.has("featured"),
    ctaText: String(formData.get("ctaText") ?? "").trim(),
    updatedAt: now.toISOString()
  };

  ARRAY_FIELDS.forEach((field) => {
    payload[field] = linesToStringArray(formData.get(field));
  });

  if (!existing?.createdAt) {
    payload.createdAt = now.toISOString();
  }

  return payload;
}

export function parseOptionalNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return isFiniteNumber(parsed) ? parsed : fallback;
}

export { slugifyServiceName };
