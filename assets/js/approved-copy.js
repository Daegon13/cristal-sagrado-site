import approved from "../../src/data/approved-copy.public.json" with { type: "json" };

export function applyApprovedServiceCopy(service) {
  const entry = approved.services[service?.id];
  if (!entry) return service;
  if (service.name !== entry.name || service.category !== entry.category || service.slug !== entry.slug) {
    throw new Error(`Copy aprobado: identidad del servicio cambió (${service.id})`);
  }
  return { ...service, ...entry.copy };
}
