# Arquitectura — Cristal Sagrado

## Aplicación pública

El sitio público se genera como archivos HTML estáticos con Astro, output directory format y CSS mobile-first. No hay framework de UI ni hidratación global.

- src/pages/: Home, cuatro categorías, Tarot, FAQ, Cómo trabajamos, guías y landings SEO.
- src/components/: layout base, header/menú, footer, Hero estático, formularios, CTAs y contenido compartido.
- src/styles/tokens.css, global.css y components.css: variables, base y presentación responsive separados.
- src/lib/: constantes públicas, número de WhatsApp y metadata SEO.
- public/: admin independiente, assets, favicons, robots, CNAME y puentes legacy. El sitemap sale de src/pages/sitemap.xml.js.

El contenido informativo sale estático. La navegación móvil es HTML siempre visible y no necesita JavaScript. El diálogo WhatsApp usa el flujo público compartido. Formspree mantiene un único formulario HTML en Home.

La analítica opcional de Umami se integra una sola vez en `BaseLayout.astro`, solo con Website ID configurado y restringida al dominio público. `assets/js/analytics.js` filtra eventos y payloads; no se instrumenta `/admin/`. Ver `ANALYTICS.md` para taxonomía y privacidad.

## Firebase y servicios

El build consulta Firestore con la configuración pública, filtra `active == true` y guarda una snapshot saneada de `services` en `src/data/generated/services.public.json`. Astro genera las cuatro categorías con fichas HTML reales desde esa snapshot. El cliente Firestore se carga después en esas páginas para actualizar las fichas si la lectura tiene éxito; el buscador y la expansión funcionan sobre el HTML inicial aunque Firebase falle. El render remoto sigue creando nodos y usando `textContent`. No hay Firebase en Home, Tarot, FAQ ni Cómo trabajamos. Ver `SEO_GROWTH.md` para sincronización, fallback y Search Console.

## Admin

public/admin/ se sirve sin bundling bajo /admin/. admin/ contiene una copia idéntica usada por el sync de servicios y tests; no hay automatización que mantenga ambas carpetas sincronizadas. Firebase Auth, CDN, formularios y rutas relativas del panel quedan fuera de Astro. Firestore Rules continúan siendo la autoridad de seguridad.

## Rutas, dominio y deploy

Las URLs canónicas son rutas limpias con slash final. Los .html se conservan en public/ como puentes con canonical, meta refresh, redirección de respaldo y enlace. GitHub Pages no usa redirects de servidor en el workflow actual. servicios.html conduce a la sección de Home.

Producción compila dist/ y publica en gh-pages preservando previews. El workflow de previews define BASE_PATH y compila para su subdirectorio. public/CNAME y public/robots.txt se copian a dist/; src/pages/sitemap.xml.js genera el sitemap.

## Media y capas visuales

El Hero usa public/hero-ritual-desktop.webp y public/hero-ritual-mobile.webp. El fondo general usa public/images/video-poster.svg; otras páginas pueden usar public/images/moon-poster.webp. El video legacy y su componente sin consumidores se retiraron del árbol activo.

## Documentos relacionados

- Estrategia y fases: ASTRO_MIGRATION_PLAN.md.
- Modelo y comportamiento Firestore: FIREBASE_MODEL.md.
- Auditoría de media: PERFORMANCE_AUDIT.md.
- Revisión manual: QA_CHECKLIST.md.

## Cierre de migración 2026-10-02

La arquitectura Astro está implementada. El build y la suite Node pasaron. Chrome headless confirmó la Home sin overflow en los ocho anchos indicados, el menú y diálogo WhatsApp en móvil, y video estático con mobile/reduced-motion. El login Admin/Firebase en vivo, lectura real de servicios, envío Formspree y comparación visual directa con el legacy requieren configuración/acceso externos y siguen pendientes.
