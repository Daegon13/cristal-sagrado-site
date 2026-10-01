import assert from "node:assert/strict";
import { WHATSAPP_NUMBER, validCase, buildWhatsappMessage, buildWhatsappUrl } from "../assets/js/whatsapp.js";
import { buildServiceWhatsappUrl } from "../assets/js/service-helpers.js";
import { buildServiceWhatsappPreviewUrl } from "../admin/service-form-helpers.js";

const caseText = "Necesito orientación sobre mi situación.";
assert.equal(WHATSAPP_NUMBER, "59896106373");
for (const value of ["", "   ", ".", "hola", ".................", "hola!!!!!!!!!!!!!!"]) {
  assert.equal(validCase(value), false);
  assert.throws(() => buildWhatsappMessage({ caseText: value }));
}
assert.equal(validCase(`  ${caseText}  `), true);
assert.equal(buildWhatsappMessage({ serviceName: "Tarot", caseText }), `Hola Luz, llego desde la web de Cristal Sagrado.\nQuiero consultar por Tarot.\n\nMi situación es:\n${caseText}`);
assert.equal(buildWhatsappMessage({ caseText }), `Hola Luz, llego desde la web de Cristal Sagrado.\n\nMi situación es:\n${caseText}`);
assert.equal(buildWhatsappMessage({ serviceName: "Tarot", ctaText: "Hola especial", caseText }), `Hola especial\n\nMi situación es:\n${caseText}`);
const special = "Tengo dudas sobre amor & trabajo\n¿Qué puedo hacer?";
const url = buildWhatsappUrl(buildWhatsappMessage({ serviceName: "Tarot & amor", caseText: special }));
assert.equal(new URL(url).host, "wa.me");
assert.equal(new URL(url).pathname, `/${WHATSAPP_NUMBER}`);
assert.match(url, /%0A/);
assert.match(url, /%26/);
assert.match(url, /%C2%BF/);
assert.equal(new URL(url).searchParams.get("text"), buildWhatsappMessage({ serviceName: "Tarot & amor", caseText: special }));
assert.equal(new URL(buildServiceWhatsappUrl({ name: "Tarot", ctaText: "Hola especial" }, caseText)).searchParams.get("text"), `Hola especial\n\nMi situación es:\n${caseText}`);
assert.equal(new URL(buildServiceWhatsappPreviewUrl({ name: "Tarot" })).pathname, `/${WHATSAPP_NUMBER}`);
assert.equal(new URL(buildServiceWhatsappPreviewUrl({ name: "Tarot" })).searchParams.get("text"), "Hola Luz, llego desde la web de Cristal Sagrado. Quiero consultar por Tarot. Mi situación es:");
console.log("whatsapp flow ok");
