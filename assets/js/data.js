// Archivo: /assets/js/data.js
// RESPONSABILIDAD: Cargar y renderizar servicios por categoría (roja/blanca/negra/verde)
// + buscador en vivo + ver más/menos, todo desde Firestore.
// Usa firebaseConfig desde /admin/config.js.
// Nota: sin orderBy en Firestore para evitar índices; se ordena en cliente por `order`.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { firebaseConfig } from "/admin/config.js";
import { WHATSAPP_NUMBER, normalizeService, buildServiceWhatsappUrl, compareServicesForPublic } from "./service-helpers.js";

// -------------------------
// BLOQUE: Inicialización Firebase
// -------------------------
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// -------------------------
// BLOQUE: Estado en memoria (cache por categoría)
// -------------------------
const cache = {
  roja:   { items: [], lastFetch: 0 },
  blanca: { items: [], lastFetch: 0 },
  negra:  { items: [], lastFetch: 0 },
  verde:  { items: [], lastFetch: 0 }
};

// -------------------------
// BLOQUE: Utilidades
// -------------------------
function detectCategory(explicitCategory) {
  if (explicitCategory) return explicitCategory.toLowerCase();
  const fromAttr = document.body?.dataset?.pagecat;
  if (fromAttr) return fromAttr.toLowerCase();
  const p = location.pathname.toLowerCase();
  if (p.includes("magia-blanca")) return "blanca";
  if (p.includes("magia-roja"))   return "roja";
  if (p.includes("magia-negra"))  return "negra";
  if (p.includes("magia-verde"))  return "verde";
  return "roja";
}

function normalizeItems(snap) {
  const arr = [];
  snap.forEach(d => arr.push(normalizeService(d.data(), d.id)));
  arr.sort(compareServicesForPublic);
  return arr;
}

// BLOQUE SEGURIDAD: helper para crear nodos de texto y evitar inyección HTML desde datos remotos.
function createTextElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = text;
  return el;
}


function buildGeneralWhatsappUrl() {
  const message = "Hola Luz, llego desde la web de Cristal Sagrado. Quiero consultar por esta categoría de servicios. Mi situación es:";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function createWhatsappCta(text, href, ariaLabel) {
  const cta = createTextElement("a", "serv-cta", text);
  cta.href = href;
  cta.target = "_blank";
  cta.rel = "noopener noreferrer";
  cta.setAttribute("aria-label", ariaLabel);
  return cta;
}

function createServiceSection(title, items, className) {
  if (!items.length) return null;

  const section = document.createElement("div");
  section.className = `serv-detail ${className}`;
  section.appendChild(createTextElement("h4", "serv-detail-title", title));

  const list = document.createElement("ul");
  list.className = "serv-detail-list";
  items.forEach((item) => {
    list.appendChild(createTextElement("li", "serv-detail-item", item));
  });
  section.appendChild(list);

  return section;
}

function appendIntentChips(card, intents) {
  if (!intents.length) return;

  const chips = document.createElement("ul");
  chips.className = "serv-intents";
  chips.setAttribute("aria-label", "Intenciones del servicio");
  intents.forEach((intent) => {
    chips.appendChild(createTextElement("li", "serv-intent-chip", intent));
  });
  card.appendChild(chips);
}

function createServiceCard(service) {
  const li = document.createElement("li");
  li.className = "serv-card";
  li.dataset.id = service.id;
  if (service.slug) li.dataset.slug = service.slug;

  const header = document.createElement("div");
  header.className = "serv-card-header";
  header.appendChild(createTextElement("h3", "serv-title", service.name));
  if (service.featured === true) {
    header.appendChild(createTextElement("span", "serv-featured-badge", "Destacado"));
  }
  li.appendChild(header);

  if (service.descriptionShort) {
    li.appendChild(createTextElement("p", "serv-desc clamp-3", service.descriptionShort));
  }

  appendIntentChips(li, service.intent);

  const idealFor = createServiceSection("Ideal para", service.idealFor, "serv-ideal-for");
  if (idealFor) li.appendChild(idealFor);

  const benefits = createServiceSection("Beneficios", service.benefits, "serv-benefits");
  if (benefits) li.appendChild(benefits);

  const meta = document.createElement("div");
  meta.className = "serv-meta";
  if (service.price !== null) {
    meta.appendChild(createTextElement("span", "serv-price", `$${service.price}`));
  }
  if (service.duration !== null) {
    meta.appendChild(createTextElement("span", "serv-duration", `${service.duration} días`));
  }
  if (meta.childElementCount) li.appendChild(meta);

  if (service.descriptionShort) {
    const btn = createTextElement("button", "serv-toggle", "Ver más");
    btn.type = "button";
    li.appendChild(btn);
  }

  li.appendChild(createWhatsappCta(
    "Consultar por este servicio",
    buildServiceWhatsappUrl(service),
    `Consultar por WhatsApp sobre ${service.name}`
  ));

  return li;
}

function renderMessageWithWhatsapp(container, className, message) {
  container.innerHTML = "";
  const li = document.createElement("li");
  li.className = className;
  li.appendChild(createTextElement("p", "serv-state-message", message));
  li.appendChild(createWhatsappCta(
    "Consultar por WhatsApp",
    buildGeneralWhatsappUrl(),
    "Consultar por WhatsApp sobre esta categoría de servicios"
  ));
  container.appendChild(li);
}

// Trunca/expande descripción
function wireViewMore(ul) {
  ul.querySelectorAll(".serv-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = btn.closest("li")?.querySelector(".serv-desc");
      if (!p) return;
      p.classList.toggle("clamp-3");
      btn.textContent = p.classList.contains("clamp-3") ? "Ver más" : "Ver menos";
    });
  });
}

