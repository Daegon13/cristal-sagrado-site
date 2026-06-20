// Archivo: /admin/app.js
// RESPONSABILIDAD: Login, tabs y CRUD de Settings/Services en Firestore
// con soporte de CATEGORÍAS (?cat=roja|blanca) y CERO índices compuestos.
// Mantiene IDs del HTML del repo: authOverlay, formLogin, authMsg, btnLogout, userEmail,
// formSettings, settingsSaved, servicesList, btnNewService, serviceModal, formService, closeServiceModal.

// ===============================
// 1) IMPORTS + INIT FIREBASE
// ===============================
// [Bloque] Carga de SDK modular y configuración del proyecto.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, query, where,
  getDocs, addDoc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { firebaseConfig, ALLOWED_EMAILS } from "./config.js";
import {
  buildServiceWhatsappPreviewUrl,
  serviceFormDataToPayload,
  stringArrayToLines,
  slugifyServiceName
} from "./service-form-helpers.js";

// [Bloque] Inicialización única de Firebase.
const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// ===============================
// 2) ESTADO DE CATEGORÍA (declarado antes de cualquier uso)
// ===============================
// [Bloque] Determina la categoría activa desde la URL (?cat=roja|blanca|verde|negra) con 'roja' por defecto.
let CATEGORY = (new URLSearchParams(location.search).get("cat") || "roja").toLowerCase();

// [Bloque] Asegura que todo payload guardado lleve la categoría activa.
function ensureCategoryOnData(obj) {
  const data = { ...(obj || {}) };
  data.category = CATEGORY;
  return data;
}

// ===============================
// 3) SELECTORES DE UI
// ===============================
// [Bloque] Referencias a elementos del DOM usados por el panel.
const authOverlay   = document.getElementById("authOverlay");
const formLogin     = document.getElementById("formLogin");
const authMsg       = document.getElementById("authMsg");
const btnLogout     = document.getElementById("btnLogout");
const userEmail     = document.getElementById("userEmail");

const tabLinks      = document.querySelectorAll(".tablink");
const tabs          = document.querySelectorAll(".tab");

const formSettings  = document.getElementById("formSettings");
const settingsSaved = document.getElementById("settingsSaved");

const servicesList  = document.getElementById("servicesList");
const btnNewService = document.getElementById("btnNewService");
const serviceModal  = document.getElementById("serviceModal");
const formService   = document.getElementById("formService");
const btnCloseModal = document.getElementById("closeServiceModal");
const whatsappPreviewText = document.getElementById("whatsappPreviewText");
const whatsappPreviewLink = document.getElementById("whatsappPreviewLink");
const serviceDiagnostics = document.getElementById("serviceDiagnostics");

// ===============================
// 4) UTILIDADES DE UI
// ===============================
// [Bloque] Activación visual de tabs sin recargar.
function setActiveTab(tabId) {
  if (!tabs?.length) return;
  tabs.forEach(t => t.classList.toggle("active", t.id === tabId));
  tabLinks.forEach(l => l.classList.toggle("active", l.dataset.tab === tabId));
}

// [Bloque] Notificación visual de guardado.
function toastSaved(el) {
  if (!el) return;
  el.textContent = "Guardado ✔";
  setTimeout(() => el.textContent = "", 1500);
}

// [Bloque] Helpers de formularios (mapeo por atributo name).
function getControl(form, name){ return form?.elements?.namedItem(name) ?? null; }
function setValue(ctrl, value){
  if (!ctrl) return;
  if (ctrl.type === "checkbox") ctrl.checked = Boolean(value);
  else if (ctrl.tagName === "TEXTAREA" && Array.isArray(value)) ctrl.value = stringArrayToLines(value);
  else ctrl.value = (value ?? "");
}
function getValue(ctrl){
  if (!ctrl) return undefined;
  if (ctrl.type === "checkbox") return Boolean(ctrl.checked);
  if (ctrl.type === "number")   return ctrl.value === "" ? null : Number(ctrl.value);
  return ctrl.value;
}

// [Bloque] Serializa TODOS los campos con name del form, añade updatedAt y category.
function formToPayload(form) {
  const payload = {};
  if (form) {
    Array.from(form.elements).forEach(el => {
      if (!el.name || el.name === "id") return; // id se gestiona aparte
      payload[el.name] = getValue(el);
    });
  }
  payload.updatedAt = new Date().toISOString();
  return ensureCategoryOnData(payload);
}

