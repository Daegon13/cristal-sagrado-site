import { pathToFileURL } from "node:url";

const DAY_MS = 24 * 60 * 60 * 1000;
const TIMEZONE = "America/Montevideo";
const EVENT_NAMES = ["wa_open", "wa_case_valid", "wa_outbound", "form_submit", "intent_click", "service_wa", "service_detail", "nav_cta"];
const PRIVATE_KEY = /(?:message|mensaje|case|caso|email|phone|telefono|name|nombre|ip|user.?agent|distinct.?id|session.?id|visitor.?id|firebase)/i;
const PRIVATE_VALUE = /(?:[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\d().\s-]{7,}\d))/i;

export function safeDivide(numerator, denominator) {
  return Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0 ? numerator / denominator : null;
}

export function percentChange(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function percentagePoints(currentRatio, previousRatio) {
  return Number.isFinite(currentRatio) && Number.isFinite(previousRatio) ? (currentRatio - previousRatio) * 100 : null;
}

export function normalizeApiBase(value) {
  let url;
  try { url = new URL(String(value ?? "").trim()); } catch { throw new Error("UMAMI_API_BASE debe ser una URL válida."); }
  if (url.protocol !== "https:" && url.hostname !== "localhost") throw new Error("UMAMI_API_BASE debe usar HTTPS.");
  url.pathname = url.pathname.replace(/\/+$/, "");
  if (!url.pathname.endsWith("/api") || url.pathname.split("/").filter((part) => part === "api").length !== 1) throw new Error("UMAMI_API_BASE debe incluir /api exactamente una vez.");
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function localDateParts(date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map(({ type, value }) => [type, Number(value)]));
}

function utcForLocalMidnight(year, month, day) {
  const guess = Date.UTC(year, month - 1, day);
  const rendered = localDateParts(new Date(guess));
  const renderedAsUtc = Date.UTC(rendered.year, rendered.month - 1, rendered.day, rendered.hour, rendered.minute, rendered.second);
  return guess - (renderedAsUtc - guess);
}

export function getDateRanges(now = new Date()) {
  const { year, month, day } = localDateParts(now);
  const today = Date.UTC(year, month - 1, day);
  const weekday = new Date(today).getUTCDay();
  const daysFromMonday = (weekday + 6) % 7;
  const monday = new Date(today - daysFromMonday * DAY_MS);
  const currentEnd = utcForLocalMidnight(monday.getUTCFullYear(), monday.getUTCMonth() + 1, monday.getUTCDate());
  const currentStartDate = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() - 7));
  const previousStartDate = new Date(Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate() - 14));
  const currentStart = utcForLocalMidnight(currentStartDate.getUTCFullYear(), currentStartDate.getUTCMonth() + 1, currentStartDate.getUTCDate());
  const previousStart = utcForLocalMidnight(previousStartDate.getUTCFullYear(), previousStartDate.getUTCMonth() + 1, previousStartDate.getUTCDate());
  const previousEnd = currentStart;
  return {
    current: { start: currentStart, end: currentEnd, startDate: currentStartDate.toISOString().slice(0, 10), endDate: new Date(currentEnd - DAY_MS).toISOString().slice(0, 10) },
    previous: { start: previousStart, end: previousEnd, startDate: previousStartDate.toISOString().slice(0, 10), endDate: new Date(previousEnd - DAY_MS).toISOString().slice(0, 10) }
  };
}

