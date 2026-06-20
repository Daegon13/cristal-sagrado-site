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

- Video tiene `preload="none"`, `poster` y no incluye `<source>` inicial bloqueante.
- `scripts/perf-media.js` carga el video de forma diferida en idle solo cuando no aplica una guarda de performance/accesibilidad.
- Home mobile debe mostrar fallback visual y no descargar `images/Eclipse_small.mp4`.
- Con `prefers-reduced-motion: reduce` debe mostrarse fallback visual y no descargarse el video.
- Con ahorro de datos (`prefers-reduced-data` o `navigator.connection.saveData`) debe mostrarse fallback visual y no descargarse el video.
- No debe haber 404 de assets después de remover comprimidos no referenciados.
- Home debe seguir sin importar Firebase, Firestore ni `assets/js/data.js`.
- Páginas públicas principales deben responder HTTP 200: `/`, `/admin/`, `/magia-blanca.html`, `/magia-roja.html`, `/magia-negra.html`, `/magia-verde.html`, `/tarot.html`, `/faq.html`, `/como-trabajamos.html`.
- Pendiente recomendado: Lighthouse mobile/desktop y revisión visual en navegador real.

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

## Admin diagnóstico/backfill legacy — FASE 3B.2

- Abrir `/admin` no debe escribir en Firestore ni ejecutar migraciones automáticas.
- “Analizar servicios legacy” debe leer `services`, mostrar conteos y listar documentos afectados sin escribir cambios.
- La vista previa debe mostrar total analizado, total con cambios propuestos, total con warnings y total actualizable automáticamente.
- El botón “Aplicar defaults legacy” debe permanecer deshabilitado si no hay documentos seguros para actualizar.
- Aplicar defaults debe requerir confirmación explícita con el texto que indica cuántos servicios se actualizarán y que no se borrarán datos existentes.
- Solo se deben escribir documentos con `safeToPatch: true`.
- El patch debe incluir únicamente campos faltantes/invalidos propuestos y `updatedAt`; no debe sobrescribir campos existentes ni borrar campos desconocidos.
- Documentos sin `name`/`title` o sin `description` deben mostrar warning y omitirse del backfill automático.
- La herramienta debe recordar que los servicios sin `active` no aparecen públicamente por la consulta `active == true`.
- La migración histórica de categoría roja no debe ejecutarse automáticamente al cargar el listado.

## Cards públicas v2 — FASE 3C.1

- Las páginas `magia-blanca.html`, `magia-roja.html`, `magia-negra.html` y `magia-verde.html` siguen cargando servicios desde `assets/js/data.js`; la home no importa Firebase/Firestore.
- Un servicio con `featured: true` muestra badge “Destacado” y no depende solo de color.
- `descriptionShort` se muestra en la card; si falta, se ve el fallback legacy `description`.
- `intent`, `idealFor` y `benefits` solo aparecen cuando tienen valores, sin títulos o listas vacías.
- Precio y duración solo aparecen cuando existen y son valores normalizados válidos.
- Cada card tiene CTA “Consultar por este servicio” como `<a>` a WhatsApp, con `aria-label` que incluye el nombre del servicio.
- Si `ctaText` existe, modifica el mensaje prellenado de WhatsApp del servicio.
- Si una categoría no tiene servicios, se muestra mensaje comercial con CTA general a WhatsApp.
- Si Firestore falla, se muestra mensaje claro con CTA general y el detalle técnico queda solo en consola.
- Las cards se renderizan creando nodos y usando `textContent` para datos remotos; no se usa `innerHTML` con contenido de Firestore.
