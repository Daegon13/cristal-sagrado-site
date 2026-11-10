import test from "node:test";
import assert from "node:assert/strict";
import proposals from "../docs/PROPUESTAS_COPY_3_0.json" with { type: "json" };
import snapshot from "../src/data/generated/services.public.json" with { type: "json" };
import approved from "../src/data/approved-copy.public.json" with { type: "json" };
import { applyApprovedServiceCopy } from "../assets/js/approved-copy.js";
import { prepareApprovedCopy } from "../scripts/prepare-approved-copy.mjs";

test("los 52 textos aprobados corresponden exactamente a la auditoría y al snapshot", async () => {
  await prepareApprovedCopy();
  assert.equal(approved.version, 1);
  assert.equal(Object.keys(approved.services).length, 52);
  const source = new Map(snapshot.services.map((item) => [item.id, item]));
  for (const proposal of proposals.services) {
    const original = source.get(proposal.id);
    const current = applyApprovedServiceCopy(original);
    const copy = approved.services[proposal.id].copy;
    assert.ok(original && current && copy, proposal.id);
    assert.deepEqual(Object.keys(copy).sort(), Object.entries(proposal.proposed).filter(([, value]) => typeof value === "string" ? Boolean(value.trim()) : value.length > 0).map(([field]) => field).sort());
    for (const [field, value] of Object.entries(copy)) assert.deepEqual(value, proposal.proposed[field], `${proposal.id}: ${field}`);
    for (const field of ["id", "name", "price", "category", "slug", "order", "active", "featured", "ctaText", "updatedAt"]) assert.deepEqual(current[field], original[field], `${proposal.id}: ${field}`);
    assert.equal(current.descriptionShort, proposal.proposed.descriptionShort);
    assert.equal(current.descriptionLong, proposal.proposed.descriptionLong);
  }
});

test("una identidad cambiada no recibe el copy de otro servicio", () => {
  const service = snapshot.services[0];
  assert.throws(() => applyApprovedServiceCopy({ ...service, slug: "otro-trabajo" }), /identidad/);
  assert.deepEqual(applyApprovedServiceCopy({ id: "id-nuevo", name: "Nuevo" }), { id: "id-nuevo", name: "Nuevo" });
});
