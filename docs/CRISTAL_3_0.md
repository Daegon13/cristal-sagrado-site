# Cristal Sagrado 3.0 — auditoría y diseño

## Estado inicial (10 de noviembre de 2026)

`main` y `origin/main` están en `44e9094`; la rama 2.0 (`c2b8df8`) está integrada. Árbol limpio antes de crear `feat/cristal-sagrado-3-0`. La Home, categorías, diez fichas SEO, guías y tres libros se construyen con Astro 7. La biblioteca mantiene sus muestras y eventos propios. `/admin/` es una aplicación Firebase independiente.

## Arquitectura reutilizable y fuentes

- `WhatsAppCTA`, `Hero`, `IntentCards`, `ServiceGrid`, `ServiceCategory` y `assets/js/whatsapp-contact.js` ya centralizan navegación y consulta. El diálogo actual valida una descripción antes de construir `wa.me`; `#formulario` es el fallback sin JavaScript.
- Firestore `services` es la fuente operativa del catálogo. `scripts/sync-public-services.mjs` crea `services.public.json` para HTML estático y fichas SEO; las categorías actualizan desde Firestore en el navegador. `seo-services.js` y `seo-guides.js` contienen contexto editorial, sin precios propios. Un precio de la snapshot puede quedar desactualizado respecto de Firestore: la publicación debe revisar el diff del snapshot y confirmar vigencia con Lucía.
- `assets/js/analytics.js`, el filtro `before-send` de `BaseLayout` y `scripts/weekly-analytics-report.mjs` forman el contrato de medición. `wa_outbound` mide un intento, jamás recepción o venta. `campaign-link.mjs` ya restringe rutas y etiquetas de Instagram.
- Formspree, `public/admin/`, rutas históricas, tres libros y PDFs quedan fuera de las modificaciones comerciales.

## Problemas concretos

1. La validación obligatoria agrega fricción a quien ya eligió un servicio.
2. La Home ubica libros antes del catálogo y no nombra los dos recorridos.
3. Las fichas SEO repiten la descripción del flujo antiguo; los campos de proceso y duración no existen para cada servicio en el modelo público.
4. El reporte divide el total de salidas por casos válidos: con salidas directas, ese cociente pierde sentido.
5. Los UTM se pierden al seguir enlaces internos sin parámetros. Umami tampoco confirma mensajes recibidos ni ventas.
6. El snapshot contiene descripciones extensas con afirmaciones no verificadas de resultados. No se cambiará contenido comercial sin revisión de Lucía.

## Plan y criterios de aceptación

1. Mostrar las dos rutas en Home: catálogo para personas decididas, tarjetas de intención y diálogo breve para orientación. Dejar libros tras el contenido comercial.
2. Crear un enlace directo `wa.me` solo para servicios con nombre publicado, reutilizando el número existente y un mensaje neutro. Mantener el diálogo y Formspree para orientación. El enlace directo debe funcionar sin JavaScript; el guiado cae al formulario.
3. Actualizar fichas y guías ya existentes, con precios únicamente desde la snapshot y una aclaración de confirmación. No inventar plazos ni informes individuales.
4. Añadir eventos de salida por ruta sin cambiar `wa_open`, `wa_case_valid`, `service_wa` ni el evento global. Recalcular el informe con denominadores separados y etiquetas de intento.
5. Conservar UTM estándar, acotados y solo para navegación interna durante la sesión. Documentar enlaces de campaña a rutas existentes. Preparar un registro comercial local y agregado, ajeno a Umami.
6. Verificar tests, build, BASE_PATH, QA de Chrome si está disponible, accesibilidad básica, privacidad y diff. Revisar separadamente la implementación antes de abrir PR.

## Riesgos y límites

- Los enlaces directos no demuestran mensaje entregado. Los navegadores pueden bloquear WhatsApp o no tener la app; el enlace HTTPS permite reintento.
- La snapshot de build puede quedar rezagada de Firestore; la vista de categoría usa datos vivos cuando están disponibles. Precios y denominaciones requieren revisión comercial antes de publicar.
- Chrome headless no prueba Safari iOS, Instagram WebView ni dispositivos físicos. No habrá pruebas con mensajes reales.
- Revertir mediante un PR que revierta los commits de 3.0 en `main`. Los eventos ya recogidos en Umami no se borran; anotar la fecha de publicación para separar series históricas.

