// BLOQUE CONTACTO: número, validación y mensajes compartidos por web y admin.
export const WHATSAPP_NUMBER = "59896106373";
export const MIN_CASE_LENGTH = 18;
const INTRO = "Hola Luz, llego desde la web de Cristal Sagrado.";

export function validCase(value) {
  const text = String(value ?? "").trim();
  return text.length >= MIN_CASE_LENGTH && /[\p{L}\p{N}]/u.test(text) && text.replace(/[^\p{L}\p{N}]/gu, "").length >= 10;
}

export function buildWhatsappPreviewMessage({ serviceName = "", ctaText = "" } = {}) {
  const custom = String(ctaText ?? "").trim();
  if (custom) return custom;
  const service = String(serviceName ?? "").trim() || "este servicio";
  return `${INTRO} Quiero consultar por ${service}. Mi situación es:`;
}

export function buildWhatsappMessage({ serviceName = "", ctaText = "", caseText = "" } = {}) {
  if (!validCase(caseText)) throw new Error("Contame un poco más sobre tu situación.");
  const custom = String(ctaText ?? "").trim();
  const service = String(serviceName ?? "").trim();
  const context = custom || (service ? `${INTRO}\nQuiero consultar por ${service}.` : INTRO);
  return `${context.replace(/\s*Mi situación es:\s*$/i, "").trim()}\n\nMi situación es:\n${String(caseText).trim()}`;
}

export function buildWhatsappUrl(message, number = WHATSAPP_NUMBER) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