// [Bloque] Rellena un form con datos (propiedad === name).
function fillForm(form, data){
  if (!form) return;
  Array.from(form.elements).forEach(el => {
    if (!el.name) return;
    if (el.name === "active" && typeof data?.[el.name] === "undefined") {
      setValue(el, true);
    } else {
      setValue(el, data?.[el.name]);
    }
  });
}

// [Bloque] Open/Close <dialog> con fallback seguro.
function openDialogSafe(dlg){
  if (!dlg) return;
  if (typeof dlg.showModal === "function") dlg.showModal();
  else dlg.setAttribute("open", "true");
}
function closeDialogSafe(dlg){
  if (!dlg) return;
  if (typeof dlg.close === "function") dlg.close();
  else dlg.removeAttribute("open");
}

// [Bloque] Ajusta el título del tab de servicios según la categoría activa.
function setServicesTitleIfPresent() {
  const h2  = document.querySelector('#tab-servicios h2');
  const alt = document.getElementById('servicesTitle');
  let label = "Magia roja"; // Valor predeterminado

  switch (CATEGORY) {
    case 'blanca':
      label = 'Magia blanca';
      break;
    case 'verde':
      label = 'Magia verde';
      break;
    case 'negra':
      label = 'Magia negra';
      break;
  }

  if (h2)  h2.textContent  = label;
  if (alt) alt.textContent = label;
}
setServicesTitleIfPresent();

// ===============================
// 5) NAVEGACIÓN (links de categoría y tabs)
// ===============================
// [Bloque] Intercepta solo los enlaces con ?cat= para SPA (sin recarga).
tabLinks.forEach(b => {
  b.addEventListener("click", (e) => {
    const href = b.getAttribute("href") || "";
    if (href.includes("?cat=")) {
      e.preventDefault();
      const newCat = (new URL(href, location.href).searchParams.get("cat") || "roja").toLowerCase();
      if (newCat !== CATEGORY) {
        CATEGORY = newCat;             // cambia estado
        setServicesTitleIfPresent();   // actualiza cabecera del tab
        loadServices();                // recarga lista filtrada
      }
      history.replaceState(null, "", `?cat=${CATEGORY}`); // sincroniza URL
      setActiveTab("tab-servicios");   // enfoca el tab de servicios
      return;
    }
    // Comportamiento normal para tabs sin ?cat=
    setActiveTab(b.dataset.tab);
  });
});

// ===============================
// 6) AUTENTICACIÓN (login/logout + whitelist)
// ===============================
// [Bloque] Login por email/pass con whitelist de correos permitidos.
formLogin?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = new FormData(formLogin);
  const email = data.get("email");
  const password = data.get("password");
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!ALLOWED_EMAILS.includes(cred.user.email)) {
      await signOut(auth);
      authMsg.textContent = "Este usuario no está autorizado para el panel.";
    }
  } catch (err) {
    console.error(err);
    authMsg.textContent = "Error de acceso. Verifica tus datos.";
  }
});

// [Bloque] Cierre de sesión.
btnLogout?.addEventListener("click", () => signOut(auth));

// [Bloque] Guardia de sesión y carga inicial.
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (authOverlay) authOverlay.style.display = "flex";
    return;
  }
  if (authOverlay) authOverlay.style.display = "none";
  if (userEmail)   userEmail.textContent = user.email;

  await loadSettings();
  await loadServices();
});

// ===============================
// 7) SETTINGS (site)
// ===============================
// [Bloque] Lectura de configuración global.
async function loadSettings(){
  try {
    const ref = doc(db, "settings", "site");
    const snap = await getDoc(ref);
    if (snap.exists()) fillForm(formSettings, snap.data());
  } catch (err) {
    console.error("Error cargando settings:", err);
  }
}

// [Bloque] Guardado de configuración global.
formSettings?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const payload = formToPayload(formSettings);
    await setDoc(doc(db, "settings", "site"), payload, { merge: true });
    toastSaved(settingsSaved);
  } catch (err) {
    console.error("Error guardando settings:", err);
  }
});

