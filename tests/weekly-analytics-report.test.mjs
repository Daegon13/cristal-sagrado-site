import assert from "node:assert/strict";
import test from "node:test";
import { buildHtmlReport, buildObservations, buildPeriod, buildReportData, buildTextReport, getDateRanges, normalizeApiBase, percentChange, percentagePoints, safeDivide } from "../scripts/weekly-analytics-report.mjs";

test("safe division avoids zero and invalid values", () => {
  assert.equal(safeDivide(2, 0), null);
  assert.equal(safeDivide(2, 4), 0.5);
  assert.equal(safeDivide(Number.NaN, 2), null);
});

test("relative change and percentage point change stay distinct", () => {
  assert.equal(percentChange(18, 15), 20);
  assert.equal(percentChange(2, 0), null);
  assert.equal(percentagePoints(0.18, 0.15), 3);
});

test("Monday 09:00 Uruguay starts the report at the preceding Monday 00:00 Uruguay", () => {
  const ranges = getDateRanges(new Date("2026-10-05T12:00:00.000Z"));
  assert.deepEqual(ranges.current, { start: Date.parse("2026-09-28T03:00:00.000Z"), end: Date.parse("2026-10-05T03:00:00.000Z"), startDate: "2026-09-28", endDate: "2026-10-04" });
  assert.deepEqual(ranges.previous, { start: Date.parse("2026-09-21T03:00:00.000Z"), end: Date.parse("2026-09-28T03:00:00.000Z"), startDate: "2026-09-21", endDate: "2026-09-27" });
});

test("API base normalization removes trailing slashes without duplicating /api", () => {
  assert.equal(normalizeApiBase("https://umami.example/api///"), "https://umami.example/api");
  assert.throws(() => normalizeApiBase("https://umami.example"), /incluir \/api/);
  assert.throws(() => normalizeApiBase("https://umami.example/api/api"), /exactamente una vez/);
});

test("initial API validation stops on authentication failure before fan-out", async () => {
  let calls = 0;
  await assert.rejects(buildReportData({
    base: "https://umami.example/api", websiteId: "fake-id", apiKey: "fake-key", now: new Date("2026-10-05T12:00:00.000Z"),
    fetchImpl: async (_url, options) => {
      calls += 1;
      assert.equal(options.headers.Authorization, "Bearer fake-key");
      return { ok: false, status: 401 };
    }
  }), /HTTP 401/);
  assert.equal(calls, 1);
});

test("a valid mocked API uses self-hosted endpoints, Uruguay timezone, and current event filters", async () => {
  const seen = [];
  const report = await buildReportData({
    base: "https://umami.example/api/", websiteId: "fake-id", apiKey: "fake-key", now: new Date("2026-10-05T12:00:00.000Z"),
    fetchImpl: async (input, options) => {
      const url = new URL(input);
      seen.push(url);
      assert.equal(options.headers.Authorization, "Bearer fake-key");
      assert.equal(url.pathname.includes("/api/api/"), false);
      assert.equal(url.searchParams.get("timezone"), "America/Montevideo");
      if (url.pathname.endsWith("/stats")) return { ok: true, json: async () => ({ visitors: 7, visits: 9, pageviews: 12 }) };
      if (url.pathname.endsWith("/metrics")) return { ok: true, json: async () => url.searchParams.get("type") === "event" ? [{ x: "wa_outbound", y: 2 }] : [] };
      if (url.pathname.endsWith("/utm/metrics")) return { ok: true, json: async () => [] };
      if (url.pathname.endsWith("/event-data/values")) {
        assert.equal(url.searchParams.has("eventName"), false);
        assert.ok(url.searchParams.get("event"));
        return { ok: true, json: async () => [] };
      }
      throw new Error("Unexpected endpoint");
    }
  });
  assert.equal(report.current.visitors, 7);
  assert.equal(report.current.eventCounts.wa_outbound, 2);
  assert.ok(seen.some((url) => url.searchParams.get("type") === "entry"));
  assert.equal(seen.filter((url) => url.pathname.endsWith("/stats")).length, 2);
});

test("zero and declining changes use requested comparison labels", () => {
  const current = buildPeriod({ visitors: 10 }, { events: [] });
  const previous = buildPeriod({ visitors: 10 }, { events: [] });
  const report = buildTextReport(current, previous, { current: { startDate: "2026-09-28", endDate: "2026-10-04" } });
  assert.match(report, /visitantes: 10 vs 10 \(= sin cambio\)/);
  const declined = buildTextReport(buildPeriod({ visitors: 9 }, {}), previous, { current: { startDate: "2026-09-28", endDate: "2026-10-04" } });
  assert.match(declined, /visitantes: 9 vs 10 \(↓ -10\.0%\)/);
  assert.doesNotMatch(report, /NaN|Infinity|null %|undefined/);
});

