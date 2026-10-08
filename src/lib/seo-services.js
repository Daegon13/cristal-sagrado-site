import { getPublicServices } from "./public-services.js";
import { seoServices, seoServiceDetails } from "../data/seo-services.js";

export function servicePath(service) { return `/magia-${service.category}/${service.slug}/`; }
export function selectedServices(snapshot) {
  const services = getPublicServices(snapshot);
  const ids = new Set();
  return seoServices.map((editorial) => {
    if (ids.has(editorial.id)) throw new Error(`ID SEO duplicado: ${editorial.id}`);
    ids.add(editorial.id);
    const service = services.find((item) => item.id === editorial.id);
    if (!service || !service.active) throw new Error(`Servicio SEO ausente o inactivo: ${editorial.id}`);
    if (!service.slug || !service.category) throw new Error(`Ruta SEO inválida: ${editorial.id}`);
    if (!seoServiceDetails[editorial.id]) throw new Error(`Descripción SEO ausente: ${editorial.id}`);
    return { ...editorial, detail: seoServiceDetails[editorial.id], service, path: servicePath(service) };
  });
}
export function selectedServicePaths(snapshot) { return selectedServices(snapshot).map(({ path }) => path); }
export function relatedServices(snapshot, selected, limit = 3) {
  return selectedServices(snapshot).filter((item) => item.id !== selected.id)
    .sort((a, b) => Number(b.service.category === selected.service.category) - Number(a.service.category === selected.service.category))
    .slice(0, limit);
}
