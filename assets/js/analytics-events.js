import { trackEvent } from "./analytics.js";

const page = () => `${location.pathname}`;
const categoryFromPath = () => location.pathname.match(/magia-(roja|blanca|negra|verde)/)?.[1] || "";
const locationFor = (link) => link.dataset.ctaLocation || (link.closest("header") ? "header" : link.closest("footer") ? "footer" : link.closest(".intent-card") ? "intent" : link.closest(".final-cta") ? "final_cta" : link.closest(".serv-card") ? "service_card" : link.closest(".category-page") ? "contact_section" : link.closest(".hero") ? "hero" : "contact_section");
const contextFor = (link) => ({
  page: page(), cta_location: locationFor(link), category: link.dataset.category || categoryFromPath(),
  service: link.dataset.serviceSlug || link.dataset.serviceName || "", intent: link.dataset.intent || ""
});

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const intentLink = target?.closest(".intent-card a[href^='https://wa.me/']");
  if (intentLink) trackEvent("intent_click", { intent: intentLink.dataset.intent, page: page() });

  const link = target?.closest("a[href^='https://wa.me/']");
  if (!link) {
    const cta = target?.closest("a[data-cta-location]");
    if (cta) trackEvent("nav_cta", { page: page(), cta_location: cta.dataset.ctaLocation });
    return;
  }
  const context = contextFor(link);
  trackEvent("nav_cta", { page: context.page, cta_location: context.cta_location });
  if (link.dataset.serviceName || link.dataset.serviceSlug) {
    trackEvent("service_wa", { service: link.dataset.serviceSlug || link.dataset.serviceName, category: context.category });
  }
}, true);

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const toggle = target?.closest(".serv-toggle");
  if (!toggle) return;
  const card = toggle.closest(".serv-card");
  const description = card?.querySelector(".serv-desc");
  if (description && !description.classList.contains("clamp-3")) {
    trackEvent("service_detail", { service: card?.dataset.slug || card?.querySelector(".serv-title")?.textContent, category: categoryFromPath() });
  }
});

document.addEventListener("submit", (event) => {
  if (event.target instanceof HTMLFormElement && event.target.id === "formulario" && event.target.checkValidity()) {
    trackEvent("form_submit", { page: page() });
  }
});
