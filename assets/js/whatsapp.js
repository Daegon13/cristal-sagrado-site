// BLOQUE CONTACTO: número, validación y mensajes compartidos por web y admin.
export const WHATSAPP_NUMBER = "59896106373";
export const MIN_CASE_LENGTH = 12;
export const MIN_CASE_ALPHANUMERIC = 6;
const INTRO = "Hola Luz, llego desde la web de Cristal Sagrado.";

export function validCase(value) {
  const text = String(value ?? "").trim();
  const words = text.match(/[\p{L}\p{N}]+/gu) || [];
  return text.length >= MIN_CASE_LENGTH && words.join("").length >= MIN_CASE_ALPHANUMERIC && new Set(words.map((word) => word.toLowerCase())).size >= 2;
}

export function buildWhatsappPreviewMessage({ serviceName = "", ctaText = "" } = {}) {
  const custom = String(ctaText ?? "").trim();
  if (custom) return custom;
  const service = String(serviceName ?? "").trim() || "este servicio";
  return `${INTRO} Quiero consultar por ${service}. Mi situación es:`;
}

export function buildWhatsappMessage({ serviceName = "", ctaText = "", intent = "", category = "", caseText = "" } = {}) {
  if (!validCase(caseText)) throw new Error("Contame un poco más sobre tu situación.");
  const custom = String(ctaText ?? "").trim();
  const service = String(serviceName ?? "").trim();
  const topic = service || String(intent ?? "").trim() || (category ? `magia ${String(category).trim()}` : "");
  const context = custom || (topic ? `${INTRO}\nQuiero consultar por ${topic}.` : INTRO);
  return `${context.replace(/\s*Mi situación es:\s*$/i, "").trim()}\n\nMi situación es:\n${String(caseText).trim()}`;
}

export function buildWhatsappUrl(message, number = WHATSAPP_NUMBER) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
