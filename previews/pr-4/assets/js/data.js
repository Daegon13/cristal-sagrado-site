// Archivo: /assets/js/data.js
// RESPONSABILIDAD: Cargar y renderizar servicios por categoría (roja/blanca/negra/verde)
// + buscador en vivo + ver más/menos, todo desde Firestore.
// Usa firebaseConfig desde /admin/config.js.
// Nota: sin orderBy en Firestore para evitar índices; se ordena en cliente por `order`.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { firebaseConfig } from "/admin/config.js";

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
  snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
  arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return arr;
}

// BLOQUE SEGURIDAD: helper para crear nodos de texto y evitar inyección HTML desde datos remotos.
function createTextElement(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = text;
  return el;
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
      ul.innerHTML = "";
      ul.appendChild(createTextElement("li", "muted", "Pronto habrá servicios disponibles aquí."));
      return;
    }

    // BLOQUE SEGURIDAD: render por nodos DOM con textContent para evitar XSS (sin innerHTML con datos remotos).
    ul.innerHTML = "";
    items.forEach((s) => {
      const li = document.createElement("li");
      li.className = "serv-card";
      li.dataset.id = s.id;

      li.appendChild(createTextElement("h3", "serv-title", s.title ?? s.name ?? ""));

      const desc = createTextElement("p", "serv-desc clamp-3", s.description ?? "");
      li.appendChild(desc);

      const meta = document.createElement("div");
      meta.className = "serv-meta";
      if (s.price) {
        meta.appendChild(createTextElement("span", "serv-price", `$${s.price}`));
      }
      if (s.duration) {
        meta.appendChild(createTextElement("span", "serv-duration", `${s.duration} días`));
      }
      li.appendChild(meta);

      const btn = createTextElement("button", "serv-toggle", "Ver más");
      btn.type = "button";
      li.appendChild(btn);

      ul.appendChild(li);
    });

    wireViewMore(ul);

    if (options.searchSelector) {
      attachSearch(options.searchSelector, containerSelector);
    }
  } catch (err) {
    console.error("Error cargando servicios:", err);
    ul.innerHTML = "";
    ul.appendChild(createTextElement("li", "error", "No se pudieron cargar los servicios. Intenta más tarde."));
  }
}

// Nota FASE 1: no hay auto-inicialización global. Cada página de categoría llama
// explícitamente a renderServices() para evitar doble render y doble lectura Firestore.
