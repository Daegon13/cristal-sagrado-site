# Auditoría de legacy y duplicados — 2026-10-08

## Alcance y criterio

Se revisaron `git ls-files` (167 entradas en el índice antes de esta limpieza), el árbol local, imports Astro/JS, HTML público, workflows, scripts, assets y `dist/`. La revisión parte del trabajo local de SEO y guías ya presente en el árbol; no descarta esos cambios. Clasificación: **ACTIVE** (usado), **COMPATIBILITY** (URL o integración histórica vigente), **DUPLICATE** (copia con fuente conocida), **DEAD** (sin consumidor productivo), **ARCHIVE/DOCS** (registro histórico) y **UNKNOWN / REVIEW_REQUIRED** (falta evidencia para borrar).

## Inventario y acción

| Path | Clasificación | Evidencia | Acción |
| --- | --- | --- | --- |
| `src/pages/`, `src/components/` salvo `VideoBackground.astro`, `src/styles/`, `src/lib/`, `assets/js/` | ACTIVE | Imports Astro, build y tests | KEEP |
| `src/pages/sitemap.xml.js` | ACTIVE | Genera `dist/sitemap.xml` con 25 URLs; usa `Set` | KEEP |
| `public/*.html` (8 archivos) | COMPATIBILITY | `noindex,follow`, canonical, meta refresh y enlace a ruta nueva | KEEP |
| `public/admin/` y `public/assets/js/{service-helpers,whatsapp}.js` | ACTIVE | Se copian a `dist/`; el panel importa ambos helpers con rutas relativas | KEEP |
| `admin/` | DUPLICATE / REVIEW_REQUIRED | Los 7 archivos tienen el mismo hash que `public/admin/`; `sync-public-services.mjs` y tests importan la copia raíz, mientras `/admin/` usa la pública. No hay sync automático | KEEP; consolidar en tarea separada con QA de Auth |
| `assets/js/{service-helpers,whatsapp}.js` frente a `public/assets/js/` | DUPLICATE / REVIEW_REQUIRED | Hashes idénticos; Astro y scripts usan raíz, el admin publicado usa `public/`. No hay sincronización automática | KEEP hasta definir una publicación única verificada |
| `public/CNAME`, `public/robots.txt` | ACTIVE | Astro los copia a `dist/`; CNAME conserva `cristal-sagrado.com`, robots apunta al sitemap dinámico | KEEP |
| `CNAME`, `robots.txt`, `sitemap.xml` de raíz | DEAD / DUPLICATE | No se copian a `dist/`; sus equivalentes activos son públicos o generados por Astro | DELETE |
| HTML de raíz: `index`, `faq`, `como-trabajamos`, `magia-{blanca,roja,negra,verde}`, `tarot`, `servicios` | DEAD | Astro no los importa ni los publica; los puentes de `public/` cubren las URLs `.html` | DELETE (9) |
| `css/` (7 archivos) | DEAD | Referencias solo desde HTML de raíz retirado; Astro usa `src/styles/` | DELETE |
| `src/components/VideoBackground.astro` | DEAD | Ninguna página/layout lo importa; `BaseLayout` usa poster estático | DELETE |
| `images/Eclipse_small.mp4`, `public/images/Eclipse_small.mp4` | DEAD / DUPLICATE | Hash idéntico; solo HTML y componente de video retirados lo referenciaban; ninguno carga video en el build activo | DELETE (2) |
| `images/video-poster.svg` | DUPLICATE | Hash idéntico a `public/images/video-poster.svg`; solo el público se usa | DELETE |
| `public/images/video-poster.svg`, `public/images/moon-poster.webp` | ACTIVE | `BaseLayout` y `Hero` respectivamente | KEEP |
| `public/hero-ritual-{desktop,mobile}.webp` | ACTIVE | Única ubicación; `Hero.astro` y test de assets los usan | KEEP |
| `favicon_io/` de raíz (8 archivos) | DUPLICATE | Hashes idénticos a `public/favicon_io/`; Astro publica y referencia solo la copia pública | DELETE |
| `public/favicon_io/` | ACTIVE / UNKNOWN | Favicon y manifest referenciados; `cristal_sagrado.png` no tiene consumidor interno confirmado, puede tener URL externa | KEEP |
| `public/assets/js/data.js`, `public/assets/js/whatsapp-contact.js` | DUPLICATE / DEAD | Copias viejas y distintas de `assets/js/`; ningún HTML público actual las importa. Astro bundlea la fuente raíz | DELETE |
| `scripts/perf-media.js`, `public/scripts/perf-media.js` | DEAD / DUPLICATE | Mismo código; solo el HTML de raíz retirado lo cargaba | DELETE |
| `scripts/rewrite_basepath.py` | ARCHIVE/DOCS | El workflow actual usa `BASE_PATH`, no lo ejecuta; conserva contexto de migración | KEEP |
| `scripts/{sync-public-services,weekly-analytics-report,campaign-link,seo-service-audit,qa-built-seo,qa-current-public}.mjs` | ACTIVE | Build, reporte, campañas, auditoría o QA local actual | KEEP |
| `scripts/qa-{header,mobile}.mjs` | ARCHIVE/DOCS / REVIEW_REQUIRED | Sus selectores `.menu-toggle` corresponden a un header anterior; `qa-mobile` falla por esa expectativa aunque sus comprobaciones de Firestore/WhatsApp pasaron. `qa-current-public.mjs` cubre el sitio actual | KEEP como evidencia; no usar como gate actual |
| `scripts/qa-{copy,hero}.mjs` | ARCHIVE/DOCS | QA manual de etapas previas; no forman parte de `npm test` ni de workflows | KEEP como referencia |
| `Log`, `ignorar`, `readme.txt` de raíz | DEAD | Dos notas genéricas sin contrato operativo y un archivo vacío | DELETE |
| `docs/visual-qa/` | ARCHIVE/DOCS / REVIEW_REQUIRED | Capturas de evidencia histórica; 2.01 MB, candidato a archivar fuera del árbol en una tarea editorial | KEEP |
| `docs/ASTRO_MIGRATION_PLAN.md`, `PERFORMANCE_AUDIT.md`, `QA_CHECKLIST.md` | ARCHIVE/DOCS | Describen estados previos, video o QA histórico | KEEP con encabezado Historical |
| `docs/GITHUB_PAGES_PREVIEWS.md` | ARCHIVE/DOCS parcial | La sección de reescritura de HTML es histórica; workflows aún activos | KEEP con aviso |
| `.github/workflows/{pages-deploy,pages-preview,pages-cleanup,weekly-analytics-report}.yml` | ACTIVE | Deploy `main → build Astro → gh-pages`; previews y reporte tienen funciones distintas | KEEP |
| `astro` en `package.json` | ACTIVE | Comandos `dev`, `build`, `preview`; única dependencia directa | KEEP; sin `npm install` |