// -------------------------
// BLOQUE: Búsqueda en vivo (client-side)
// -------------------------
// - inputSelector: selector del <input> de búsqueda (opcional)
// - listSelector:  el UL/OL donde se renderizaron los servicios
export function attachSearch(inputSelector = "#buscador-servicios", listSelector = "#lista-servicios") {
  const input = document.querySelector(inputSelector);
  const list  = document.querySelector(listSelector);
  if (!input || !list) return;

  input.addEventListener("input", () => {
    const term = input.value.trim().toLowerCase();
    list.querySelectorAll("li.serv-card").forEach(li => {
      const title = (li.querySelector(".serv-title")?.textContent || "").toLowerCase();
      const desc  = (li.querySelector(".serv-desc")?.textContent || "").toLowerCase();
      const match = !term || title.includes(term) || desc.includes(term);
      li.style.display = match ? "" : "none";
    });
  });
}

// -------------------------
// BLOQUE: Render de servicios por categoría
// -------------------------
export async function renderServices(containerSelector = "#lista-servicios", category, options = {}) {
  const ul = document.querySelector(containerSelector);
  if (!ul) return;

  const cat = detectCategory(category);
  ul.innerHTML = "";
  ul.appendChild(createTextElement("li", "muted", "Cargando…"));

  try {
    const now = Date.now();
    const freshMs = 5 * 60 * 1000;
    let items = [];

    if (cache[cat] && (now - cache[cat].lastFetch) < freshMs && cache[cat].items.length) {
      items = cache[cat].items;
    } else {
      const q = query(
        collection(db, "services"),
        where("category", "==", cat),
        where("active", "==", true)
      );
      const snap = await getDocs(q);
      items = normalizeItems(snap);
      cache[cat] = { items, lastFetch: now };
    }

    if (!items.length) {
      renderMessageWithWhatsapp(
        ul,
        "serv-state serv-state-empty",
        "En este momento no hay servicios cargados en esta categoría, pero podés escribirme y contarme tu situación para orientarte personalmente."
      );
      return;
    }

    // BLOQUE SEGURIDAD: render por nodos DOM con textContent para evitar XSS (sin innerHTML con datos remotos).
    ul.innerHTML = "";
    items.forEach((s) => {
      ul.appendChild(createServiceCard(s));
    });

    wireViewMore(ul);

    if (options.searchSelector) {
      attachSearch(options.searchSelector, containerSelector);
    }
  } catch (err) {
    console.error("Error cargando servicios:", err);
    renderMessageWithWhatsapp(
      ul,
      "serv-state serv-state-error",
      "No pudimos cargar los servicios en este momento. Podés escribirme directamente por WhatsApp y te respondo con reserva."
    );
  }
}

// Nota FASE 1: no hay auto-inicialización global. Cada página de categoría llama
// explícitamente a renderServices() para evitar doble render y doble lectura Firestore.
