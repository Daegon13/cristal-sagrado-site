# Cristal Sagrado

Sitio público estático construido con Astro 7, TypeScript y CSS propio. El panel `/admin/` permanece como aplicación Firebase independiente.

## Requisitos

- Node.js 22.19.0 o superior y npm.
- Acceso a internet para instalar paquetes y consultar servicios públicos en Firestore.

## Instalación y desarrollo

    npm ci
    npm run dev

Astro muestra la dirección local del servidor, normalmente http://localhost:4321.

## Tests y build

    npm test
    npm run build
    npm run preview

El build crea el sitio estático completo en dist/. El preview sirve ese build localmente.

## Deploy

GitHub Actions publica dist/ en la rama gh-pages al hacer push a main. Las previews de PR y ramas patch/** compilan con BASE_PATH para funcionar bajo su subdirectorio. public/CNAME mantiene cristal-sagrado.com; no hace falta ejecutar pasos locales antes de publicar.

## Estructura principal

- src/pages/: Home, cuatro categorías, Tarot, FAQ y Cómo trabajamos.
- src/components/: layout común, header, footer, video, hero, formulario, CTA y contenido compartido.
- src/lib/: constantes públicas, metadata SEO y datos compartidos.
- src/styles/: tokens, base global y estilos de componentes mobile-first.
- public/: admin independiente, assets, multimedia y puentes .html.
- assets/js/: render cliente de servicios Firebase y helpers existentes.
- tests/: suites Node para helpers del administrador, WhatsApp y modelo público.

## Decisiones operativas

- Home, Tarot, FAQ y Cómo trabajamos son HTML estático y no cargan Firebase.
- Solo las cuatro páginas de categoría inicializan Firebase público y consultan Firestore; el orden, normalización y render seguro actuales se conservan.
- Los CTA wa.me pasan por el diálogo que requiere describir el caso y conservan el contexto del servicio.
- El único formulario Formspree está en Home.
- /admin/ se copia sin bundling desde admin/; validar login con credenciales autorizadas y el proyecto Firebase habitual.
- Los .html existentes se sirven como puentes porque el hosting actual es GitHub Pages. Las rutas limpias son canónicas.
- El video y demás binarios se sirven desde public/ sin reprocesarlos.