const num = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
const rows = (value) => Array.isArray(value) ? value : [];
const aggregate = (value, labelKey = "x", countKey = "y", allowedNames = []) => rows(value)
  .filter((row) => row && typeof row[labelKey] === "string")
  .map((row) => {
    const name = allowedNames.includes(row[labelKey]) ? row[labelKey] : row[labelKey].split(/[?#]/, 1)[0].trim();
    return { name, count: num(row[countKey]), allowed: allowedNames.includes(name) };
  })
  .filter((row) => row.name && row.name.length <= 120 && (row.allowed || !PRIVATE_KEY.test(row.name)) && !PRIVATE_VALUE.test(row.name))
  .map(({ name, count }) => ({ name, count }))
  .filter((row) => row.count > 0)
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

export function buildPeriod(stats = {}, metrics = {}, properties = {}) {
  const eventRows = aggregate(metrics.events, "x", "y", EVENT_NAMES);
  const eventCounts = Object.fromEntries(EVENT_NAMES.map((name) => [name, eventRows.find((row) => row.name === name)?.count ?? 0]));
  const ratios = {
    waOpenPerVisitor: safeDivide(eventCounts.wa_open, num(stats.visitors)),
    caseValidPerOpen: safeDivide(eventCounts.wa_case_valid, eventCounts.wa_open),
    outboundPerCaseValid: safeDivide(eventCounts.wa_outbound, eventCounts.wa_case_valid),
    outboundPerVisitor: safeDivide(eventCounts.wa_outbound, num(stats.visitors))
  };
  return {
    visitors: num(stats.visitors), visits: num(stats.visits), pageviews: num(stats.pageviews), eventCounts, ratios,
    referrers: aggregate(metrics.referrers), pages: aggregate(metrics.pages), landingPages: aggregate(metrics.landingPages), devices: aggregate(metrics.devices),
    utmSources: aggregate(metrics.utmSources, "utm", "views"), campaigns: aggregate(metrics.campaigns, "utm", "views"),
    contents: aggregate(metrics.contents, "utm", "views"), campaignLeads: aggregate(metrics.campaignLeads, "utm", "views"),
    services: aggregate(properties.services, "value", "total"), categories: aggregate(properties.categories, "value", "total"),
    intents: aggregate(properties.intents, "value", "total"), ctas: aggregate(properties.ctas, "value", "total"),
    outboundServices: aggregate(properties.outboundServices, "value", "total"),
    noData: num(stats.visitors) === 0 && num(stats.pageviews) === 0 && eventRows.length === 0
  };
}

const formatPercent = (ratio) => ratio === null ? "Sin datos" : `${(ratio * 100).toFixed(1)}%`;
const formatDelta = (value) => value === null ? "Sin base comparable" : value === 0 ? "= sin cambio" : value > 0 ? `↑ +${value.toFixed(1)}%` : `↓ -${Math.abs(value).toFixed(1)}%`;
const formatPoints = (value) => !Number.isFinite(value) ? "Sin base comparable" : `${value > 0 ? "+" : ""}${value.toFixed(1)} puntos porcentuales`;
const safeText = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const topList = (items, limit = 5) => items.slice(0, limit);

export function buildObservations(current, previous) {
  const result = [];
  if (current.eventCounts.wa_open > previous.eventCounts.wa_open && current.eventCounts.wa_outbound < previous.eventCounts.wa_outbound) result.push("Aumentaron las aperturas del diálogo y bajaron las salidas a WhatsApp: el abandono dentro del flujo fue mayor.");
  const visitorGrowth = percentChange(current.visitors, previous.visitors);
  if (visitorGrowth !== null && visitorGrowth > 20 && current.ratios.outboundPerVisitor !== null && previous.ratios.outboundPerVisitor !== null && current.ratios.outboundPerVisitor < previous.ratios.outboundPerVisitor) result.push("Los visitantes aumentaron más de 20% y las salidas a WhatsApp por visitante bajaron.");
  const campaignLeadTotal = current.campaignLeads.reduce((total, item) => total + item.count, 0);
  const leadingCampaign = current.campaignLeads[0];
  if (leadingCampaign && campaignLeadTotal > 0 && leadingCampaign.count / campaignLeadTotal > 0.3) result.push(`La campaña ${leadingCampaign.name} concentra más de 30% de las salidas a WhatsApp con campaña atribuida.`);
  if (current.eventCounts.wa_outbound < 5) result.push("Muestra todavía pequeña; interpretar tendencias con cautela.");
  if (!current.eventCounts.wa_outbound && !current.visitors && !current.pageviews) result.push("Sin datos suficientes para este período.");
  return [...new Set(result)];
}

export function buildTextReport(current, previous, ranges) {
  const observations = buildObservations(current, previous);
  const lines = [
    "Cristal Sagrado — Reporte semanal",
    `Período: ${ranges.current.startDate} al ${ranges.current.endDate} (${TIMEZONE})`,
    "",
    "RESUMEN",
    `Visitantes: ${current.visitors} (${formatDelta(percentChange(current.visitors, previous.visitors))})`,
    `Visitas/sesiones: ${current.visits}`,
    `Pageviews: ${current.pageviews} (${formatDelta(percentChange(current.pageviews, previous.pageviews))})`,
    `Leads web WhatsApp (wa_outbound): ${current.eventCounts.wa_outbound}`,
    `Salidas a WhatsApp / visitantes: ${formatPercent(current.ratios.outboundPerVisitor)}`,
    "",
    "EMBUDO (eventos agregados, no personas únicas)",
    `Visitantes: ${current.visitors}`,
    `→ Abrieron consulta: ${current.eventCounts.wa_open} (${formatPercent(current.ratios.waOpenPerVisitor)} de visitantes)`,
    `→ Caso válido: ${current.eventCounts.wa_case_valid} (${formatPercent(current.ratios.caseValidPerOpen)} de aperturas)`,
    `→ Salieron a WhatsApp: ${current.eventCounts.wa_outbound} (${formatPercent(current.ratios.outboundPerCaseValid)} de casos válidos)`,
    "",
    "SEMANA ACTUAL VS ANTERIOR",
    ...[["visitantes", current.visitors, previous.visitors], ["visitas/sesiones", current.visits, previous.visits], ["pageviews", current.pageviews, previous.pageviews], ...["wa_open", "wa_case_valid", "wa_outbound", "form_submit"].map((event) => [event, current.eventCounts[event], previous.eventCounts[event]])].map(([label, value, prior]) => `${label}: ${value} vs ${prior} (${formatDelta(percentChange(value, prior))})`),
    ...[["wa_open / visitantes", "waOpenPerVisitor"], ["wa_case_valid / wa_open", "caseValidPerOpen"], ["wa_outbound / wa_case_valid", "outboundPerCaseValid"]].map(([label, key]) => `${label}: ${formatPercent(current.ratios[key])} vs ${formatPercent(previous.ratios[key])} (${formatPoints(percentagePoints(current.ratios[key], previous.ratios[key]))})`),
    `Salidas a WhatsApp / visitantes: ${formatPercent(current.ratios.outboundPerVisitor)} vs ${formatPercent(previous.ratios.outboundPerVisitor)} (${formatPoints(percentagePoints(current.ratios.outboundPerVisitor, previous.ratios.outboundPerVisitor) ?? NaN)})`,
    "",
    "ORIGEN Y CONTENIDO",
    `Fuentes UTM: ${topList(current.utmSources).map((item) => `${item.name} (${item.count})`).join(", ") || "Sin datos"}`,
    `Referers: ${topList(current.referrers).map((item) => `${item.name} (${item.count})`).join(", ") || "Sin datos"}`,
    `Campañas (pageviews): ${topList(current.campaigns).map((item) => `${item.name} (${item.count})`).join(", ") || "Sin datos"}`,
    `Contenido (pageviews): ${topList(current.contents).map((item) => `${item.name} (${item.count})`).join(", ") || "Sin datos"}`,
    `Campañas en eventos wa_outbound: ${topList(current.campaignLeads).map((item) => `${item.name} (${item.count})`).join(", ") || "Sin datos"}`,
    `Páginas: ${topList(current.pages).map((item) => `${item.name} (${item.count})`).join(", ") || "Sin datos"}`,
    `Landing pages: ${topList(current.landingPages).map((item) => `${item.name} (${item.count})`).join(", ") || "Sin datos"}`,
    `Dispositivos: ${topList(current.devices).map((item) => `${item.name} (${item.count})`).join(", ") || "Sin datos"}`,
    "",
    "SERVICIOS, INTENCIONES Y CTA",
    `Servicios elegidos en service_wa: ${topList(current.services).map((item) => `${item.name} (${item.count})`).join(", ") || "Sin datos"}`,
    `Categorías en service_wa: ${topList(current.categories).map((item) => `${item.name} (${item.count})`).join(", ") || "Sin datos"}`,
    `Intenciones: ${topList(current.intents).map((item) => `${item.name} (${item.count})`).join(", ") || "Sin datos"}`,
    `CTA de wa_outbound: ${topList(current.ctas).map((item) => `${item.name} (${item.count})`).join(", ") || "Sin datos"}`,
    `Servicios atribuibles a wa_outbound: ${topList(current.outboundServices).map((item) => `${item.name} (${item.count})`).join(", ") || "Sin datos"}`,
    "",
    "OBSERVACIONES",
    ...(observations.length ? observations.map((item) => `• ${item}`) : ["Sin observaciones deterministas para este período."]),
    "",
    "Las métricas del embudo cuentan eventos agregados; no representan conversiones únicas por visitante ni confirman una operación comercial."
  ];
  return lines.join("\n");
}

export function buildHtmlReport(current, previous, ranges) {
  const text = buildTextReport(current, previous, ranges);
  const metric = (label, value) => `<td style="padding:14px;background:#292426;border:1px solid #49343a;border-radius:10px;color:#f6f0e8;width:50%;"><div style="font-size:12px;color:#d2ad68;">${safeText(label)}</div><div style="font-size:24px;font-weight:bold;margin-top:6px;">${safeText(value)}</div></td>`;
  const body = text.split("\n").map((line) => line ? `<p style="margin:0 0 8px;line-height:1.5;">${safeText(line)}</p>` : '<div style="height:10px;"></div>').join("");
  return `<!doctype html><html lang="es"><body style="margin:0;background:#171517;color:#f6f0e8;font-family:Arial,Helvetica,sans-serif;"><div style="max-width:620px;margin:0 auto;padding:18px 12px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;background:#211d1f;border:1px solid #49343a;border-radius:14px;overflow:hidden;"><tr><td style="padding:24px 20px;background:#4b1727;color:#f6f0e8;"><div style="font-size:13px;letter-spacing:2px;color:#e0bd68;">CRISTAL SAGRADO</div><h1 style="font-size:25px;margin:8px 0 4px;">Reporte semanal</h1><div style="font-size:13px;">${safeText(ranges.current.startDate)} al ${safeText(ranges.current.endDate)} · ${TIMEZONE}</div></td></tr><tr><td style="padding:18px 14px;"><table role="presentation" width="100%" cellspacing="6" cellpadding="0"><tr>${metric("Visitantes", String(current.visitors))}${metric("Pageviews", String(current.pageviews))}</tr><tr>${metric("Leads web WhatsApp", String(current.eventCounts.wa_outbound))}${metric("Salidas / visitantes", formatPercent(current.ratios.outboundPerVisitor))}</tr></table><div style="padding:4px 6px 10px;color:#f6f0e8;">${body}</div></td></tr><tr><td style="padding:14px 20px;background:#171517;color:#c9beb8;font-size:11px;line-height:1.5;">Informe generado con estadísticas agregadas de Umami. Los leads web WhatsApp son salidas al canal y no confirman una operación comercial.</td></tr></table></div></body></html>`;
}

function apiUrl(base, route, params) {
  const url = new URL(`${normalizeApiBase(base)}/${route.replace(/^\/+/, "")}`);
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  return url;
}

async function apiGet(base, route, params, key, fetchImpl) {
  const response = await fetchImpl(apiUrl(base, route, params), { headers: { Accept: "application/json", Authorization: `Bearer ${key}` } });
  if (!response.ok) {
    if (response.status === 401) throw new Error("Umami rechazó la API key (HTTP 401): fallo de autenticación.");
    if (response.status === 403) throw new Error("Umami denegó el acceso (HTTP 403): faltan permisos de lectura.");
    if (response.status === 404) throw new Error("Umami respondió HTTP 404: verificá el endpoint y el Website ID.");
    throw new Error(`Umami API respondió HTTP ${response.status}.`);
  }
  try { return await response.json(); } catch { throw new Error("Umami API devolvió una respuesta JSON inválida."); }
}

async function fetchPeriod(base, websiteId, key, range, fetchImpl, knownStats) {
  const common = { startAt: range.start, endAt: range.end, timezone: TIMEZONE };
  const website = `websites/${encodeURIComponent(websiteId)}`;
  const getMetrics = (type, extra = {}) => apiGet(base, `${website}/metrics`, { ...common, type, limit: 100, ...extra }, key, fetchImpl);
  const getValues = (event, propertyName) => apiGet(base, `${website}/event-data/values`, { ...common, event, propertyName }, key, fetchImpl);
  const [stats, events, referrers, pages, landingPages, devices, utmSources, campaigns, contents, campaignLeads, services, categories, intents, ctas, outboundServices] = await Promise.all([
    knownStats ?? apiGet(base, `${website}/stats`, common, key, fetchImpl), getMetrics("event"), getMetrics("referrer"), getMetrics("path"), getMetrics("entry"), getMetrics("device"),
    apiGet(base, `${website}/utm/metrics`, { ...common, type: "utm_source" }, key, fetchImpl),
    apiGet(base, `${website}/utm/metrics`, { ...common, type: "utm_campaign" }, key, fetchImpl),
    apiGet(base, `${website}/utm/metrics`, { ...common, type: "utm_content" }, key, fetchImpl),
    apiGet(base, `${website}/utm/metrics`, { ...common, type: "utm_campaign", event: "wa_outbound", eventType: 2 }, key, fetchImpl),
    getValues("service_wa", "service"), getValues("service_wa", "category"), getValues("intent_click", "intent"),
    getValues("wa_outbound", "cta_location"), getValues("wa_outbound", "service")
  ]);
  return buildPeriod(stats ?? {}, { events, referrers, pages, landingPages, devices, utmSources, campaigns, contents, campaignLeads }, { services, categories, intents, ctas, outboundServices });
}

export async function buildReportData({ base, websiteId, apiKey, now = new Date(), fetchImpl = fetch }) {
  if (!base || !websiteId || !apiKey) throw new Error("Faltan variables requeridas para consultar Umami.");
  const apiBase = normalizeApiBase(base);
  const ranges = getDateRanges(now);
  const currentStats = await apiGet(apiBase, `websites/${encodeURIComponent(websiteId)}/stats`, {
    startAt: ranges.current.start, endAt: ranges.current.end, timezone: TIMEZONE
  }, apiKey, fetchImpl);
  const [current, previous] = await Promise.all([
    fetchPeriod(apiBase, websiteId, apiKey, ranges.current, fetchImpl, currentStats),
    fetchPeriod(apiBase, websiteId, apiKey, ranges.previous, fetchImpl)
  ]);
  return { current, previous, ranges, subject: `Cristal Sagrado — Reporte semanal — ${ranges.current.startDate} al ${ranges.current.endDate}`, text: buildTextReport(current, previous, ranges), html: buildHtmlReport(current, previous, ranges) };
}

export async function sendReport(report, { apiKey, recipient, from, fetchImpl = fetch }) {
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [recipient], subject: report.subject, text: report.text, html: report.html })
  });
  if (!response.ok) {
    throw new Error(`Resend respondió HTTP ${response.status}: no aceptó el envío; verificá la configuración de remitente y permisos.`);
  }
}

