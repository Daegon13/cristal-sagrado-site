# Arquitectura — Cristal Sagrado

## Tipo de proyecto

Sitio estático en HTML, CSS y JavaScript, publicado como archivos planos. No usa bundler ni framework frontend. El objetivo actual es mejorar conversión, SEO técnico, accesibilidad, performance y mantenibilidad mediante parches pequeños.

## Estructura principal

- `index.html`: home pública, hero, grilla de categorías, testimonios y formulario Formspree.
- `magia-blanca.html`, `magia-roja.html`, `magia-negra.html`, `magia-verde.html`: páginas públicas de categorías que cargan servicios activos desde Firestore.
- `tarot.html`, `faq.html`, `como-trabajamos.html`: páginas informativas públicas.
- `servicios.html`: redirección heredada hacia la sección de servicios de la home.
- `admin/`: panel administrativo con Firebase Auth y Firestore.
- `assets/js/data.js`: lectura pública de servicios desde Firestore y render seguro de listados.
- `scripts/perf-media.js`: carga diferida del video de fondo después del primer render; evita cargarlo en mobile, reduced motion y ahorro de datos.
- `css/`: estilos globales y estilos específicos por categoría.
- `images/` y `favicon_io/`: video, poster y favicons.
- `robots.txt`, `sitemap.xml`, `CNAME`: señales de SEO/deploy.

## Flujo público

1. El usuario llega a la home o a una categoría.
2. Los CTAs principales apuntan a WhatsApp con mensaje prellenado o al formulario Formspree.
3. En páginas de categoría, el HTML importa `assets/js/data.js` como módulo.
4. `renderServices()` consulta Firestore `services` por `category` y `active=true`, ordena en cliente por `order` y renderiza con nodos DOM seguros.
5. El buscador filtra en cliente por título/descripción ya renderizados.

## Flujo admin

1. `/admin/index.html` carga `admin/app.js` y `admin/config.js`.
2. Firebase Auth valida email/contraseña.
3. `ALLOWED_EMAILS` mejora la UX, pero no reemplaza Firestore Rules.
4. El panel lee/escribe `settings/site` y documentos de `services`.
5. La categoría activa se decide por `?cat=roja|blanca|negra|verde`.
6. Desde FASE 3B.1, el formulario de servicios conserva campos legacy y agrega edición opcional de modelo v2 (`slug`, copies extendidos, arrays de intención/beneficios, `featured` y `ctaText`) sin migración destructiva. Los servicios nuevos guardan `active: true` por defecto para ser compatibles con la consulta pública `where("active", "==", true)`.

## Dependencias externas

- Firebase SDK modular vía CDN (`firebase-app`, `firebase-auth`, `firebase-firestore`).
- Google Fonts.
- Formspree para el formulario de contacto.
- WhatsApp `wa.me` para conversión directa.

## Decisiones de seguridad y mantenimiento

- Los datos remotos de Firestore deben renderizarse con `textContent` o creación explícita de nodos, no con `innerHTML`.
- La protección real de escrituras debe estar en Firestore Rules/Auth, no en el frontend.
- No se debe cargar Firebase en páginas que no consumen Firestore/Admin.
- Mantener rutas heredadas para no romper SEO ni enlaces compartidos.

## Hallazgos FASE 0/1

- FASE 4A/4B inicial: `images/Eclipse_small.7z` y `images/favicon_io.zip` fueron removidos por ser comprimidos no referenciados dentro del deploy. `images/Eclipse_small.mp4` (~21 MB) sigue como asset pesado, pero se carga diferido y con guardas de mobile/reduced-motion/ahorro de datos.
- `sitemap.xml` usaba `www`, mientras `CNAME` y `robots.txt` apuntan a `cristal-sagrado.com`. Se normaliza a dominio canónico sin `www`.
- Las páginas públicas necesitaban `h1` único y meta descriptions específicas.
- `faq.html` tenía dos elementos `<main>` y contenido duplicado; queda consolidado en un solo `<main>`.
- `assets/js/data.js` tenía auto-inicialización además de llamadas explícitas por página; eso podía duplicar render/lecturas Firestore.

