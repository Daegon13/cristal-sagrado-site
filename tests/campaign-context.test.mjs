import test from "node:test";
import assert from "node:assert/strict";
import { campaignUrl, safeCampaign } from "../assets/js/campaign-context.js";

test("conserva solo etiquetas de Instagram acotadas en rutas internas", () => {
  const campaign = safeCampaign("?utm_source=instagram&utm_medium=story&utm_campaign=tarot_noviembre&utm_content=pregunta&email=private");
  assert.deepEqual(campaign, { utm_source: "instagram", utm_medium: "story", utm_campaign: "tarot_noviembre", utm_content: "pregunta" });
  assert.equal(campaignUrl("/tarot/#consulta", campaign, "https://cristal-sagrado.com"), "/tarot/?utm_source=instagram&utm_medium=story&utm_campaign=tarot_noviembre&utm_content=pregunta#consulta");
  assert.equal(campaignUrl("https://wa.me/59896106373", campaign, "https://cristal-sagrado.com"), "https://wa.me/59896106373");
  assert.equal(campaignUrl("#servicios", campaign, "https://cristal-sagrado.com"), "#servicios");
  assert.equal(campaignUrl("/admin/", campaign, "https://cristal-sagrado.com"), "/admin/");
  assert.equal(campaignUrl("/muestras/habitar-lo-posible-muestra.pdf", campaign, "https://cristal-sagrado.com"), "/muestras/habitar-lo-posible-muestra.pdf");
  assert.equal(safeCampaign("?utm_source=instagram&utm_medium=story&utm_campaign=1234567890"), null);
});
