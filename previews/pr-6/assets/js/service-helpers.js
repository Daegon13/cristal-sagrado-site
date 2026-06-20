// Helpers compartidos para servicios públicos.
// Mantienen compatibilidad con documentos antiguos de Firestore y preparan modelo v2.

export const WHATSAPP_NUMBER = "59896106373";
const DEFAULT_SERVICE_NAME = "servicio";
const ORDER_FALLBACK = Number.MAX_SAFE_INTEGER;

function cleanString(value, fallback = "") {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
  return fallback;
}

function cleanStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanString(item))
    .filter(Boolean);
}

function cleanBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "si", "sí"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  if (typeof value === "number") return value === 1 ? true : value === 0 ? false : fallback;
  return fallback;
}

function cleanNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function slugifyServiceName(name) {
  const base = cleanString(name, DEFAULT_SERVICE_NAME)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return base || DEFAULT_SERVICE_NAME;
}

export function normalizeService(rawService = {}, id = "") {
  const source = rawService && typeof rawService === "object" ? rawService : {};
  const name = cleanString(source.name || source.title, "Servicio");
  const description = cleanString(source.description);
  const descriptionShort = cleanString(source.descriptionShort, description);
  const descriptionLong = cleanString(source.descriptionLong, description);
  const slug = cleanString(source.slug) || slugifyServiceName(name);
  const order = cleanNumber(source.order, ORDER_FALLBACK);

  return {
    id: cleanString(id || source.id),
    name,
    title: name,
    category: cleanString(source.category),
    description,
    descriptionShort,
    descriptionLong,
    price: cleanNumber(source.price, null),
    duration: cleanNumber(source.duration, null),
    order,
    active: cleanBoolean(source.active, true),
    slug,
    intent: cleanStringArray(source.intent),
    benefits: cleanStringArray(source.benefits),
    idealFor: cleanStringArray(source.idealFor),
    notFor: cleanStringArray(source.notFor),
    featured: cleanBoolean(source.featured, false),
    ctaText: cleanString(source.ctaText),
    updatedAt: cleanString(source.updatedAt)
  };
}

export function buildServiceWhatsappUrl(service) {
  const normalized = normalizeService(service, service?.id);
  const defaultMessage = `Hola Luz, llego desde la web de Cristal Sagrado. Quiero consultar por ${normalized.name}. Mi situación es:`;
  const message = normalized.ctaText || defaultMessage;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function compareServicesForPublic(a, b) {
  const left = normalizeService(a, a?.id);
  const right = normalizeService(b, b?.id);

  if (left.active !== right.active) return left.active ? -1 : 1;
  if (left.featured !== right.featured) return left.featured ? -1 : 1;
  if (left.order !== right.order) return left.order - right.order;
  return left.name.localeCompare(right.name, "es", { sensitivity: "base" });
}