## Herramientas manuales de mantenimiento admin

Desde FASE 3B.2, `/admin` puede incluir herramientas de mantenimiento explícitas para revisar deuda de datos sin automatismos destructivos. El diagnóstico legacy de `services` lee toda la colección, calcula campos faltantes en cliente y muestra una vista previa; solo escribe cuando el usuario presiona “Aplicar defaults legacy” y confirma la acción.

El flujo evita escrituras durante la carga inicial del admin. En particular, la migración histórica automática que asignaba documentos sin categoría a `roja` cuando esa categoría estaba vacía quedó fuera del flujo de carga. Si se necesita recuperar documentos huérfanos de categoría, debe hacerse en un patch separado como acción manual, separada del backfill v2, con preview y confirmación.

## Render público v2 compatible

Desde FASE 3C.1, `assets/js/data.js` renderiza cards públicas enriquecidas con campos v2 opcionales (`featured`, `intent`, `idealFor`, `benefits`, `descriptionShort`, `ctaText` y `slug`) después de normalizar cada documento. La compatibilidad legacy se conserva mediante fallbacks en `assets/js/service-helpers.js`: si faltan campos v2, la card muestra solo la información disponible y evita secciones vacías.

El render público sigue limitado a páginas de categoría, no carga Firestore en `index.html`, no crea páginas detalle y no escribe en Firestore. Los CTAs usan WhatsApp con número fijo y mensajes generados por helper compartido.

## Estrategia de video/performance FASE 4A/4B inicial

El video de fondo público se declara sin `<source>` inicial, con `preload="none"`, `poster` y `data-src`. `scripts/perf-media.js` decide en cliente si puede insertar el `<source>` después del primer render mediante `requestIdleCallback` o `setTimeout`.

No se carga video en pantallas mobile (`max-width: 767px`), con `prefers-reduced-motion: reduce`, con `prefers-reduced-data: reduce` o con `navigator.connection.saveData`. En esos casos queda visible el fallback CSS basado en `images/video-poster.svg`, gradientes y color base. Esta decisión reduce peso inicial sin cambiar rutas públicas ni modelo Firebase.

## Propuesta de migración progresiva a Astro

La arquitectura legacy debe mantenerse estable mientras se prepara una migración progresiva a Astro. El plan recomendado está documentado en `docs/ASTRO_MIGRATION_PLAN.md` y prioriza una salida estática, componentización gradual y aislamiento estricto de Firebase.

Principios para esa migración:

- No reescribir todo de golpe ni borrar la versión HTML/CSS/JS legacy hasta tener QA visual y SEO aprobado.
- Migrar primero la home como página estática sin Firestore, para eliminar deuda de layout/CSS sin afectar admin ni servicios dinámicos.
- Conservar `/admin` inicialmente como legacy servido desde `public/admin`, sin pasar por Astro ni bundler.
- Encapsular Firestore público solo en páginas de servicios (`/magia-blanca/`, `/magia-roja/`, `/magia-negra/`, `/magia-verde/`) mediante script/isla cliente específica.
- Preservar rutas críticas de assets, especialmente `images/Eclipse_small.mp4`, `images/video-poster.svg`, favicons, `robots.txt`, `sitemap.xml` y `CNAME`.
- Crear rutas limpias con trailing slash y mantener rutas `.html` como redirects o páginas puente para no romper SEO ni enlaces existentes.
- Reemplazar la cascada CSS acumulada por tokens, layout base y estilos por componente, usando el legacy como referencia visual y de contenido, no como hoja global permanente.

La fase actual es solo documental: no crea scaffold Astro, no toca producción, no cambia Firebase, no modifica admin y no altera HTML/CSS/JS público existente.
