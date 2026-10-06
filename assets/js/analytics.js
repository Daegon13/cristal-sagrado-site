// Analítica pública: propiedades controladas y saneamiento antes de Umami.
export const ALLOWED_UTM = new Set(["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]);
const DENIED_KEYS = new Set(["message", "mensaje", "case", "caso", "email", "phone", "telefono", "name", "nombre", "whatsapp_text"]);
const EVENT_PROPERTIES = {
  wa_open: ["page", "cta_location", "category", "service", "intent"],
  wa_case_valid: ["page", "cta_location", "category", "service", "intent"],
  wa_outbound: ["page", "cta_location", "category", "service", "intent"],
  intent_click: ["intent", "page"],
  service_detail: ["service", "category"],
  service_wa: ["service", "category"],
  form_submit: ["page"],
  nav_cta: ["page", "cta_location", "category"]
};
const normalizeKey = (key) => key.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase().replace(/[-\s]/g, "_");
const isPrivateKey = (key) => {
  const normalized = normalizeKey(key);
  return DENIED_KEYS.has(normalized) || /^(message|mensaje|case|caso|email|phone|telefono)(_|$)/.test(normalized);
};

export function sanitizeAnalyticsUrl(value, base = "https://cristal-sagrado.com", preserveOrigin = false) {
  if (typeof value !== "string" || !value) return "/";
  let url;
  try { url = new URL(value, base); } catch { return "/"; }
  const query = new URLSearchParams();
  for (const [key, val] of url.searchParams) if (ALLOWED_UTM.has(key.toLowerCase())) query.append(key.toLowerCase(), val);
  return `${preserveOrigin ? url.origin : ""}${url.pathname}${query.size ? `?${query.toString()}` : ""}`;
}

function stripPrivateKeys(value) {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(stripPrivateKeys);
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !isPrivateKey(key))
    .map(([key, item]) => [key, stripPrivateKeys(item)]));
}

export function sanitizeUmamiPayload(type, payload, currentUrl) {
  if (!payload || typeof payload !== "object") return payload;
  const safe = stripPrivateKeys(payload);
  if (typeof safe.url === "string") safe.url = sanitizeAnalyticsUrl(safe.url, currentUrl);
  if (typeof safe.referrer === "string" && safe.referrer) safe.referrer = sanitizeAnalyticsUrl(safe.referrer, currentUrl, true);
  if (typeof safe.url !== "string" && (type === "pageview" || type === "event") && currentUrl) safe.url = sanitizeAnalyticsUrl(currentUrl);
  return safe;
}

export function trackEvent(name, properties = {}, umami = globalThis.umami) {
  try {
    const allowed = EVENT_PROPERTIES[name];
    if (!allowed || typeof umami?.track !== "function") return false;
    const data = {};
    for (const key of allowed) {
      const value = properties[key];
      if (value === undefined || value === null || typeof value === "object") continue;
      const clean = String(value).trim();
      if (clean && !DENIED_KEYS.has(key)) data[key] = clean;
    }
    umami.track(name, data);
    return true;
  } catch {
    return false;
  }
}
