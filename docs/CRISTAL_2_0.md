# Cristal Sagrado 2.0 — decisión y avance

## Alcance técnico

Rama `feat/cristal-sagrado-2-0`, basada en `main` actualizado el 29/10/2026. Se conservan Astro estático, el panel Firebase, Formspree y las URL públicas. El flujo espiritual sigue exigiendo una descripción. Las fichas de los tres libros muestran «Próximamente» sin enlaces de pago, descarga, consulta ni vista previa hasta contar con material autorizado. No se incorporan CMS, pagos ni archivos privados.

## Criterios verificables

1. Un CTA espiritual abre el diálogo con contexto; sin JavaScript conduce al formulario existente, que exige consulta y medio de respuesta.
2. Umami mide apertura, cancelación, error de validación, caso válido y salida intentada. Ningún evento confirma envío o venta.
3. `/libros/` y las tres fichas se generan con datos tipados y estado «Próximamente». Disponibilidad, formatos, vista previa y precio permanecen sin confirmar.
4. El informe semanal separa el embudo espiritual del interés editorial y declara denominadores de eventos agregados.
5. `npm test`, `npm run build`, `npm run test:build`, `git diff --check` y QA de rutas locales deben pasar antes del PR.

## Material pendiente

No se encontraron manuscritos ni portadas oficiales en este repositorio. Para activar descarga o venta se requiere versión final aprobada, permiso explícito de publicación, portada oficial con derechos claros, sinopsis aprobada, formatos, precio y condiciones comerciales. Los PDF pagos no deben subirse a `public/`.

## Alta de un cuarto libro

1. Agregar un objeto a `src/data/books.ts` con `id` y `slug` únicos, título, subtítulo, autora y `status`. No hace falta modificar componentes ni rutas.
2. Usar `draft` para un título no anunciado; `upcoming` para una ficha pública «Próximamente»; `available` únicamente con disponibilidad confirmada. Mantener `formats: []`, `distribution: "none"`, `publicInquiry: false` y sin `price` cuando falte confirmación.
3. Una portada oficial autorizada se coloca en `public/` y se referencia con `cover`. La sinopsis y `highlights` deben ser textos aprobados. Para una muestra gratuita autorizada, configurar `sampleUrl`. Para un archivo completo gratuito autorizado, usar `status: "available"`, `distribution: "free"` y `purchaseUrl` a ese archivo. Para un libro pago, usar `distribution: "manual"` con `publicInquiry: true` o `external` y `purchaseUrl` a un proveedor real; nunca colocar un PDF pago en `public/`.
4. Añadir el slug al conjunto esperado de `scripts/qa-built-seo.mjs` y a la lista permitida de `assets/js/analytics.js`. Ejecutar `npm test`, `npm run build` y `npm run test:build`. Las acciones comerciales y la muestra se muestran solo al pasar a `available` con enlaces aprobados.

## Operación y reversión

El sitio se publica con el workflow existente de GitHub Pages tras revisión y merge autorizado. Antes de desplegar, verificar el diff del PR, `npm test`, `npm run build`, `npm run test:build`, QA visual y `git diff --check`. El workflow compila y despliega `dist/`; no se requieren migraciones. Para revertir, revertir el commit o merge en `main` mediante un PR y dejar que Pages publique la compilación anterior. La reversión del código no borra eventos ya registrados en Umami. Registrar la fecha de despliegue al comparar períodos antes y después.

## Límites de evidencia

La QA local usa Chrome headless y un preview estático. No demuestra entrega real de mensajes, compatibilidad con Instagram WebView o Safari iOS, recepción Formspree, Umami de producción ni Resend. Los eventos históricos siguen con su significado original; no se atribuye un aumento de conversión hasta observar datos posteriores.

## Verificación local

- `npm test`: 47 pruebas aprobadas.
- `npm run build`: 29 páginas estáticas generadas; el build sincronizó 52 servicios públicos desde Firestore.
- `npm run test:build`: 29 URLs únicas, servicios y guías sin regresiones detectadas.
- `node scripts/qa-cristal-2.mjs`: Chrome headless en 320, 390 y 1440 px para Home, Libros, las tres fichas y Magia Blanca. Se verificaron H1, ausencia de desborde horizontal, navegación, fichas «Próximamente» sin acciones de pago/descarga/consulta, formulario espiritual, eventos sin texto privado y fallback sin JavaScript. Con `wa.me` bloqueado se comprobó que el diálogo vuelve a abrirse tras el temporizador y tras recuperar el foco, sin duplicar el envío; `keyboard-open` se limpia al cerrar.
- `git diff --check`: sin errores.

La prueba de navegador bloquea `wa.me` para evitar salir del entorno. Ninguna consulta se envió realmente.
