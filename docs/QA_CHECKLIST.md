# QA Checklist — Cristal Sagrado

## SEO técnico básico

- Cada página pública tiene un `<title>` único.
- Cada página pública tiene `meta name="description"` única.
- Cada página pública tiene un solo `<h1>`.
- Canonical consistente con `https://cristal-sagrado.com/`.
- `robots.txt`, `sitemap.xml` y `CNAME` usan el mismo dominio canónico.

## Navegación y enlaces

- Home abre correctamente.
- Categorías: magia roja, blanca, verde y negra abren sin 404.
- Tarot, FAQ y Cómo trabajamos abren sin 404.
- `servicios.html` redirige a `index.html#servicios`.
- No hay anchors rotos en CTAs internos (`#servicios`, `#testimonios`, `#formulario`).

## Conversión

- CTA de header abre WhatsApp.
- Botón flotante abre WhatsApp.
- Links de footer a WhatsApp, Instagram y TikTok funcionan.
- Formspree mantiene `action="https://formspree.io/f/mdklwnlg"`.
- El campo “Email o teléfono” acepta email o teléfono.

## Firebase y admin

- Firebase público solo carga en páginas de categoría que renderizan servicios.
- Home, Tarot, FAQ y Cómo trabajamos no importan Firestore.
- `/admin` permite login con usuario autorizado.
- Crear/editar/eliminar/reordenar servicio funciona por categoría.
- Confirmar Firestore Rules: no confiar solo en `ALLOWED_EMAILS` frontend.

## Performance

- Video tiene `preload="none"` y `poster`.
- `scripts/perf-media.js` carga el video de forma diferida.
- Revisar en FASE 4: `images/Eclipse_small.mp4`, `images/Eclipse_small.7z` y `images/favicon_io.zip`.

## Accesibilidad/manual

- Navegación mobile abre/cierra menú hamburguesa.
- Hay foco visible en links/botones principales.
- El contenido principal comienza con un h1 claro.
- No hay errores de consola en carga inicial.

## Admin servicios v2 — FASE 3B.1

- `/admin` muestra campos legacy y v2 en el formulario de servicios.
- Crear un servicio nuevo deja `active` marcado por defecto y guarda `active: true` salvo desmarcado explícito.
- `featured` se guarda como booleano.
- `intent`, `benefits`, `idealFor` y `notFor` se editan como una línea por ítem y se guardan como arrays de strings.
- `slug` se sugiere desde `name` solo cuando está vacío; un slug manual no se sobreescribe.
- Guardar sin slug genera fallback desde `name`.
- El preview de WhatsApp usa `ctaText` si existe y, si no existe, genera el mensaje por defecto con el nombre del servicio.
- Editar un servicio legacy no borra campos desconocidos porque el guardado usa merge/update de campos conocidos.
- El listado admin muestra nombre, categoría, activo/inactivo, destacado/no destacado, orden y slug de forma compacta.
- El listado admin inserta datos remotos con `textContent`, no con `innerHTML`.
- El diagnóstico legacy advierte si faltan `active`, `slug` o `descriptionShort`, sin escribir cambios automáticamente.
- No se ejecutó backfill automático; queda para FASE 3B.2.
