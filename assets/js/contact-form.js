import { getContactFormData, validateContactData } from "./contact-validation.js";

export function initContactForm() {
  const form = document.querySelector("#formulario");
  if (!(form instanceof HTMLFormElement)) return;

  // Sin JavaScript siguen activas las restricciones HTML; con JS mostramos errores inline.
  form.noValidate = true;
  const fields = {
    name: form.elements.namedItem("nombre"),
    contact: form.elements.namedItem("contacto"),
    message: form.elements.namedItem("mensaje")
  };
  const errors = {
    name: form.querySelector("#nombre-error"),
    contact: form.querySelector("#contacto-error"),
    message: form.querySelector("#mensaje-error")
  };

  const showValidation = (key, valid) => {
    const field = fields[key];
    const error = errors[key];
    if (!field || !error) return;
    field.toggleAttribute("aria-invalid", !valid);
    if (!valid) field.setAttribute("aria-invalid", "true");
    error.hidden = valid;
  };

  for (const [key, field] of Object.entries(fields)) {
    field?.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") {
        showValidation(key, validateContactData(getContactFormData(form))[key]);
      }
    });
  }

  form.addEventListener("submit", (event) => {
    const results = validateContactData(getContactFormData(form));
    for (const [key, valid] of Object.entries(results)) showValidation(key, valid);
    const firstInvalid = Object.keys(results).find((key) => !results[key]);
    if (!firstInvalid) return;
    event.preventDefault();
    event.stopPropagation();
    fields[firstInvalid]?.focus();
  });
}
