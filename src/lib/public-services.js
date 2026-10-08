import { normalizeService, compareServicesForPublic } from "../../assets/js/service-helpers.js";

export const PUBLIC_FIELDS = ["id", "name", "category", "descriptionShort", "descriptionLong", "price", "duration", "order", "active", "slug", "intent", "benefits", "idealFor", "notFor", "featured", "ctaText", "updatedAt"];
export const SERVICE_CATEGORIES = ["blanca", "roja", "negra", "verde"];

export function sanitizePublicServices(documents) {
  if (!Array.isArray(documents)) throw new Error("La respuesta de services no es una lista");
  const services = documents.map(({ id, data }) => {
    const normalized = normalizeService(data, id);
    return Object.fromEntries(PUBLIC_FIELDS.map((field) => [field, normalized[field]]));
  }).filter((service) => service.active === true && SERVICE_CATEGORIES.includes(service.category));
  services.sort(compareServicesForPublic);
  if (!services.length) throw new Error("La consulta no devolvió servicios públicos activos");
  return services;
}

export function validatePublicSnapshot(snapshot) {
  if (!snapshot || snapshot.version !== 1 || !Array.isArray(snapshot.services) || !snapshot.services.length) throw new Error("Snapshot pública ausente o vacía");
  for (const service of snapshot.services) {
    if (!service || Object.keys(service).some((key) => !PUBLIC_FIELDS.includes(key)) || service.active !== true || !SERVICE_CATEGORIES.includes(service.category) || !service.id || !service.name || !service.slug || !service.descriptionShort) throw new Error("Snapshot pública inválida o con campos no permitidos");
  }
  return snapshot;
}

export function getPublicServices(snapshot) { return validatePublicSnapshot(snapshot).services; }
export function getServicesByCategory(snapshot, category) { return getPublicServices(snapshot).filter((service) => service.category === category); }
export function getServiceBySlug(snapshot, category, slug) { return getServicesByCategory(snapshot, category).find((service) => service.slug === slug); }
export function getServiceById(snapshot, id) { return getPublicServices(snapshot).find((service) => service.id === id); }
