# Arquitectura — Cristal Sagrado

## Aplicación pública

El sitio público se genera como archivos HTML estáticos con Astro, output directory format y CSS mobile-first. No hay framework de UI ni hidratación global.

- src/pages/: Home, cuatro categorías, Tarot, FAQ y Cómo trabajamos.
- src/components/: layout base, header/menú, footer, video, formularios, CTAs y contenido compartido.
- src/styles/tokens.css, global.css y components.css: variables, base y presentación responsive separados.
- src/lib/: constantes públicas, número de WhatsApp y metadata SEO.
- public/: admin independiente, assets, multimedia, favicons, robots, sitemap, CNAME y puentes legacy.

El contenido informativo sale estático. Los scripts de menú, video y diálogo WhatsApp se limitan a interacciones. Formspree mantiene un único formulario HTML en Home.

## Firebase y servicios

El cliente Firestore se importa únicamente desde las cuatro páginas de categoría. Consulta services por category y active == true, conserva normalización v2, cache, orden, búsqueda, expansión y mensajes de error/vacío. El render remoto sigue creando nodos y usando textContent. No hay Firebase en Home, Tarot, FAQ ni Cómo trabajamos.

## Admin

admin/ se copia íntegro a public/admin/ y se sirve sin bundling bajo /admin/. Firebase Auth, CDN, formularios y rutas relativas del panel quedan fuera de Astro. Firestore Rules continúan siendo la autoridad de seguridad.

## Rutas, dominio y deploy

Las URLs canónicas son rutas limpias con slash final. Los .html se conservan en public/ como puentes con canonical, meta refresh, redirección de respaldo y enlace. GitHub Pages no usa redirects de servidor en el workflow actual. servicios.html conduce a la sección de Home.

Producción compila dist/ y publica en gh-pages preservando previews. El workflow de previews define BASE_PATH y compila para su subdirectorio. CNAME, robots.txt y sitemap mantienen cristal-sagrado.com.

## Media y capas visuales

El video conserva su binario y rutas de origen. VideoBackground.astro lo mantiene fijo fuera del flujo y lo carga en idle únicamente si no aplican mobile, reduced-motion, reduced-data o saveData. El poster y gradiente quedan como fallback.

## Documentos relacionados

- Estrategia y fases: ASTRO_MIGRATION_PLAN.md.
- Modelo y comportamiento Firestore: FIREBASE_MODEL.md.
- Auditoría de media: PERFORMANCE_AUDIT.md.
- Revisión manual: QA_CHECKLIST.md.

## Cierre de migración 2026-10-02

La arquitectura Astro está implementada. El build y la suite Node pasaron. Chrome headless confirmó la Home sin overflow en los ocho anchos indicados, el menú y diálogo WhatsApp en móvil, y video estático con mobile/reduced-motion. El login Admin/Firebase en vivo, lectura real de servicios, envío Formspree y comparación visual directa con el legacy requieren configuración/acceso externos y siguen pendientes.
