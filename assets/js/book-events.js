import { trackEvent } from "./analytics.js";

const slug = document.querySelector("[data-book-slug]")?.dataset.bookSlug;
if (slug) trackEvent("book_view", { book_slug: slug, page: location.pathname });

document.addEventListener("click", (event) => {
  const link = event.target instanceof Element ? event.target.closest("a[data-book-event]") : null;
  if (!link) return;
  trackEvent(link.dataset.bookEvent, { book_slug: link.dataset.bookSlug, cta_location: link.dataset.ctaLocation, page: location.pathname });
});