test("zero events and visitors produce safe funnel ratios", () => {
  const empty = buildPeriod({ visitors: 0, visits: 0, pageviews: 0 }, { events: [] });
  assert.equal(empty.ratios.outboundPerVisitor, null);
  assert.equal(empty.ratios.caseValidPerOpen, null);
  assert.equal(empty.eventCounts.wa_outbound, 0);
  assert.equal(empty.noData, true);
});

test("funnel counts known events and labels remain aggregate", () => {
  const current = buildPeriod({ visitors: 10 }, { events: [{ x: "wa_open", y: 4 }, { x: "wa_case_valid", y: 2 }, { x: "wa_outbound", y: 1 }] });
  assert.equal(current.ratios.waOpenPerVisitor, 0.4);
  assert.equal(current.ratios.caseValidPerOpen, 0.5);
  assert.equal(current.ratios.outboundPerCaseValid, 0.5);
  const text = buildTextReport(current, current, { current: { startDate: "2026-09-28", endDate: "2026-10-04" } });
  assert.match(text, /eventos agregados, no personas únicas/);
  assert.match(text, /Leads web WhatsApp/);
  assert.doesNotMatch(text, /venta|cliente|compra|NaN|Infinity|undefined %/i);
});

test("small sample notice and deterministic observations", () => {
  const low = buildPeriod({ visitors: 100 }, { events: [{ x: "wa_outbound", y: 2 }] });
  const prev = buildPeriod({ visitors: 80 }, { events: [{ x: "wa_open", y: 2 }, { x: "wa_outbound", y: 4 }] });
  assert.ok(buildObservations(low, prev).includes("Muestra todavía pequeña; interpretar tendencias con cautela."));
  const first = buildObservations(low, prev);
  assert.deepEqual(buildObservations(low, prev), first);
});

test("deterministic observations cover funnel drop-off, efficiency, and campaign concentration", () => {
  const previous = buildPeriod({ visitors: 100 }, { events: [{ x: "wa_open", y: 10 }, { x: "wa_case_valid", y: 8 }, { x: "wa_outbound", y: 6 }] });
  const current = buildPeriod({ visitors: 130 }, { events: [{ x: "wa_open", y: 15 }, { x: "wa_case_valid", y: 4 }, { x: "wa_outbound", y: 3 }], campaignLeads: [{ utm: "bio", views: 2 }, { utm: "story", views: 1 }] });
  const notes = buildObservations(current, previous);
  assert.ok(notes.some((note) => note.includes("abandono dentro del flujo")));
  assert.ok(notes.some((note) => note.includes("aumentaron más de 20%")));
  assert.ok(notes.some((note) => note.includes("bio concentra más de 30%")));
});

test("properties missing or containing privacy-like labels do not leak", () => {
  const data = buildPeriod({ visitors: 1 }, { events: [{ x: "wa_open", y: 1 }, { x: "user-agent: private", y: 99 }], campaigns: [{ utm: "mail@example.com", views: 4 }, { utm: "987-555-123-4567", views: 2 }, { utm: "bio?email=private", views: 1 }] }, { ctas: [{ value: "hero", total: 1 }, { value: "case: sensitive", total: 3 }] });
  assert.equal(data.eventCounts.wa_open, 1);
  assert.deepEqual(data.ctas, [{ name: "hero", count: 1 }]);
  assert.deepEqual(data.campaigns, [{ name: "bio", count: 1 }]);
  assert.deepEqual(data.services, []);
});

test("HTML is self-contained, escaped, and has a mobile-width layout", () => {
  const current = buildPeriod({ visitors: 1 }, { events: [] }, { ctas: [{ value: "<img src=x>", total: 1 }] });
  const html = buildHtmlReport(current, current, { current: { startDate: "2026-09-28", endDate: "2026-10-04" } });
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /max-width:620px/);
  assert.match(html, /&lt;img src=x&gt;/);
  assert.doesNotMatch(html, /<script|https?:\/\/fonts\./i);
});

test("plain text output contains required periods and safe zero labels", () => {
  const empty = buildPeriod({}, {});
  const text = buildTextReport(empty, empty, { current: { startDate: "2026-09-28", endDate: "2026-10-04" } });
  assert.match(text, /Sin datos suficientes para este período/);
  assert.match(text, /2026-09-28 al 2026-10-04/);
  assert.doesNotMatch(text, /NaN|Infinity|undefined %/);
});
