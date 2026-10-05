import { buildWhatsappMessage, buildWhatsappUrl, validCase } from "./whatsapp.js";
import { trackEvent } from "./analytics.js";

// BLOQUE CONTACTO: un solo diálogo para todos los enlaces públicos, incluidos los creados por Firestore.
const dialog = document.createElement("dialog");
dialog.className = "contact-dialog";
dialog.setAttribute("aria-labelledby", "contact-title");
dialog.setAttribute("aria-describedby", "contact-description");
dialog.innerHTML = `<form method="dialog" class="contact-dialog__form" novalidate>
  <h2 id="contact-title">Contame brevemente tu situación</h2>
  <p id="contact-description">Así puedo orientar mejor tu consulta desde el primer mensaje.</p>
  <label for="contact-case">Tu situación</label>
  <textarea id="contact-case" rows="5" required aria-describedby="contact-error"></textarea>
  <p id="contact-error" class="contact-dialog__error" role="alert" hidden>Contame un poco más sobre tu situación (al menos 18 caracteres).</p>
  <div class="contact-dialog__actions"><button type="button" class="btn btn--ghost" data-contact-cancel>Cancelar</button><button type="submit" class="btn btn--whatsapp">Continuar por WhatsApp</button></div>
</form>`;
document.body.append(dialog);

const textarea = dialog.querySelector("textarea");
const error = dialog.querySelector("#contact-error");
let opener = null;
let context = {};
let previousOverflow = "";

function closeDialog() { dialog.close(); }
dialog.querySelector("[data-contact-cancel]").addEventListener("click", closeDialog);
dialog.addEventListener("close", () => {
  document.body.style.overflow = previousOverflow;
  opener?.focus();
});
dialog.addEventListener("click", (event) => { if (event.target === dialog) closeDialog(); });
dialog.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  const controls = [textarea, dialog.querySelector("[data-contact-cancel]"), dialog.querySelector('[type="submit"]')];
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
textarea.addEventListener("input", () => { error.hidden = true; textarea.removeAttribute("aria-invalid"); });

dialog.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validCase(textarea.value)) {
    error.hidden = false;
    textarea.setAttribute("aria-invalid", "true");
    textarea.focus();
    return;
  }
  const url = buildWhatsappUrl(buildWhatsappMessage({ ...context, caseText: textarea.value }));
  const properties = { ...context, page: location.pathname, cta_location: context.ctaLocation };
  trackEvent("wa_case_valid", properties);
  trackEvent("wa_outbound", properties);
  closeDialog();
  window.location.assign(url);
});

document.addEventListener("click", (event) => {
  const link = event.target.closest?.('a[href^="https://wa.me/"]');
  if (!link || !link.href.startsWith("https://wa.me/")) return;
  event.preventDefault();
  opener = link;
  // Los enlaces HTML antiguos conservan su href como respaldo; se extrae su contexto de servicio.
  const legacyMessage = new URL(link.href).searchParams.get("text") || "";
  const legacyService = legacyMessage.match(/Quiero consultar por (.+?)\./i)?.[1] || "";
  context = { serviceName: link.dataset.serviceName || legacyService, ctaText: link.dataset.ctaText || "" };
  context = { ...context, service: link.dataset.serviceSlug || context.serviceName, category: link.dataset.category || location.pathname.match(/magia-(roja|blanca|negra|verde)/)?.[1], intent: link.dataset.intent };
  const ctaLocation = link.dataset.ctaLocation || (link.closest("header") ? "header" : link.closest("footer") ? "footer" : link.closest(".intent-card") ? "intent" : link.closest(".final-cta") ? "final_cta" : link.closest(".serv-card") ? "service_card" : link.closest(".category-page") ? "contact_section" : link.closest(".hero") ? "hero" : "contact_section");
  context.ctaLocation = ctaLocation;
  trackEvent("wa_open", { ...context, page: location.pathname, cta_location: ctaLocation });
  textarea.value = "";
  error.hidden = true;
  textarea.removeAttribute("aria-invalid");
  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  dialog.showModal();
  textarea.focus();
});
