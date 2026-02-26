# PATCHBOOK — Cristal Sagrado

Este documento es la fuente de verdad para:
- Plan de parches (0..4) con objetivos y criterios de aceptación
- Flujo de trabajo con Codex + revisión en chats
- Reglas mínimas de seguridad (Firebase/Firestore + XSS)
- Checklist de QA

Regla principal: parches pequeños, aplicables y verificables.
No se cambia estética “porque sí”: primero performance + conversión + seguridad.

---

## 1) Cómo usar este Patchbook con Codex

En cada prompt a Codex, incluir SIEMPRE:

1) “Leé `docs/PATCHBOOK.md` completo y seguí sus reglas.”
2) “Entregá cambios como `git diff` (o archivos completos si se pide).”
3) “No rompas URLs/rutas existentes.”
4) “Dejá comentarios por bloque (JS/CSS/HTML) explicando función y motivo.”

Plantilla recomendada:

```text
Leé el archivo docs/PATCHBOOK.md completo y seguí sus reglas.
Quiero implementar el Patch X exactamente como está especificado.
Entregá un git diff.
No rompas rutas ni diseño.
Dejá comentarios por bloque.
```

---

## 2) Flujo de trabajo (rápido y seguro)

1) Crear branch: `patch/NN-nombre-corto`
2) Codex genera `git diff`
3) Aplicar diff y probar local
4) Revisar consola + network (sin errores / sin 404)
5) Merge a main

Servidor local:
- `python -m http.server 8080`
- Abrir `http://localhost:8080`

Definition of Done (para cualquier patch):
- No rompe URLs ni navegación.
- Sin errores en consola.
- Sin requests 404.
- Si toca render de datos: evitar XSS (ver SECURITY).
- Actualizar el “Estado” del patch en este documento.

---

## 3) Seguridad mínima (obligatoria)

La seguridad real NO se basa en ocultar el panel `/admin` ni en validaciones de frontend.
La seguridad real está en:
- Firebase Auth
- Firestore Rules
- Render seguro (evitar XSS)

Reglas mínimas:
- Prohibido: `allow write: if true;`
- Prohibido: “ser admin” definido solo en JS del frontend.

Si el frontend inyecta contenido de Firestore con `innerHTML` usando template strings, existe riesgo de XSS.
Regla práctica: renderizar texto con `textContent` por defecto.
Si se requiere formato, usar sanitización robusta o Markdown seguro.

---

## 4) Roadmap de Parches (0..4)

### Patch 0 — Higiene + fricción + hardening base (sin cambiar diseño)

Objetivo:
- Eliminar bugs silenciosos y fricción.
- Evitar requests innecesarios.
- Endurecer render contra XSS si aplica.

Tareas típicas:
1) Eliminar IDs duplicados en páginas de servicios (por ejemplo contenedores repetidos).
2) Eliminar referencias a scripts inexistentes (evitar 404).
3) Evitar cargar Firestore/JS de servicios en páginas que no lo usan (home).
4) Form “Email o teléfono”: permitir ambos (no bloquear por `type=email`).
5) Render seguro: evitar interpolar contenido de Firestore como HTML.

Criterios de aceptación:
- 0 IDs duplicados para elementos clave.
- 0 requests 404.
- Home no carga lógica Firestore de servicios si no la usa.
- Form permite email o teléfono.
- Texto renderizado de forma segura (textContent o sanitización).

Prompt Codex (Patch 0):
```text
Leé docs/PATCHBOOK.md completo y seguí sus reglas.

Implementá Patch 0 (higiene + fricción + hardening base) sin cambiar el diseño:
1) Revisar páginas de servicios: evitar IDs duplicados y estructura redundante.
2) Eliminar scripts referenciados que no existan (no dejar 404).
3) En home: no cargar JS de Firestore/servicios si no se usa.
4) Form: campo "Email o teléfono" debe aceptar ambos con validación simple.
5) Seguridad: evitar render con innerHTML de contenido remoto; usar textContent o sanitización.

Entregá git diff.
Dejá comentarios por bloque explicando función/motivo.
```

Estado: PENDIENTE

---

### Patch 1 — Performance real (LCP / primera carga)

Objetivo:
- Mejorar carga percibida en móvil.
- Evitar que video/fondos pesados bloqueen el render.

Tareas recomendadas:
1) Video background:
   - `preload="none"`
   - `poster` (imagen liviana)
   - carga condicional:
     - respetar `prefers-reduced-motion`
     - opcional: solo desktop o solo home
2) Preconnect a Google Fonts:
   - `fonts.googleapis.com`, `fonts.gstatic.com` + `crossorigin`
3) Lazy load en imágenes/cards (si aplica).
4) No cargar Firestore donde no se necesita.

