import { buildWhatsappMessage, buildWhatsappUrl, validCase } from "./whatsapp.js";
import { trackEvent } from "./analytics.js";

// El enlace externo existe únicamente después de validar el caso.
const overlay = document.createElement("div");
overlay.className = "contact-overlay";
overlay.hidden = true;
overlay.innerHTML = `<section class="contact-dialog" role="dialog" aria-modal="true" aria-labelledby="contact-title" aria-describedby="contact-description" tabindex="-1">
  <form class="contact-dialog__form" novalidate>
    <h2 id="contact-title">Contame brevemente tu situación</h2>
    <p id="contact-description">Así puedo orientar mejor tu consulta desde el primer mensaje.</p>
    <label for="contact-case">Tu situación</label>
    <textarea id="contact-case" rows="5" required aria-describedby="contact-description contact-error"></textarea>
    <p id="contact-error" class="contact-dialog__error" role="alert" hidden>Contame un poco más sobre tu situación (al menos 18 caracteres).</p>
    <div class="contact-dialog__actions"><button type="button" class="btn btn--ghost" data-contact-cancel>Cancelar</button><button type="submit" class="btn btn--whatsapp">Continuar por WhatsApp</button></div>
  </form>
</section>`;
document.body.append(overlay);

const panel = overlay.querySelector(".contact-dialog");
const form = overlay.querySelector("form");
const textarea = overlay.querySelector("textarea");
const error = overlay.querySelector("#contact-error");
const submit = overlay.querySelector('[type="submit"]');
let opener = null;
let context = {};
let savedScroll = 0;
let savedBodyStyle = "";
let sending = false;
if ("IntersectionObserver" in window) {
  const visibleInline = new Set();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.isIntersecting ? visibleInline.add(entry.target) : visibleInline.delete(entry.target);
    document.body.classList.toggle("inline-cta-visible", visibleInline.size > 0);
  });
  const observe = () => {
    for (const element of visibleInline) if (!element.isConnected) visibleInline.delete(element);
    document.querySelectorAll("#contacto,.final-cta,.serv-cta").forEach((element) => observer.observe(element));
    document.body.classList.toggle("inline-cta-visible", visibleInline.size > 0);
  };
  observe();
  const services = document.querySelector("#lista-servicios");
  if (services) new MutationObserver(observe).observe(services, { childList: true, subtree: true });
}
window.addEventListener("pageshow", () => { sending = false; submit.disabled = false; });

function updateHeight() {
  overlay.style.height = `${window.visualViewport?.height || window.innerHeight}px`;
  overlay.style.top = `${window.visualViewport?.offsetTop || 0}px`;
}

function closeDialog() {
  if (overlay.hidden) return;
  overlay.hidden = true;
  document.body.classList.remove("contact-open");
  document.body.style.cssText = savedBodyStyle;
  window.scrollTo(0, savedScroll);
  opener?.focus();
}

function focusable() {
  return [...panel.querySelectorAll("textarea, button")].filter((item) => !item.disabled && item.getClientRects().length);
}

overlay.querySelector("[data-contact-cancel]").addEventListener("click", closeDialog);
overlay.addEventListener("click", (event) => { if (event.target === overlay) closeDialog(); });
document.addEventListener("keydown", (event) => {
  if (overlay.hidden) return;
  if (event.key === "Escape") { event.preventDefault(); closeDialog(); return; }
  if (event.key !== "Tab") return;
  const controls = focusable();
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
document.addEventListener("focusin", (event) => {
  if (!overlay.hidden && !overlay.contains(event.target)) textarea.focus();
});
window.visualViewport?.addEventListener("resize", updateHeight);
window.visualViewport?.addEventListener("scroll", updateHeight);
window.addEventListener("resize", updateHeight);
textarea.addEventListener("input", () => { error.hidden = true; textarea.removeAttribute("aria-invalid"); });

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (sending) return;
  if (!validCase(textarea.value)) {
    error.hidden = false;
    textarea.setAttribute("aria-invalid", "true");
    textarea.focus();
    return;
  }
  sending = true;
  submit.disabled = true;
  const url = buildWhatsappUrl(buildWhatsappMessage({ ...context, caseText: textarea.value }));
  const properties = { ...context, page: location.pathname, cta_location: context.ctaLocation };
  trackEvent("wa_case_valid", properties);
  trackEvent("wa_outbound", properties);
  closeDialog();
  window.location.assign(url);
  window.setTimeout(() => { sending = false; submit.disabled = false; }, 3000);
});

document.addEventListener("click", (event) => {
  const trigger = event.target instanceof Element ? event.target.closest("[data-whatsapp-trigger]") : null;
  if (!trigger) return;
  event.preventDefault();
  if (!overlay.hidden || sending) return;
  opener = trigger;
  context = {
    serviceName: trigger.dataset.serviceName || "",
    ctaText: trigger.dataset.ctaText || "",
    service: trigger.dataset.serviceSlug || trigger.dataset.serviceName || "",
    category: trigger.dataset.category || location.pathname.match(/magia-(roja|blanca|negra|verde)/)?.[1] || "",
    intent: trigger.dataset.intent || "",
    ctaLocation: trigger.dataset.ctaLocation || "contact_section"
  };
  textarea.value = "";
  error.hidden = true;
  textarea.removeAttribute("aria-invalid");
  savedScroll = window.scrollY;
  savedBodyStyle = document.body.style.cssText;
  document.body.style.position = "fixed";
  document.body.style.top = `-${savedScroll}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  overlay.hidden = false;
  document.body.classList.add("contact-open");
  updateHeight();
  trackEvent("wa_open", { ...context, page: location.pathname, cta_location: context.ctaLocation });
  textarea.focus();
});