async function main() {
  const report = await buildReportData({ base: process.env.UMAMI_API_BASE, websiteId: process.env.PUBLIC_UMAMI_WEBSITE_ID, apiKey: process.env.UMAMI_API_KEY });
  const dryRun = process.env.DRY_RUN === "true";
  if (dryRun) {
    console.log(`Dry run: ${report.subject}`);
    console.log(`Visitantes: ${report.current.visitors}; pageviews: ${report.current.pageviews}; leads web WhatsApp: ${report.current.eventCounts.wa_outbound}; salidas/visitantes: ${formatPercent(report.current.ratios.outboundPerVisitor)}`);
    console.log("No se envió ningún correo.");
    return;
  }
  for (const variable of ["RESEND_API_KEY", "REPORT_RECIPIENT_EMAIL", "REPORT_FROM_EMAIL"]) if (!process.env[variable]) throw new Error(`Falta la configuración ${variable}.`);
  await sendReport(report, { apiKey: process.env.RESEND_API_KEY, recipient: process.env.REPORT_RECIPIENT_EMAIL, from: process.env.REPORT_FROM_EMAIL });
  console.log("Reporte semanal enviado por Resend.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => { console.error(error instanceof Error ? error.message : "Error inesperado al generar el reporte."); process.exitCode = 1; });
}
