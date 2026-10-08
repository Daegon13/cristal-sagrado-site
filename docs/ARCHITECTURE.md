# Arquitectura — Cristal Sagrado

## Aplicación pública

El sitio público se genera como archivos HTML estáticos con Astro, output directory format y CSS mobile-first. No hay framework de UI ni hidratación global.

- src/pages/: Home, cuatro categorías, Tarot, FAQ y Cómo trabajamos.
- src/components/: layout base, header/menú, footer, video, formularios, CTAs y contenido compartido.
- src/styles/tokens.css, global.css y components.css: variables, base y presentación responsive separados.
- src/lib/: constantes públicas, número de WhatsApp y metadata SEO.
- public/: admin independiente, assets, multimedia, favicons, robots, sitemap, CNAME y puentes legacy.

El contenido informativo sale estático. La navegación móvil es HTML siempre visible y no necesita JavaScript. Los scripts de video y diálogo WhatsApp se limitan a interacciones. Formspree mantiene un único formulario HTML en Home.

La analítica opcional de Umami se integra una sola vez en `BaseLayout.astro`, solo con Website ID configurado y restringida al dominio público. `assets/js/analytics.js` filtra eventos y payloads; no se instrumenta `/admin/`. Ver `ANALYTICS.md` para taxonomía y privacidad.

## Firebase y servicios

El build consulta Firestore con la configuración pública, filtra `active == true` y guarda una snapshot saneada de `services` en `src/data/generated/services.public.json`. Astro genera las cuatro categorías con fichas HTML reales desde esa snapshot. El cliente Firestore se carga después en esas páginas para actualizar las fichas si la lectura tiene éxito; el buscador y la expansión funcionan sobre el HTML inicial aunque Firebase falle. El render remoto sigue creando nodos y usando `textContent`. No hay Firebase en Home, Tarot, FAQ ni Cómo trabajamos. Ver `SEO_GROWTH.md` para sincronización, fallback y Search Console.

## Admin

admin/ se copia íntegro a public/admin/ y se sirve sin bundling bajo /admin/. Firebase Auth, CDN, formularios y rutas relativas del panel quedan fuera de Astro. Firestore Rules continúan siendo la autoridad de seguridad.

## Rutas, dominio y deploy

Las URLs canónicas son rutas limpias con slash final. Los .html se conservan en public/ como puentes con canonical, meta refresh, redirección de respaldo y enlace. GitHub Pages no usa redirects de servidor en el workflow actual. servicios.html conduce a la sección de Home.

Producción compila dist/ y publica en gh-pages preservando previews. El workflow de previews define BASE_PATH y compila para su subdirectorio. CNAME, robots.txt y sitemap mantienen cristal-sagrado.com.

## Media y capas visuales

El video conserva su binario y rutas de origen. VideoBackground.astro lo mantiene fijo fuera del flujo y lo carga en idle únicamente desde 960 px si no aplican reduced-motion, reduced-data o saveData. Un fotograma WebP derivado del mismo video se usa como fondo estático del Hero hasta 959 px; el poster SVG y el gradiente quedan como fallback.

## Documentos relacionados

- Estrategia y fases: ASTRO_MIGRATION_PLAN.md.
- Modelo y comportamiento Firestore: FIREBASE_MODEL.md.
- Auditoría de media: PERFORMANCE_AUDIT.md.
- Revisión manual: QA_CHECKLIST.md.

## Cierre de migración 2026-10-02

La arquitectura Astro está implementada. El build y la suite Node pasaron. Chrome headless confirmó la Home sin overflow en los ocho anchos indicados, el menú y diálogo WhatsApp en móvil, y video estático con mobile/reduced-motion. El login Admin/Firebase en vivo, lectura real de servicios, envío Formspree y comparación visual directa con el legacy requieren configuración/acceso externos y siguen pendientes.