## Puentes de URLs históricas

| URL vieja | URL nueva |
| --- | --- |
| `/faq.html` | `/faq/` |
| `/como-trabajamos.html` | `/como-trabajamos/` |
| `/magia-blanca.html` | `/magia-blanca/` |
| `/magia-roja.html` | `/magia-roja/` |
| `/magia-negra.html` | `/magia-negra/` |
| `/magia-verde.html` | `/magia-verde/` |
| `/tarot.html` | `/tarot/` |
| `/servicios.html` | `/#servicios` |

Los puentes son HTML estático con meta refresh y `location.replace`, no redirects HTTP 301. Tienen `noindex,follow` y canonical a la ruta nueva. El QA de build comprueba los ocho archivos. No se modificó su comportamiento.

## Estado de la documentación

| Estado | Archivos | Decisión |
| --- | --- | --- |
| CURRENT | `ANALYTICS.md`, `ARCHITECTURE.md`, `FIREBASE_MODEL.md`, `SEO_GROWTH.md`, `INSTAGRAM_TRAFFIC.md`, este informe | KEEP; `ARCHITECTURE.md` se ajustó al build sin video |
| HISTORICAL | `ASTRO_MIGRATION_PLAN.md`, `PERFORMANCE_AUDIT.md`, `QA_CHECKLIST.md`, `COPY_AUDIT.md`, `CONVERSION_DESIGN.md`, `PATCHBOOK.md`, `visual-qa/` | KEEP; los tres primeros recibieron aviso Historical |
| MIXED | `GITHUB_PAGES_PREVIEWS.md` | KEEP con aviso sobre `rewrite_basepath.py` y HTML viejo; los workflows siguen vigentes |
| OBSOLETE como código productivo | HTML/CSS/video/scripts retirados en la tabla anterior | DELETE; Git conserva su historial |

## Medición

Se mide el árbol del proyecto excluyendo `.git/`, `node_modules/`, `.astro/` y `dist/`; `public/` y `dist/` se miden aparte. `git ls-files` sigue mostrando los 38 borrados hasta que se registren en Git; la cifra de archivos **presentes** refleja la limpieza local. MB decimales.

| Métrica | Antes | Después | Ahorro |
| --- | ---: | ---: | ---: |
| Archivos presentes del proyecto | 178 | 142 | 36 netos (38 borrados, 2 nuevos) |
| Tamaño del proyecto sin dependencias/build | 50.50 MB | 5.15 MB | 45.36 MB |
| Archivos de `public/` | 35 | 31 | 4 |
| Tamaño de `public/` | 23.94 MB | 2.40 MB | 21.54 MB |
| Archivos de `dist/` | 67 | 63 | 4 |
| Tamaño de `dist/` | 24.31 MB | 2.77 MB | 21.54 MB |
| Archivos `.js` del proyecto | 28 | 24 | 4 |
| Archivos `.css` del proyecto | 15 | 8 | 7 |
| HTML de raíz / puentes públicos | 9 / 8 | 0 / 8 | 9 HTML completos |
| MP4 del proyecto | 43.05 MB (2 copias) | 0 MB | 43.05 MB |

## Validación y límites

`npm test` (44/44), `npm run build`, `npm run test:build` y `git diff --check` pasaron tras la limpieza. `dist/` conserva las páginas Astro, los ocho puentes, admin, helpers del admin, CNAME, robots y un sitemap de 25 URLs; no contiene video, CSS legacy, scripts de video ni las copias públicas obsoletas de `data.js` y `whatsapp-contact.js`. `qa-current-public.mjs` comprobó 34 rutas HTTP y 50 visitas en Chrome (390 y 1440 px), sin overflow, video ni CSS viejo; verificó formulario inválido, diálogo de WhatsApp, salida tras caso válido con analytics sin texto privado, búsqueda de categoría y shell admin.

El build consulta los servicios públicos de Firestore, pero no prueba login admin autorizado, envío real de Formspree, recepción real de Umami ni salida real de WhatsApp en dispositivos. Esos flujos requieren QA externo posterior. No se hizo deploy, push ni reescritura del historial.
