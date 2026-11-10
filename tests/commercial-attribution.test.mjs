import test from "node:test";
import assert from "node:assert/strict";
import { summarizeTsv } from "../scripts/summarize-commercial.mjs";
import { buildCampaignLink } from "../scripts/campaign-link.mjs";

const header = "fecha\tservicio\torigen\tcampana\tconsulta_recibida\tventa_confirmada\timporte_cobrado";
test("el registro manual separa consultas recibidas, ventas e importe cobrado", () => {
  const totals = summarizeTsv(`${header}\n2026-11-10\tTarot\tinstagram\ttarot_noviembre\tsi\tsi\t1200.00\n2026-11-10\tTarot\tdesconocido\t\tsi\tno\t\n`);
  assert.deepEqual(totals.get("servicio: Tarot"), { consultas: 2, ventas: 1, cobrado: 1200 });
  assert.deepEqual(totals.get("origen: desconocido"), { consultas: 1, ventas: 0, cobrado: 0 });
  assert.throws(() => summarizeTsv(`${header}\n2026-11-10\tTarot\tinstagram\t\tno\tsi\t1200`), /datos inválidos/);
});

test("la campaña de tarot reutiliza el generador existente", () => {
  assert.equal(buildCampaignLink({ path: "/tarot/", source: "instagram", medium: "story", campaign: "tarot_noviembre", content: "pregunta" }), "https://cristal-sagrado.com/tarot/?utm_source=instagram&utm_medium=story&utm_campaign=tarot_noviembre&utm_content=pregunta");
});
