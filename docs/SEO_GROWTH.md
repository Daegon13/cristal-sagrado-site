# Crecimiento orgánico: primera ola

## Fuente y auditoría

Firestore (`services`) sigue siendo la fuente de verdad. `npm run build` ejecuta `sync:services`, consulta documentos activos y guarda la snapshot pública en `src/data/generated/services.public.json`. Si Firestore no responde, el build usa la snapshot válida existente y avisa. Antes de publicar, revisá cualquier cambio en esa snapshot. El catálogo auditado el 8 de octubre de 2026 tenía **52 servicios activos**: 20 de magia blanca, 18 de roja, 9 de verde y 5 de negra. Los 52 tenían `featured: false`, `intent: []`, `idealFor: []` y `benefits: []`; todos tenían descripción, precio y duración. `node scripts/seo-service-audit.mjs` produce una tabla completa con `name`, `slug`, `category`, `featured`, `intent`, `description`, `price`, `duration`, `idealFor` y `benefits` desde la snapshot.

La primera ola selecciona **10 servicios** por intención de consulta, nombre plausible de búsqueda, descripción disponible y diferencia frente a otros trabajos. La selección es explícita en `src/data/seo-services.js`. Un servicio nuevo o inactivo no crea una URL. Se evita el par casi duplicado Abrecaminos Verde / Ritual de Apertura de Caminos. No hay un servicio llamado «retorno de pareja» en la snapshot: la guía de reencuentro enlaza Encuentro & Reencuentro. Tarot existe como página del sitio, pero no como servicio de esta snapshot.

| Servicio real | Categoría | Intención y motivo | URL |
| --- | --- | --- | --- |
| Amarre de Amor Total – Alma y Cuerpo | Roja | Unión afectiva; nombre de búsqueda reconocible | `/magia-roja/amarre-de-amor-total-alma-y-cuerpo/` |
| Endulzamiento Fuerte | Roja | Distancia en el trato; distinto del amarre | `/magia-roja/endulzamiento-fuerte/` |
| Encuentro & Reencuentro | Verde | Distancia o conversación pendiente | `/magia-verde/encuentro-reencuentro/` |
| Armonización de Pareja | Verde | Tensión y comunicación en un vínculo existente | `/magia-verde/armonizacion-de-pareja/` |
| Cierre de Ciclo Amoroso | Verde | Cierre de relación, distinto del reencuentro | `/magia-verde/cierre-de-ciclo-amoroso/` |
| Limpieza Energética Personal | Verde | Consulta de limpieza personal | `/magia-verde/limpieza-energetica-personal/` |
| Protección del Aura (Sellado) | Verde | Protección personal, distinta de limpieza y hogar | `/magia-verde/proteccion-del-aura-sellado/` |
| Protección del Hogar | Blanca | Protección de un espacio concreto | `/magia-blanca/proteccion-del-hogar/` |
| Ritual de Apertura de Caminos | Blanca | Proyectos o cambios estancados | `/magia-blanca/ritual-de-apertura-de-caminos/` |
| Trabajo de Prosperidad | Blanca | Proyectos y prosperidad espiritual | `/magia-blanca/trabajo-de-prosperidad/` |

Las fichas originales contienen afirmaciones de efectos que no se pueden verificar. Las landings usan una descripción editorial completa de la **consulta y el enfoque**, construida desde la intención de cada ficha, sin repetir esas afirmaciones como hechos. Precio y duración salen de la snapshot; la duración no se presenta como plazo de resultados. `idealFor` y `benefits` aparecen solo si llegan con datos; hoy están vacíos.

## Páginas, enlaces y metadata

`src/pages/[category]/[slug]/index.astro` usa `getStaticPaths()` y solo los IDs de la allowlist. `SeoServicePage.astro` incluye breadcrumbs HTML y BreadcrumbList JSON-LD, título, descripción, situaciones de consulta, datos publicados, proceso de contacto, FAQ, CTA y hasta tres servicios relacionados de la misma categoría cuando es posible. La categoría y el slug vienen del servicio real.

