# Performance audit — FASE 4A / 4B inicial

Fecha: 2026-06-20.

## Alcance

Auditoría estática de assets dentro de `images/`, `assets/`, `css/` y `js/`, con foco en peso inicial, video de fondo, comprimidos dentro del deploy y referencias públicas. No se tocó Firebase, Firestore, `/admin` ni el modelo de datos.

## Inventario ordenado por peso

| Peso aprox. | Archivo | Tipo | Estado |
|---:|---|---|---|
| 21 MB | `images/Eclipse_small.mp4` | video | Referenciado como video de fondo diferido |
| 22 KB | `css/styles.css` | CSS | Referenciado por home, magia roja, tarot, FAQ y cómo trabajamos |
| 16 KB | `css/magia_negra.css` | CSS | Referenciado por magia negra |
| 16 KB | `css/magia_verde.css` | CSS | Referenciado por magia verde |
| 16 KB | `css/magia_blanca.css` | CSS | Referenciado por magia blanca |
| 9 KB | `assets/js/data.js` | JS público Firestore | Referenciado solo por páginas de categorías |
| 5 KB | `css/base.css` | CSS | Referenciado por páginas públicas |
| 4 KB | `assets/js/service-helpers.js` | JS helper público | Importado por `assets/js/data.js` y tests/helpers |
| 3 KB | `css/components.css` | CSS | Referenciado por páginas públicas |
| 721 B | `images/video-poster.svg` | poster/fallback | Referenciado por HTML y CSS |

## Assets especialmente pesados

- `images/Eclipse_small.mp4` pesa ~21 MB. Sigue siendo el principal riesgo de transferencia, pero ahora no se inserta como `<source>` inicial, conserva `preload="none"` y se carga en idle solo en contextos permitidos.
- Los comprimidos `images/Eclipse_small.7z` (~20 MB) e `images/favicon_io.zip` (~212 KB) estaban dentro del árbol público y no tenían referencias públicas funcionales. Se eliminaron para evitar deploy innecesario.

## Referencias estáticas detectadas

### Referenciados

- `images/Eclipse_small.mp4`: referenciado como `data-src` en `index.html`, `magia-blanca.html`, `magia-roja.html`, `magia-negra.html`, `magia-verde.html`, `tarot.html`, `faq.html` y `como-trabajamos.html`.
- `images/video-poster.svg`: referenciado como `poster` del video y como background CSS de fallback.
- `assets/js/data.js`: referenciado por las páginas de categorías (`magia-*.html`) que cargan servicios desde Firestore.
- `assets/js/service-helpers.js`: importado por `assets/js/data.js` y cubierto por tests.
- CSS público: `css/styles.css`, `css/base.css`, `css/components.css` y estilos específicos por categoría están referenciados por HTML público.

### Aparentemente no referenciados

No quedan archivos no referenciados dentro de `images/`, `assets/`, `css/` o `js/` después de la limpieza de comprimidos. Los archivos de favicon viven en `favicon_io/`, fuera del alcance principal de esta auditoría, y siguen referenciados desde HTML.

### Comprimidos removidos

- Eliminado `images/Eclipse_small.7z`: archivo comprimido pesado, sin referencia pública necesaria y duplicado conceptual del video final.
- Eliminado `images/favicon_io.zip`: paquete fuente de favicons, sin referencia pública necesaria. Los favicons extraídos en `favicon_io/` se conservaron.

### Videos pesados

- `images/Eclipse_small.mp4` queda como candidato a una optimización futura real: recomprimir a MP4 más liviano, generar WebM y/o crear variantes responsive. No se generaron assets nuevos porque no hay tooling de media confiable definido en el repo.

### Potenciales duplicados

- `images/Eclipse_small.7z` era duplicado comprimido del video y fue removido.
- `favicon_io.zip` era duplicado empaquetado de los favicons ya extraídos y fue removido.

## Estrategia implementada para el video de fondo

- El HTML mantiene `preload="none"`, `muted`, `loop`, `playsinline`, `poster` y `data-src` sin `<source>` inicial.
- `scripts/perf-media.js` inserta el `<source>` solo después del primer render, usando `requestIdleCallback` con fallback a `setTimeout`.
- El video no se carga cuando se detecta:
  - `prefers-reduced-motion: reduce`.
  - `prefers-reduced-data: reduce`.
  - pantalla mobile hasta `767px`.
  - `navigator.connection.saveData` cuando está disponible.
- En esos casos se desactiva autoplay y queda visible el fallback estático.
- CSS agrega un fondo mínimo, mobile-first, con poster SVG, gradiente y color base para evitar pantalla vacía o layout shift.

## Decisiones tomadas

- No se cambió el diseño principal ni la estructura comercial.
- No se tocaron rutas públicas.
- No se modificó Firebase, Firestore, helpers admin ni modelo de datos.
- No se agregaron dependencias npm ni tooling de media.
- Se priorizó una mejora segura de carga inicial sobre recomprimir video sin pipeline confiable.

## Riesgos pendientes

- En desktop, el video de 21 MB todavía puede descargarse después de idle. Conviene generar una versión corta y comprimida.
- Falta QA visual real en navegador/Lighthouse si el entorno no expone navegador gráfico.
- El SVG poster es liviano pero temporal; conviene crear `images/eclipse-poster.webp` con estética real del video.
- Hay duplicación de reglas CSS de video/fallback entre hojas existentes; se dejó sin refactor masivo por restricción de alcance.

## Siguiente patch recomendado

1. Generar manualmente `images/eclipse-poster.webp` y variantes optimizadas del video (`.webm` + `.mp4` comprimido) fuera del repo o con tooling acordado.
2. Medir Lighthouse mobile/desktop y Network con throttling.
3. Consolidar gradualmente reglas repetidas de video/fallback en una hoja compartida cuando se habilite refactor CSS.
