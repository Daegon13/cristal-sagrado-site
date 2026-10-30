# Cristal Sagrado - Paquete de previsualización para Codex

Estos archivos son material editorial PREPARADO para revisión, no prueba de autorización de publicación. La autora debe aprobar portadas, textos y muestras antes de hacer merge/desplegar.

## Usar en el repositorio

- Copiar las carpetas `public/images/libros/` y `public/muestras/` dentro de `cristal-sagrado-site/`.
- NO copiar los PDF originales/completos a `public/`, `src/`, `assets/` ni a ningún lugar dentro del repositorio público.
- El PDF de muestra contiene únicamente cuatro páginas seleccionadas del original, no todas las páginas del libro.
- Usar `cover: "images/libros/<slug>-portada.webp"` y `sampleUrl: "/muestras/<slug>-muestra.pdf"` en `src/data/books.ts`; revisar cómo se normalizan rutas `BASE_URL` en previews antes de finalizar.
- No asignar `status: "available"`, precio ni URL de compra hasta aprobar pasarela de pagos y la distribución.
- El evento de descarga de muestra es un clic de descarga intentada, no una lectura confirmada.

## Selección de páginas

- Habitar lo posible (176 páginas): 1 (cubierta), 6-7 (índice), 10 (introducción). Se excluye la dedicatoria personal.
- Brujería para principiantes (225 páginas; versión cubierta bordó): 1 (cubierta), 6-7 (índice), 8 (Antes de empezar). Se excluye la dedicatoria personal.
- El Umbral de Cristal (52 páginas): 1 (cubierta), 2 (portadilla), 3 (carta de bienvenida), 5 (índice). Los números del índice editorial original aún figuran con guiones; no inventar paginación.

## Gestión editorial

- La versión de Brujería para principiantes con portada bordó contiene 225 páginas, mientras que la edición pergamino tiene 274; confirmar cuál es la versión definitiva antes de comercializar. La cubierta bordó se extrajo de la edición de 225 páginas.
- Habitar lo posible incluye algunos marcadores de extracción `QQ...` en su texto interno; comprobar visualmente todas las páginas relevantes y revisar la versión maestra antes de darla por publicada.
- El Umbral de Cristal tiene una cubierta que fue recortada únicamente para eliminar el margen blanco del PDF; el diseño central no fue modificado.
- Si el libro aún no se encuentra disponible, etiqueta visible "Próximamente" y CTA "Quiero recibir novedades" o "Consultar disponibilidad", sin simular un checkout.
