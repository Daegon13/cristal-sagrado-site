# Implementación SEO/GEO 3.1

Rama: `feat/cristal-sagrado-3-1-seo-geo`, desde `origin/main` `235856a`. Fecha de trabajo: 11 de noviembre de 2026. Publicación pendiente de revisión del PR; el merge a `main` activa Pages en producción.

## Cambios

| Área | Archivos | Motivo y resultado |
| --- | --- | --- |
| Landing local | `src/pages/trabajos-espirituales-montevideo/index.astro` | Página original que explica catálogo, modalidad online, diferencias, pasos, FAQ y contacto desde Montevideo/Uruguay. No anuncia local, domicilio ni horario. |
| Enlaces | `src/pages/index.astro`, `src/components/Footer.astro` | Entrada contextual desde Home y enlace común; la nueva ruta no queda huérfana. |
| Metadata | `src/lib/seo.ts` | Títulos y descripciones ajustados para Home, Tarot, Roja y Blanca; metadata propia para la landing. Ninguna ficha ni texto de los 52 servicios cambia. |
| JSON-LD | `src/lib/seo.ts`, Home, landing | Home define una vez `Organization`, `WebSite`, `WebPage` para la marca. La landing define `WebPage` y `BreadcrumbList` coherentes con el HTML. Sin Person, LocalBusiness, `areaServed`, reseñas, precios ni `sameAs` no verificados. |
| Robots | `public/robots.txt` | Sigue excluyendo admin/previews para el grupo general; GPTBot y ClaudeBot se excluyen explícitamente del rastreo. OAI-SearchBot, ChatGPT-User, Claude-SearchBot y Claude-User continúan sujetos al grupo general y pueden acceder a páginas públicas. |
| Analítica | `scripts/weekly-analytics-report.mjs` | Nuevo bloque «Descubrimiento orgánico y por IA»: referrers conocidos por host, comparación semanal, landings SEO e intentos desde páginas SEO. Explica que no hay cruce confiable fuente × landing × evento; no altera la instrumentación ni los eventos existentes. |
| QA | `scripts/qa-built-seo.mjs`, `scripts/qa-preview-base.mjs`, `tests/weekly-analytics-report.test.mjs` | Comprueba ruta, sitemap, canonical, metadata, H1, enlaces, JSON-LD válido, robots, BASE_PATH/noindex y clasificación conservadora de referrer. |

El sitemap se genera desde las rutas Astro; la landing entra automáticamente. El total esperado pasa de 29 a 30 URLs. Las diez fichas SEO y las 52 tarjetas HTML de categoría permanecen. Las vistas de categorías pueden actualizar con Firebase; el HTML inicial ya contiene el catálogo, por lo que las fichas no dependen de ejecutar JavaScript para ser leídas.

## Riesgos y límites

- El nuevo contenido describe únicamente consulta online. Confirmar con Lucía la modalidad exacta por tipo de trabajo antes de ampliar afirmaciones.
- El robots.txt nuevo expresa preferencias a bots identificados, pero no impide acceso mediante un user-agent falso ni equivale a una política completa para todos los proveedores de IA. `Google-Extended` combina usos de Gemini y entrenamiento según su documentación; cambiarlo requiere una decisión expresa que valore ambos efectos.
- GitHub Pages no permite configurar `X-Robots-Tag` o redirecciones HTTP desde este repositorio. `/admin/` sigue disponible y bloqueado por robots, pero su HTML no declara `noindex`; no se tocó el administrador.
- Los referrers pueden faltar o venir de un intermediario. El informe presenta las landing pages y salidas desde páginas SEO para todas las fuentes, sin atribuir las salidas al origen de entrada. Mensajes recibidos y ventas se registran aparte de Umami.
- Un build local no prueba indexación, resultados de IA, entrega de WhatsApp/Formspree, WebView ni rendimiento de campo.

## Comprobaciones

Resultados locales del 11 de noviembre de 2026:

- `npm ci`: completado; el Node predeterminado 22.13.1 produjo avisos `EBADENGINE`, por lo que build y QA se ejecutaron con Node 22.19.0 mediante `npx -p node@22.19.0`.
- `npm test`: 59/59; `npm run build`: 30 páginas; `npm run test:build`: 30 URLs únicas y contrato de 52 servicios.
- Build con `BASE_PATH=previews/pr-999` y `scripts/qa-preview-base.mjs`: pasó, incluida la landing con enlaces locales y `noindex`.
- `scripts/qa-current-public.mjs`: 35 rutas HTTP y 130 combinaciones de ruta/ancho en Chrome headless; formulario, flujo guiado, categoría y vista de login del admin pasaron. `scripts/qa-copy.mjs`: 72 combinaciones en 320–1440 px, sin overflow ni CTA partidos tras acortar la etiqueta del CTA local. `scripts/qa-cristal-2.mjs`: pasó flujos de biblioteca, WhatsApp, eventos y fallback sin JS.
- `git diff --check`: pasó. `src/data/generated/services.public.json` no tiene diff; el build leyó 52 servicios desde Firestore y confirmó el copy aprobado sin escribir datos remotos.

Estas son pruebas locales de Chrome y HTML. No verifican Safari, Instagram WebView, producción posterior a 3.1, Search Console, Bing, recepción de mensajes ni ventas. `npm ci` informó tres avisos de vulnerabilidades altas en dependencias; su remediación requiere revisión separada para no ampliar el alcance de 3.1.

## Auditoría final separada

Tras terminar la implementación, se revisó el diff frente a `origin/main` por rutas y contratos: no se cambiaron `src/data/approved-copy.public.json`, `src/data/generated/services.public.json`, `src/data/books.ts`, `public/admin/`, `admin/`, credenciales, Formspree ni el código de eventos en el navegador. La nueva página tiene un H1, canonical propio, texto visible sin JS, enlaces a las cinco categorías, guías y formulario, y CTA guiado existente. El sitemap contiene exactamente las 30 rutas públicas esperadas, sin admin, previews ni `.html`; el build con `BASE_PATH` conserva `noindex`. El JSON-LD parsea y carece de dirección, horario, reseñas y calificaciones. La revisión no detectó un bloqueo de lanzamiento local; los resultados de producción y buscadores siguen siendo pendientes externos.