## Decisiones comerciales pendientes

- Confirmar con Lucía nombres, precios y vigencia de los servicios del inventario en `docs/REVISION_COMERCIAL_3_0.md`, en especial si «Retorno de pareja» corresponde o no a algún servicio publicado.
- Confirmar duración, modalidad, materiales, informe/registro entregable y condiciones por servicio; no hay base suficiente para mostrarlos como hechos individuales.
- Revisar y aprobar el lenguaje de resultados en las descripciones de Firestore y sus copias públicas. Cualquier corrección comercial requiere intervención en la fuente autorizada y nueva sincronización.

## Auditoría de implementación y revisión

| Requisito | Estado | Evidencia o límite |
| --- | --- | --- |
| Dos recorridos en Home y prioridad del catálogo | IMPLEMENTADO | Enlaces a `#servicios` y `#orientacion`; biblioteca tras contenido comercial. |
| WhatsApp directo para servicio publicado | IMPLEMENTADO | Enlace HTML `wa.me` desde categoría y ficha SEO; nombre incluido; sin JavaScript. |
| Orientación y Formspree | EXISTENTE | Diálogo validado, foco, Escape, recuperación y fallback a `#formulario`; formulario alternativo intacto. |
| Fichas, precio y proceso individual | PENDIENTE | Estructura y contexto mejorados; precio solo desde snapshot. Duración, informe y condiciones por servicio esperan confirmación de Lucía. |
| Tres temas SEO | EXISTENTE | Guías de pareja y limpieza, página Tarot y diez fichas con metadata/canonical. No se crearon páginas duplicadas. |
| UTM Instagram | IMPLEMENTADO | Generador existente, ejemplos y propagación interna limitada. |
| Embudos separados e histórico | IMPLEMENTADO | Dos eventos nuevos; `wa_outbound` global; denominador guiado separado y comparación marcada cuando cambia la definición. |
| Ventas e importe cobrado | PENDIENTE | Plantilla local y resumen; los datos reales requieren registro privado de Lucía. |
| Biblioteca y admin | EXISTENTE | Tres libros y muestras; `/admin/` intacto. |
| Safari iOS e Instagram WebView | BLOQUEADO | Requiere prueba en dispositivos reales después de disponer de la preview; Chrome headless no sustituye esa evidencia. |

La revisión separada comprobó que `public/admin/`, `admin/`, credenciales, PDF y datos editoriales no se modificaron. La salida directa emite un solo par de eventos de ruta/global por clic aceptado, y no `wa_case_valid`. El reporte distingue clic de CTA, intento de salida, mensaje recibido y venta; solo los dos primeros se observan con Umami. El cociente por página usa pageviews de esa página y no afirma atribución individual desde la landing de entrada. La snapshot de 52 servicios se sincronizó sin cambios en Git; el inventario y los precios para revisión están en `REVISION_COMERCIAL_3_0.md`.

La QA local debe ejecutar `npm ci`, `npm test`, `npm run build`, `npm run test:build`, `git diff --check` y, con preview/Chrome local, `node scripts/qa-cristal-2.mjs` y `node scripts/qa-copy.mjs`. Para BASE_PATH: definir `BASE_PATH=previews/cristal-3`, compilar y correr `node scripts/qa-preview-base.mjs`. Los scripts históricos `qa-mobile.mjs` y `qa-header.mjs` aún comprueban un menú hamburguesa y la prohibición de enlaces directos de una arquitectura anterior; no son gates de 3.0.

Tras publicar con aprobación, medir durante cuatro semanas: visitantes y origen, entradas a guías/fichas, aperturas guiadas, casos válidos guiados, intentos directos y guiados, intentos totales por visitante, servicio/CTA/página/campaña, y contrastar cada semana con consultas recibidas, ventas e importes anotados manualmente. Comparar conteos y ratios con volumen y fecha de despliegue visibles; no inferir efecto causal ni equiparar un intento a una conversación.