| Guía | Intención informativa | Ruta |
| --- | --- | --- |
| Amarre y endulzamiento | Diferencia de consultas | `/guias/amarre-vs-endulzamiento/` |
| Reencuentro de pareja | Distancia o silencio | `/guias/reencuentro-de-pareja/` |
| Limpieza energética personal | Cuándo se consulta | `/guias/limpieza-energetica-personal/` |
| Trabajos de magia roja | Mapa de consultas afectivas | `/guias/trabajos-de-magia-roja/` |
| Qué trabajo consultar | Orientación si no se conoce el nombre | `/guias/que-trabajo-consultar/` |
| Protección personal y hogar | Diferencia entre dos propuestas | `/guias/proteccion-energetica-personal-y-hogar/` |

El Footer enlaza `/guias/`; el hub enlaza las seis guías; cada guía enlaza landings reales y una categoría; cada categoría enlaza la landing de cada servicio seleccionado sin quitar el CTA directo a WhatsApp; cada landing vuelve a su categoría y enlaza trabajos relacionados. Así ninguna página de la ola queda huérfana. Las rutas son estáticas y no añaden un framework cliente.

Cada landing y guía tiene `title` y `description` editoriales únicos, canonical de producción y etiquetas Open Graph de `BaseLayout.astro`. El sitemap incorpora la allowlist y las guías, sin servicios fuera de la selección ni `/admin/`. En previews con `BASE_PATH`, el layout emite `noindex`.

## Medición y validación

El tracker público conserva `wa_open`, `wa_case_valid`, `wa_outbound`, `nav_cta`, `service_wa` e `intent_click`. La landing usa `cta_location=seo_service_page`; la guía usa `cta_location=seo_guide`. Los enlaces de guía a servicio y categoría a landing usan `nav_cta`. `service` y `category` se envían cuando los permite la capa actual; el slug de guía se obtiene del path, sin crear un evento nuevo. No se envía texto del caso, nombre, teléfono ni correo. **`wa_outbound` es un lead web WhatsApp, no una venta.** El reporte semanal existente no se modifica; sus agregados no sustituyen un desglose por página.

Revisar por landing: visitantes, `wa_open`, `wa_case_valid`, `wa_outbound` y `wa_outbound / visitors`. Por campaña: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`. Por guía: entradas, `nav_cta` hacia servicio (`cta_location=seo_guide_service`) y `wa_outbound`. Son objetivos de análisis que dependen de tráfico real y Umami real.

Ejecutar `npm test`, `npm run build`, `npm run test:build` y `git diff --check`. El QA de build comprueba HTML local, canonical, metadata, H1, breadcrumb, CTA, enlaces y sitemap. Un archivo generado confirma una ruta local; no confirma un HTTP 200 en producción ni indexación.

## Search Console: después del deploy

1. Verificar la propiedad de dominio `cristal-sagrado.com` por DNS si todavía no está verificada.
2. Enviar `https://cristal-sagrado.com/sitemap.xml` actualizado.
3. Inspeccionar las diez landings y `/guias/`; solicitar indexación de las diez landings principales.
4. Revisar semanalmente consultas, impresiones, clics, CTR y posición media. Mejorar contenido según consultas reales; el sitemap no garantiza indexación.

## Agregar contenido futuro

Para una landing: confirmar que el servicio está activo y tiene contenido suficiente; agregar **su ID real** y texto editorial único a `src/data/seo-services.js`; revisar diferencias con otras landings, precio, duración, CTA y enlaces; ejecutar pruebas y revisar sitemap. Para una guía: agregar una entrada a `src/data/seo-guides.js` con respuesta directa, secciones y slugs de servicios ya seleccionados; verificar hub, enlaces y sitemap. No ampliar la allowlist por sincronizar Firestore sin revisión editorial.
