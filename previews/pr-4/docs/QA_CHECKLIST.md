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