Criterios de aceptación:
- El render inicial no depende del video.
- Menos requests pesados en móvil.
- Sin regresiones de layout (CLS bajo).

Prompt Codex (Patch 1):
```text
Leé docs/PATCHBOOK.md completo y seguí sus reglas.

Implementá Patch 1 (performance) manteniendo estética:
- Video: preload="none", poster y carga condicional (prefers-reduced-motion).
- Preconnect fonts google.
- Asegurar que Firestore/scripts de servicios solo carguen en páginas que los usan.
- Comentarios por bloque.
Entregá git diff + checklist de verificación.
```

Estado: PENDIENTE

---

### Patch 2 — Servicios v2 (catálogo que convierte)

Objetivo:
- Cada servicio con CTA directo (WhatsApp / reservar).
- Destacados arriba.
- Tags para filtrar por necesidad.
- Admin permite editar tags/featured sin tocar código.

Modelo de datos (Firestore `services`):
- `tags: string[]` (ej: ["amor","proteccion","claridad"])
- `featured: boolean`
Opcional:
- `ctaText: string`

Admin:
- Campo `tags` (texto separado por comas) -> array limpio: trim/lower/sin vacíos.
- Checkbox `featured`.

Frontend:
- Badges (Destacado / etc. si se agregan).
- CTA abre WhatsApp con mensaje prellenado incluyendo el nombre del servicio.
- Sección “Destacados” arriba (client-side).

Criterios de aceptación:
- CTA por servicio funciona y abre WhatsApp prellenado.
- Destacados visibles sin duplicar data ni query extra.
- Tags editables en admin y usados en filtros.

Prompt Codex (Patch 2):
```text
Leé docs/PATCHBOOK.md completo y seguí sus reglas.

Implementá Patch 2 (Servicios v2 orientado a conversión):
- Firestore services: soportar tags (array) y featured (bool).
- Admin: agregar inputs para tags (coma separated) y featured (checkbox), guardar tags como array limpio.
- Frontend: renderizar badges + CTA WhatsApp prellenado con nombre del servicio.
- Agregar sección Destacados arriba filtrando featured=true.
- No romper estilos existentes.
Entregá git diff con comentarios por bloque.
```

Estado: PENDIENTE

---

### Patch 3 — Selector por necesidad (home guía decisión)

Objetivo:
- Que el usuario elija su necesidad antes que “magia X”.
- Reducir indecisión: 1 click -> listado filtrado -> CTA.

Implementación:
- En home: bloque “Qué estás buscando hoy” con botones:
  - Amor y pareja
  - Dinero y trabajo
  - Protección y limpieza
  - Claridad mental
  - Mascotas
  - Urgente
- Botones redirigen a listados con `?need=amor` (o página central).
- JS del listado:
  - leer `need` con URLSearchParams
  - filtrar por `tags` (fallback: match en título/descr)
  - mostrar “Filtrado por: X” + botón “Quitar filtro”

Criterios de aceptación:
- Click en home abre listado ya filtrado.
- El filtro puede limpiarse.
- No hay roturas de navegación.

Prompt Codex (Patch 3):
```text
Leé docs/PATCHBOOK.md completo y seguí sus reglas.

Implementá Patch 3 (selector por necesidad):
- Home: bloque con botones que redirigen a servicios con ?need=...
- Listado: leer need, filtrar por tags, fallback por match en título/descripcion.
- UI: indicador de filtro y botón para quitar filtro.
Entregá git diff con comentarios por bloque.
```

Estado: PENDIENTE

---

### Patch 4 — Medición (sin medición no hay mejora real)

Objetivo:
- Medir eventos clave para validar conversión.

Eventos sugeridos:
- `selector_need_click`
- `service_cta_click`
- `form_submit`

Requisito:
- Definir si se usa GA4 directo o GTM.

Criterios de aceptación:
- Eventos se disparan y llegan a Analytics con nombres consistentes.

Prompt Codex (Patch 4):
```text
Leé docs/PATCHBOOK.md completo y seguí sus reglas.

Implementá Patch 4 (medición):
- Integrar GA4 o GTM (según configuración del proyecto).
- Trackear: selector_need_click, service_cta_click, form_submit.
- Mantener el sitio estático y sin romper performance.
Entregá git diff + instrucciones de verificación.
```

Estado: PENDIENTE

---

## 5) Checklist QA (antes de merge)

Navegación:
- Home
- Servicios (al menos 2 páginas: magia-roja + magia-blanca)
- Tarot
- Admin login y alta/edición de un servicio

Consola/Network:
- Sin errores en consola
- Sin 404

Conversión:
- CTA WhatsApp abre con mensaje correcto
- Selector por necesidad filtra correcto (si Patch 3 aplicado)

Mobile:
- Scroll fluido
- Layout estable (sin saltos grandes)