// ===============================
// 8) SERVICES (CRUD por categoría, sin índices compuestos)
// ===============================
function renderServicesMessage(message, className = "muted") {
  if (!servicesList) return;
  servicesList.textContent = "";
  const li = document.createElement("li");
  li.className = className;
  li.textContent = message;
  servicesList.appendChild(li);
}

function createStaticServiceItemShell() {
  const li = document.createElement("li");
  li.className = "service-item";

  const main = document.createElement("div");
  main.className = "item-main";
  const head = document.createElement("div");
  head.className = "item-head";
  const title = document.createElement("strong");
  title.className = "item-title";
  const status = document.createElement("span");
  status.className = "muted item-status";
  const desc = document.createElement("p");
  desc.className = "item-desc";
  const meta = document.createElement("p");
  meta.className = "muted item-meta";
  head.append(title, status);
  main.append(head, desc, meta);

  const actions = document.createElement("div");
  actions.className = "item-actions";
  [
    ["up", "↑", "Subir", ""],
    ["down", "↓", "Bajar", ""],
    ["edit", "Editar", "", ""],
    ["del", "Eliminar", "", "danger"]
  ].forEach(([act, text, titleText, className]) => {
    const button = document.createElement("button");
    button.dataset.act = act;
    button.textContent = text;
    if (titleText) button.title = titleText;
    if (className) button.className = className;
    actions.appendChild(button);
  });

  li.append(main, actions);
  return li;
}

// [Bloque] Lista servicios de la categoría activa (order en cliente).
async function loadServices() {
  if (!servicesList) return;
  renderServicesMessage("Cargando…", "muted");
  try {
    // Consulta sin orderBy para evitar índice compuesto: se ordena en cliente.
    const q = query(
      collection(db, "services"),
      where("category", "==", CATEGORY)
    );
    const snap = await getDocs(q);

    // Migración automática 1-shot: si en "roja" no hay nada, etiqueta huérfanos como 'roja'
    if (snap.empty && CATEGORY === "roja") {
      const migrated = await migrateMissingCategoryToRoja();
      if (migrated > 0) return loadServices();
    }

    const items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));

    // Ordena en memoria por 'order' asc (fallback a 0).
    items.sort((a,b) => (a.order ?? 0) - (b.order ?? 0));

    if (items.length === 0) {
      renderServicesMessage("No hay servicios en esta categoría.", "muted");
      return;
    }

    const frag = document.createDocumentFragment();
    for (const s of items) {
      const li = createStaticServiceItemShell();
      li.dataset.id = s.id;

      li.querySelector(".item-title").textContent = s.title ?? s.name ?? "";
      li.querySelector(".item-status").textContent = `#${s.order ?? 0} · ${s.active === false ? "Inactivo" : "Activo"} · ${s.featured ? "Destacado" : "No destacado"}`;
      li.querySelector(".item-desc").textContent = s.descriptionShort ?? s.description ?? "";
      li.querySelector(".item-meta").textContent = `Categoría: ${s.category ?? CATEGORY} · Slug: ${s.slug || "sin slug"}`;
      li.querySelector('[data-act="edit"]')?.addEventListener("click", () => openEditService(s));
      li.querySelector('[data-act="del"]') ?.addEventListener("click", () => deleteService(s.id));
      li.querySelector('[data-act="up"]')  ?.addEventListener("click", () => reorderSwapWithinCategory(s.id, -1));
      li.querySelector('[data-act="down"]')?.addEventListener("click", () => reorderSwapWithinCategory(s.id, +1));
      frag.appendChild(li);
    }
    servicesList.innerHTML = "";
    servicesList.appendChild(frag);
  } catch (err) {
    console.error("Error listando servicios:", err);
    renderServicesMessage("Error al cargar servicios.", "error");
  }
}


// [Bloque] Nuevo servicio / Editar servicio (abre modal, precarga y setea category hidden).
btnNewService?.addEventListener("click", () => openEditService(null));
function openEditService(service) {
  if (!formService || !serviceModal) return;
  formService.reset();
  formService.dataset.id = service?.id || "";
  formService.dataset.createdAt = service?.createdAt || "";

  if (service) fillForm(formService, service);
  else {
    setValue(getControl(formService, "active"), true);
    setValue(getControl(formService, "featured"), false);
    setValue(getControl(formService, "order"),  0);
  }

  // Campo oculto de categoría sincronizado
  let hidden = getControl(formService, "category");
  if (!hidden) {
    hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.name = "category";
    formService.appendChild(hidden);
  }
  hidden.value = CATEGORY;

  updateSlugSuggestion();
  updateWhatsappPreview();
  updateServiceDiagnostics(service || {});
  openDialogSafe(serviceModal);
}

