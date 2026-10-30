# Cristal Sagrado 2.0 — estado del PR #13

## Experiencia editorial

`/libros/` presenta tres libros de Lucía Mayada con portada, categoría, sinopsis breve y acceso a su ficha. Cada ficha muestra temas, contenido, títulos de índice verificados en las muestras y un PDF gratuito de cuatro páginas. Los tres conservan el estado **PRÓXIMAMENTE** y explican que la edición completa está en preparación. El enlace «Consultar novedades por WhatsApp» identifica el libro elegido; no solicita una situación espiritual. `book_view`, `book_sample_download` y `book_interest_wa` son eventos editoriales separados del embudo espiritual. Los clics no demuestran lectura, entrega de mensajes ni compra.

Las portadas usadas son `public/images/libros/{habitar-lo-posible,brujeria-para-principiantes,el-umbral-de-cristal}-portada.webp`. Las únicas muestras públicas son `public/muestras/{habitar-lo-posible,brujeria-para-principiantes,el-umbral-de-cristal}-muestra.pdf`. `docs/editorial/manifest.json` registra los nombres y tamaños esperados; `README_ASSETS.md` describe el origen y la selección de páginas; `DESCRIPCIONES_PROPUESTAS.md` contiene el texto editorial de partida. Estos materiales están preparados para revisión, pero la aprobación final de portadas, selección de páginas y textos corresponde a la autora antes de fusionar o publicar.

No hay fecha, precio, formato comercial, checkout ni descarga de libros completos. Los PDF privados quedan fuera del repositorio. El índice de *El Umbral de Cristal* se muestra sin números de página porque el original usa guiones.

## Alta o cambio de un libro

1. Agregar un objeto a `src/data/books.ts` con `id` y `slug` únicos, título, subtítulo, autora, `primaryCategory`, `topics`, `shortSynopsis`, sinopsis y contenido verificados. Los componentes y la ruta dinámica aceptan nuevos libros sin cambios de diseño.
2. Usar `draft` para un título no anunciado, `upcoming` para una ficha pública, y `available` solo cuando se confirme la disponibilidad individual. En `upcoming`, dejar `formats: []`, `distribution: "none"`, sin precio ni `purchaseUrl`. Una muestra autorizada puede configurarse mediante `sampleUrl` sin cambiar el estado.
3. Colocar únicamente portada y muestra autorizadas bajo `public/`, con nombres claros. Actualizar `docs/editorial/manifest.json`, las expectativas de `scripts/qa-built-seo.mjs` y los slugs permitidos por `assets/js/analytics.js`. Verificar el índice contra la muestra; no inferir páginas ausentes.
4. Para habilitar un libro en particular, confirmar con la autora edición final, derechos de portada, sinopsis, formatos, precio, condiciones y canal de entrega. Cambiar solo ese objeto a `status: "available"` y completar su distribución. Los demás siguen en `upcoming`.
5. Para un proveedor de pagos futuro, elegir y contratar el proveedor antes de agregar su URL real como `purchaseUrl` con `distribution: "external"`. Confirmar cómo entrega el archivo y cómo maneja pagos y reembolsos. El sitio solo enlaza al checkout aprobado; ningún PDF pago se coloca en `public/`. `distribution: "free"` sirve para un archivo completo gratuito con permiso explícito. No activar compras con enlaces de prueba o inventados.

## Control de archivos y QA

Antes de cada commit o despliegue, revisar `git status` y `git diff --stat` para detectar archivos privados. Mantener los originales fuera del repositorio y verificar que `public/` y `dist/` solo contengan las tres muestras limitadas anunciadas. Las pruebas comprueban nombres, firmas, tamaños, cuatro páginas y enlaces. La inspección con lector PDF y revisión visual confirma legibilidad y selección de páginas. Los PDF actuales pesan aproximadamente 2,7 MB, 4,7 MB y 0,8 MB.

Ejecutar `npm test`, `npm run build`, `npm run test:build`, `git diff --check` y `node scripts/qa-cristal-2.mjs` con Chrome headless y Astro preview local. El QA de navegador cubre Home, catálogo y las tres fichas a 320, 390 y 1440 px; comprueba las rutas de muestras, eventos y ausencia de compras. Para las rutas de preview de GitHub Pages, compilar con `BASE_PATH=previews/pr-13` y ejecutar `node scripts/qa-preview-base.mjs`. El workflow de preview hace esta comprobación automáticamente.

El flujo espiritual conserva la descripción obligatoria y el fallback sin JavaScript. Cuando WhatsApp no abre, `sending` se restablece tras recuperar foco o por tiempo para permitir otro intento; al cerrar el diálogo se limpia `keyboard-open`. El QA bloquea `wa.me` y verifica estos casos sin enviar consultas reales.

La QA local con Chrome y HTTP no demuestra comportamiento de Safari iOS, Android físico o Instagram WebView, ni recepción de WhatsApp, Formspree o Umami en producción. El PR requiere revisión editorial y aprobación de los materiales antes de merge o despliegue a producción. Para revertir luego de un despliegue aprobado, revertir el cambio en `main` mediante un PR; eso no borra eventos históricos de Umami.
