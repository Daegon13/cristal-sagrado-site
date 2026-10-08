import snapshot from "../src/data/generated/services.public.json" with { type: "json" };
import { selectedServices } from "../src/lib/seo-services.js";

const selected = new Set(selectedServices(snapshot).map((item) => item.id));
const cell = (value) => String(value ?? "—").replaceAll("|", "\\|").replaceAll(/\s+/g, " ").trim();
console.log("| name | slug | category | featured | intent | description | price | duration | idealFor | benefits | SEO |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
for (const item of snapshot.services) {
  console.log(`| ${[item.name, item.slug, item.category, item.featured, item.intent.join("; "), item.descriptionShort, item.price, item.duration, item.idealFor.join("; "), item.benefits.join("; "), selected.has(item.id) ? "sí" : "no"].map(cell).join(" | ")} |`);
}