// [Bloque] Guardar (create/update) siempre con categoría actual.
formService?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!formService) return;

  const id = formService.dataset.id;
  const existing = formService.dataset.createdAt ? { createdAt: formService.dataset.createdAt } : null;
  const data = serviceFormDataToPayload(new FormData(formService), { category: CATEGORY, existing });

  try {
    if (id) {
      await updateDoc(doc(db, "services", id), data);
    } else {
      await addDoc(collection(db, "services"), data);
    }
    closeDialogSafe(serviceModal);
    await loadServices();
  } catch (err) {
    console.error("Error guardando servicio:", err);
    alert("Error al guardar. Revisa la consola.");
  }
});

// [Bloque] Eliminar servicio de la categoría mostrada.
async function deleteService(id) {
  if (!confirm("¿Eliminar este servicio?")) return;
  try {
    await deleteDoc(doc(db, "services", id));
    await loadServices();
  } catch (err) {
    console.error("Error eliminando servicio:", err);
  }
}

// [Bloque] Reordenar ↑/↓ dentro de la categoría activa (orden en cliente, sin índice).
async function reorderSwapWithinCategory(id, delta, {
  collectionName = "services",
  orderField = "order"
} = {}) {
  try {
    // Trae solo la categoría actual (sin orderBy).
    const q = query(
      collection(db, collectionName),
      where("category", "==", CATEGORY)
    );
    const snap = await getDocs(q);

    // Ordena en memoria por 'order'.
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, order: d.data()?.[orderField] ?? 0 }));
    arr.sort((a,b) => (a.order ?? 0) - (b.order ?? 0));

    const idx = arr.findIndex(x => x.id === id);
    if (idx < 0) return;
    const swapIdx = idx + delta;
    if (swapIdx < 0 || swapIdx >= arr.length) return;

    const a = arr[idx], b = arr[swapIdx];
    await updateDoc(doc(db, collectionName, a.id), { [orderField]: b.order });
    await updateDoc(doc(db, collectionName, b.id), { [orderField]: a.order });

    await loadServices();
  } catch (err) {
    console.error("Error reordenando:", err);
  }
}


function updateSlugSuggestion() {
  const nameCtrl = getControl(formService, "name");
  const slugCtrl = getControl(formService, "slug");
  if (!nameCtrl || !slugCtrl || slugCtrl.value.trim()) return;
  slugCtrl.value = slugifyServiceName(nameCtrl.value);
}

function updateWhatsappPreview() {
  if (!formService || !whatsappPreviewText || !whatsappPreviewLink) return;
  const name = getControl(formService, "name")?.value || "";
  const ctaText = getControl(formService, "ctaText")?.value || "";
  const url = buildServiceWhatsappPreviewUrl({ name, ctaText });
  whatsappPreviewText.textContent = decodeURIComponent(url.split("text=")[1] || "");
  whatsappPreviewLink.href = url;
}

function updateServiceDiagnostics(service = {}) {
  if (!serviceDiagnostics) return;
  const warnings = [];
  if (typeof service.active === "undefined") warnings.push("Legacy: falta active. Al guardar quedará definido según el checkbox.");
  if (!service.slug) warnings.push("Recomendado: falta slug. Al guardar se usará el slug sugerido o uno generado desde el nombre.");
  if (!service.descriptionShort) warnings.push("Recomendado: falta descriptionShort para cards públicas v2.");
  serviceDiagnostics.textContent = warnings.join(" ");
  serviceDiagnostics.hidden = warnings.length === 0;
}

getControl(formService, "name")?.addEventListener("input", () => {
  updateSlugSuggestion();
  updateWhatsappPreview();
});
getControl(formService, "ctaText")?.addEventListener("input", updateWhatsappPreview);

// ===============================
// 9) CIERRE MODAL (botón ✖ del HTML)
// ===============================
// [Bloque] Cerrar el modal desde el botón de la X.
btnCloseModal?.addEventListener("click", () => closeDialogSafe(serviceModal));
