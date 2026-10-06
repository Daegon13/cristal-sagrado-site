// Validación práctica del único campo de contacto; no intenta verificar existencia.
export function isValidEmail(value) {
  const email = String(value ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/u.test(email)) return false;
  const [local, domain] = email.split("@");
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  return domain.split(".").every((label) => label && !label.startsWith("-") && !label.endsWith("-"));
}

export function isValidPhone(value) {
  const phone = String(value ?? "").trim();
  if (!/^\+?[\d\s()-]+$/u.test(phone)) return false;
  const opens = (phone.match(/\(/g) || []).length;
  const closes = (phone.match(/\)/g) || []).length;
  if (opens !== closes || opens > 1 || phone.indexOf(")") < phone.indexOf("(")) return false;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return false;
  if (/^(\d)\1+$/u.test(digits)) return false;
  if ("01234567890123456789".includes(digits) || "98765432109876543210".includes(digits)) return false;
  return true;
}

export function isValidContact(value) {
  return isValidEmail(value) || isValidPhone(value);
}

export function validateContactData({ name = "", contact = "", message = "" } = {}) {
  const trimmedName = String(name).trim();
  return {
    name: trimmedName.length >= 2 && /\p{L}/u.test(trimmedName),
    contact: isValidContact(contact),
    message: String(message).trim().length > 0
  };
}

export function getContactFormData(form) {
  return {
    name: form.elements.namedItem("nombre")?.value ?? "",
    contact: form.elements.namedItem("contacto")?.value ?? "",
    message: form.elements.namedItem("mensaje")?.value ?? ""
  };
}

export function isValidContactForm(form) {
  return Object.values(validateContactData(getContactFormData(form))).every(Boolean);
}
