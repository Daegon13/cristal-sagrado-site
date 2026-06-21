# Plan exploratorio de migración progresiva a Astro — Cristal Sagrado

> Estado: documentación exploratoria. No crea scaffold Astro, no cambia HTML/CSS/JS legacy, no toca Firebase/Admin y no modifica producción.

## 1. Diagnóstico de migrabilidad

### 1.1 Páginas públicas detectadas

| Ruta legacy | Tipo | Firestore | Observaciones de migración |
|---|---|---:|---|
| `/` / `index.html` | Home comercial | No | Alta prioridad para Astro porque concentra conversión, SEO, formulario, CTAs e historial de regresiones visuales por layout/fondo/video. |
| `/magia-blanca.html` | Categoría de servicios | Sí | Requiere isla/script cliente para render de servicios desde Firestore categoría `blanca`. |
| `/magia-roja.html` | Categoría de servicios | Sí | Requiere isla/script cliente para render de servicios desde Firestore categoría `roja`. |
| `/magia-negra.html` | Categoría de servicios | Sí | Requiere isla/script cliente para render de servicios desde Firestore categoría `negra`. |
| `/magia-verde.html` | Categoría de servicios | Sí | Requiere isla/script cliente para render de servicios desde Firestore categoría `verde`. |
| `/tarot.html` | Informativa / conversión | No | Buena candidata para migración estática temprana; no debe cargar Firebase. |
| `/faq.html` | FAQ | No | Buena candidata para contenido estático con JSON-LD preservado. |
| `/como-trabajamos.html` | Informativa | No | Buena candidata para contenido estático y componentes de proceso/confianza. |
| `/servicios.html` | Redirección heredada | No | Debe conservarse como puente o redirect hacia `/#servicios` o una ruta equivalente. |

`/admin/index.html` no se considera página pública para esta fase: debe conservarse intacto inicialmente.

### 1.2 CSS cargado por página pública

| Página | CSS actual |
|---|---|
| `index.html` | `css/styles.css`, `/css/base.css`, `/css/components.css`, Google Fonts. |
| `magia-blanca.html` | `css/magia_blanca.css`, `/css/base.css`, `/css/components.css`, Google Fonts. |
| `magia-roja.html` | `css/styles.css`, `/css/base.css`, `/css/components.css`, Google Fonts. |
| `magia-negra.html` | `css/magia_negra.css`, `/css/base.css`, `/css/components.css`, Google Fonts. |
| `magia-verde.html` | `css/magia_verde.css`, `/css/base.css`, `/css/components.css`, Google Fonts. |
| `tarot.html` | `css/styles.css`, `/css/base.css`, `/css/components.css`, Google Fonts. |
| `faq.html` | `css/styles.css`, `/css/base.css`, `/css/components.css`, Google Fonts. |
| `como-trabajamos.html` | `css/styles.css`, `/css/base.css`, `/css/components.css`, Google Fonts. |
| `servicios.html` | Sin CSS relevante; funciona como redirección/puente. |

Conclusión: Astro debe partir de una hoja base limpia, tokens y estilos por componente. No conviene importar todo `css/styles.css` como base permanente porque arrastraría deuda de cascada, stacking y estilos acumulados.

### 1.3 Scripts usados por página pública

| Página | Scripts actuales | Deben seguir en cliente |
|---|---|---|
| `index.html` | Script inline de menú hamburguesa; `scripts/perf-media.js`; formulario HTML hacia Formspree. | Menú hamburguesa y carga diferida de video. Formspree no requiere JS propio si se mantiene submit HTML. |
| `magia-blanca.html` | Script inline de menú; módulo inline que importa `/assets/js/data.js`; `scripts/perf-media.js`. | Menú, video diferido, Firestore público y búsqueda/expandir cards. |
| `magia-roja.html` | Script inline de menú; módulo inline que importa `/assets/js/data.js`; `scripts/perf-media.js`. | Menú, video diferido, Firestore público y búsqueda/expandir cards. |
| `magia-negra.html` | Script inline de menú; módulo inline que importa `/assets/js/data.js`; `scripts/perf-media.js`. | Menú, video diferido, Firestore público y búsqueda/expandir cards. |
| `magia-verde.html` | Script inline de menú; módulo inline que importa `/assets/js/data.js`; `scripts/perf-media.js`. | Menú, video diferido, Firestore público y búsqueda/expandir cards. |
| `tarot.html` | Script inline de menú; `scripts/perf-media.js`. | Menú y video diferido. |
| `faq.html` | JSON-LD inline; script inline de menú; `scripts/perf-media.js`. | Menú y video diferido. JSON-LD puede quedar estático en Astro. |
| `como-trabajamos.html` | Script inline de menú; `scripts/perf-media.js`. | Menú y video diferido. |
| `servicios.html` | Redirección/meta/puente. | Idealmente reemplazar por redirect estático o página puente sin JS. |

### 1.4 Assets críticos detectados

| Asset | Uso | Estrategia propuesta |
|---|---|---|
| `images/Eclipse_small.mp4` | Video de fondo público. | Mantener ruta y archivo sin comprimir/reemplazar en esta fase. En Astro usar `VideoBackground.astro` con `preload="none"`, `poster` y `data-src`. |
| `images/video-poster.svg` | Poster/fallback de fondo. | Mantener como fallback estático y como base para reduced-motion/mobile. |
| `favicon_io/*` | Favicons, manifest e íconos. | Copiar/servir desde `public/favicon_io/` preservando rutas durante migración. |
| `robots.txt`, `sitemap.xml`, `CNAME` | SEO/deploy. | Mantener en `public/` en scaffold Astro y regenerar sitemap en fase SEO. |
| Google Fonts | Tipografías actuales. | Preservar inicialmente; luego evaluar self-host si hay beneficio medible. |
| WhatsApp `wa.me/59896106373` | Conversión. | No cambiar número. Centralizar en constante `src/lib/constants.ts` o equivalente. |

### 1.5 Partes convertibles a componentes Astro

| Componente propuesto | Migrabilidad | Notas |
|---|---|---|
| `Header` | Alta | Estructura repetida en todas las páginas. Debe exponer nav, CTA WhatsApp y botón hamburguesa accesible. |
| `Footer` | Alta | Repite enlaces sociales/WhatsApp. Debe centralizarse. |
| `VideoBackground` | Alta | Separar fondo fijo del flujo del documento para evitar que empuje contenido. Mantener `perf-media.js` o módulo equivalente. |
| `Hero` | Alta | Variantes para home, categorías e informativas. Debe asegurar un solo `h1` por página. |
| `IntentCards` | Alta | Cards estáticas de intención en home. No requiere JS ni Firestore. |
| `ProcessSection` | Alta | Contenido estático; ideal para home y `como-trabajamos`. |
| `TrustSection` | Alta | Contenido estático de confianza/garantías/expectativas. |
| `Testimonials` | Alta | Estático, salvo futura fuente de datos que no aplica ahora. |
| `ContactForm` | Media-alta | Mantener un único formulario real hacia Formspree. Evitar duplicados visuales/funcionales. |
| `FinalCTA` | Alta | CTA final reutilizable con WhatsApp. |
| `ServiceGrid` | Media | En home puede ser estático; en categorías necesita contenedor hidratado/cliente para Firestore. |
| `ServiceCard` | Media | En páginas Firestore hoy se crea con DOM. Puede conservarse como render cliente vanilla inicialmente; más adelante se podría replicar markup en componente si se decide pre-render/cms. |
| `WhatsAppButton` | Alta | Flotante mobile y CTAs inline, con número centralizado y mensajes por contexto. |

### 1.6 Qué scripts deben seguir en cliente

- Menú hamburguesa: interacción mínima. Idealmente `src/scripts/menu.ts` o script inline pequeño en `BaseLayout.astro`.
- Carga diferida de video: conservar lógica equivalente a `scripts/perf-media.js` para reduced-motion, reduced-data, mobile y `saveData`.
- Firestore en páginas de servicios: debe cargarse solo en `/magia-blanca/`, `/magia-roja/`, `/magia-negra/` y `/magia-verde/`, nunca en home ni páginas informativas.
- Búsqueda/expandir cards de servicios: cliente, acoplado al render público de servicios.
- Formspree: si se mantiene como submit HTML, no necesita JS. Si se agrega UX progresiva luego, debe ser una isla aislada y no duplicar formularios.

### 1.7 Qué debe quedar estático

- Home: contenido, secciones, cards de intención, grid de categorías, testimonios, FAQ breve si aplica, CTAs y formulario HTML.
- `tarot`, `faq`, `como-trabajamos`: contenido estático y JSON-LD de FAQ generado en build.
- Header/footer/WhatsApp flotante: markup estático con una mejora cliente mínima para menú.
- SEO: title, description, canonical, Open Graph/Twitter si se agrega, schema, robots y sitemap.
- Admin legacy: archivos servidos tal cual, sin bundling ni importaciones Astro inicialmente.

## 2. Arquitectura Astro propuesta

### 2.1 Estructura de carpetas recomendada

```text
.
├── astro.config.mjs
├── package.json
├── public/
│   ├── admin/                  # Copia inicial intacta de admin legacy
│   ├── images/                 # Assets públicos preservando rutas críticas
│   ├── favicon_io/
│   ├── robots.txt
│   ├── sitemap.xml             # Inicialmente preservado; luego generado/actualizado
│   └── CNAME
└── src/
    ├── pages/
    │   ├── index.astro
    │   ├── magia-blanca/index.astro
    │   ├── magia-roja/index.astro
    │   ├── magia-negra/index.astro
    │   ├── magia-verde/index.astro
    │   ├── tarot/index.astro
    │   ├── faq/index.astro
    │   └── como-trabajamos/index.astro
    ├── layouts/
    │   └── BaseLayout.astro
    ├── components/
    │   ├── Header.astro
    │   ├── Footer.astro
    │   ├── VideoBackground.astro
    │   ├── Hero.astro
    │   ├── IntentCards.astro
    │   ├── ProcessSection.astro
    │   ├── TrustSection.astro
    │   ├── Testimonials.astro
    │   ├── ContactForm.astro
    │   ├── FinalCTA.astro
    │   ├── ServiceGrid.astro
    │   ├── ServiceCard.astro
    │   └── WhatsAppButton.astro
    ├── styles/
    │   ├── global.css           # Reset, tokens, layout base
    │   ├── tokens.css           # Colores, spacing, z-index, breakpoints documentados
    │   └── utilities.css        # Utilidades mínimas, no framework casero extenso
    ├── scripts/
    │   ├── menu.ts
    │   ├── perf-media.ts
    │   └── public-services.ts   # Puente cliente para Firestore/render de servicios
    └── lib/
        ├── constants.ts         # WhatsApp, links sociales, navegación
        ├── seo.ts               # Defaults de title/meta/canonical/schema
        ├── services.ts          # Metadata estática de categorías
        └── firebase-public.ts   # Solo importado por scripts/islas de servicios
```

### 2.2 Estrategia para conservar `/admin` intacto

- En M1/M5, copiar `admin/` a `public/admin/` sin cambiar su HTML, CSS ni JS.
- Mantener `/admin/config.js`, `/admin/app.js`, CSS y helpers tal como están para evitar cambios de Auth/Firestore.
- No pasar el admin por bundler, no convertirlo en rutas Astro y no cambiar imports CDN de Firebase en esta fase.
- Validar manualmente que `/admin/` resuelva `./app.js`, `./config.js`, `styles.css` y `admin-styles-addon.css` con las mismas rutas relativas.
- Mantener Firestore Rules/Auth como fuente real de seguridad; la migración de frontend no debe alterar reglas.

### 2.3 Estrategia para assets

- Preservar rutas públicas críticas para minimizar regresiones: `/images/Eclipse_small.mp4`, `/images/video-poster.svg`, `/favicon_io/*`.
- No comprimir ni reemplazar video durante esta fase; solo encapsular su markup y comportamiento en un componente.
- Separar assets de contenido público en `public/images/`; evitar imports procesados de Astro para assets con rutas históricas que ya están indexadas o referenciadas.
- Documentar cualquier asset no usado antes de borrarlo en una fase posterior; no borrar legacy ahora.

### 2.4 Estrategia para scripts vanilla

- Mantener scripts sin framework. Astro puede incluir scripts TypeScript/JS que se compilan a bundles pequeños.
- Extraer menú hamburguesa a un módulo único y usar atributos (`data-menu-toggle`, `data-side-nav`) para desacoplarlo de IDs rígidos.
- Portar `perf-media.js` a `src/scripts/perf-media.ts` o conservar temporalmente en `public/scripts/perf-media.js`; la decisión debe priorizar no romper el comportamiento ya estabilizado.
- Evitar dependencias de UI innecesarias. No usar React/Vue/Svelte para interacciones que resuelve vanilla JS.

### 2.5 Estrategia para Firebase client-side en servicios

- Mantener Firebase fuera de la home y páginas informativas.
- Encapsular el render dinámico de servicios en un único script/isla de cliente usado solo por páginas de categoría.
- En una primera migración, reutilizar la lógica actual de normalización/render seguro (`assets/js/data.js` y `assets/js/service-helpers.js`) para reducir riesgo.
- En una fase posterior, mover esa lógica a `src/lib`/`src/scripts` con tests equivalentes antes de retirar los assets legacy.
- Seguir renderizando datos remotos con `textContent`/DOM explícito, no `innerHTML` con contenido de Firestore.
- Conservar cache por categoría en cliente y ordenamiento sin `orderBy` si se mantiene la decisión de evitar índices adicionales.

## 3. Estrategia de rutas

### 3.1 Rutas limpias recomendadas

- `/`
- `/magia-blanca/`
- `/magia-roja/`
- `/magia-negra/`
- `/magia-verde/`
- `/tarot/`
- `/faq/`
- `/como-trabajamos/`

### 3.2 Rutas legacy a conservar con redirect o página puente

| Legacy | Destino recomendado | Tipo recomendado |
|---|---|---|
| `/magia-blanca.html` | `/magia-blanca/` | Redirect 301 cuando el hosting lo permita; si no, HTML puente con canonical nuevo. |
| `/magia-roja.html` | `/magia-roja/` | Redirect 301 o HTML puente. |
| `/magia-negra.html` | `/magia-negra/` | Redirect 301 o HTML puente. |
| `/magia-verde.html` | `/magia-verde/` | Redirect 301 o HTML puente. |
| `/tarot.html` | `/tarot/` | Redirect 301 o HTML puente. |
| `/faq.html` | `/faq/` | Redirect 301 o HTML puente. |
| `/como-trabajamos.html` | `/como-trabajamos/` | Redirect 301 o HTML puente. |
| `/servicios.html` | `/#servicios` o futuro `/servicios/` si se crea | Mantener puente para no romper enlaces. |

No implementar redirects en esta fase documental. En GitHub Pages, validar si se resolverá con páginas HTML puente, meta refresh, canonical y enlaces internos actualizados, o con configuración externa si el deploy cambia.

## 4. Riesgos principales

1. **Regresión visual por stacking/fondo/video:** el video debe ser fixed/absolute fuera del flujo y con z-index documentado; header/main/footer deben tener stacking explícito.
2. **Pantalla vacía inicial:** evitar dependencias cliente para pintar la home. La home debe salir estática del build.
3. **Firebase cargado donde no corresponde:** riesgo de performance y errores si se importa Firebase desde layout global. Debe aislarse a páginas de servicios y admin.
4. **Ruptura de `/admin`:** copiar admin a `public/admin` sin bundler; cualquier cambio de rutas relativas puede romper Auth/config.
5. **SEO por cambio de URLs:** rutas limpias mejoran arquitectura, pero legacy `.html` debe redirigir o servir puente para no perder enlaces.
6. **Cascada CSS heredada:** importar CSS legacy completo puede reproducir la deuda actual. Migrar por tokens/componentes y usar CSS legacy solo como referencia visual.
7. **Formulario duplicado:** la home debe tener un solo formulario real. CTAs secundarios deben apuntar a WhatsApp o al formulario único.
8. **Divergencia de copy:** al componentizar, copiar contenido actual como fuente base y justificar cualquier mejora de copy por SEO/conversión.
9. **Dependencias innecesarias:** Astro permite islas con frameworks, pero este sitio no las necesita en la fase inicial.
10. **Comparación visual insuficiente:** sin capturas baseline de legacy, es difícil distinguir mejoras de regresiones.

## 5. Migración por fases

### M0 — Congelar legacy y capturas

- Crear inventario de páginas, CSS, scripts y assets críticos.
- Tomar capturas baseline mobile 360/390px y desktop para home, categorías, tarot, FAQ y cómo trabajamos.
- Registrar Lighthouse actual y checks SEO básicos.
- Congelar cambios funcionales en legacy salvo fixes críticos.

### M1 — Scaffold Astro mínimo

- Crear proyecto Astro estático en rama de migración.
- Configurar `src/pages`, `src/layouts`, `src/components`, `src/styles`, `src/lib` y `public`.
- Copiar assets públicos críticos preservando rutas.
- No migrar admin todavía, salvo copia intacta planificada.
- Verificar `astro build` con una página placeholder estática.

### M2 — Migrar home

- Construir `BaseLayout`, `Header`, `Footer`, `VideoBackground`, `Hero`, `IntentCards`, `ProcessSection`, `TrustSection`, `Testimonials`, `ContactForm`, `FinalCTA` y `WhatsAppButton`.
- Garantizar home completamente estática, sin Firestore.
- Validar un solo `h1`, un solo formulario real, CTAs y WhatsApp sin cambiar número.
- Comparar visualmente contra legacy y ajustar solo layout/componentes Astro.

### M3 — Migrar páginas informativas

- Migrar `/tarot/`, `/faq/` y `/como-trabajamos/`.
- Preservar canonical/meta/schema relevantes.
- Convertir FAQ JSON-LD a data estática generada en build.
- Validar que no se cargue Firebase.

### M4 — Migrar páginas de servicios con Firebase client-side

- Crear páginas `/magia-blanca/`, `/magia-roja/`, `/magia-negra/`, `/magia-verde/`.
- Incluir contenedor estático con estado inicial accesible y script cliente solo en esas rutas.
- Reutilizar o portar render público de servicios con normalización v2 y fallbacks legacy.
- Mantener búsqueda, cards enriquecidas, CTAs WhatsApp y manejo de error/empty state.

### M5 — Conservar admin legacy en `public/admin`

- Copiar `admin/` completo a `public/admin/`.
- Validar login, lectura/escritura, backfill manual y helpers existentes en entorno seguro.
- No convertir admin a Astro en esta etapa.

### M6 — SEO, sitemap, redirects y deploy

- Actualizar canonical a rutas limpias.
- Generar o actualizar sitemap con rutas nuevas.
- Implementar redirects o páginas puente desde `.html` legacy.
- Validar `robots.txt`, `CNAME`, favicons, manifest y enlaces internos.
- Preparar deploy estático sin tocar producción hasta QA aprobada.

### M7 — QA visual, Lighthouse y comparación legacy vs Astro

- Comparar capturas legacy vs Astro en mobile 360/390px y desktop.
- Ejecutar Lighthouse/performance/accesibilidad/SEO.
- Revisar network: home sin Firestore/Firebase; servicios con Firebase solo allí; video no carga en mobile/reduced-motion/save-data.
- Validar enlaces WhatsApp, Formspree, navegación y rutas legacy.

## 6. Criterios de aceptación para la futura migración

- La home Astro no muestra pantalla vacía inicial.
- El fondo/video no empuja contenido ni altera la altura del documento.
- Header, main, video, overlays, WhatsApp flotante y footer tienen stacking controlado y documentado.
- Mobile 360px y 390px se ve bien sin overflow horizontal.
- Desktop se ve bien y mantiene jerarquía visual.
- Hay un solo formulario real en la home.
- Hay un solo `h1` por página.
- La home no carga Firestore ni Firebase SDK.
- `tarot`, `faq` y `como-trabajamos` no cargan Firestore.
- Las páginas de servicios cargan Firestore solo donde corresponde.
- Admin sigue funcionando intacto bajo `/admin/`.
- URLs legacy `.html` no rompen y tienen redirect/puente/canonical definido.
- SEO/meta/canonical/schema/sitemap se preservan o mejoran con justificación.
- No se agregan dependencias innecesarias.
- `astro build` genera output estático correcto.
- No se cambia el número de WhatsApp.
- No se reemplaza ni recomprime el video en esta fase.
- No se borra la versión legacy hasta que exista aprobación explícita.

## 7. Siguiente prompt recomendado para scaffold Astro

```text
Actuá como senior frontend engineer especializado en migraciones progresivas a Astro.

Objetivo de esta fase M1:
Crear un scaffold Astro mínimo y estático para Cristal Sagrado sin migrar todo el sitio todavía.

Restricciones:
- No borrar legacy.
- No modificar Firebase ni admin funcional.
- No cambiar número de WhatsApp.
- No reemplazar ni comprimir video.
- No migrar contenido completo todavía.
- Mantener output estático.

Tareas:
1. Crear configuración mínima Astro con `src/pages`, `src/layouts`, `src/components`, `src/styles`, `src/lib` y `public`.
2. Copiar assets críticos a `public` preservando rutas: `images/Eclipse_small.mp4`, `images/video-poster.svg`, `favicon_io`, `robots.txt`, `CNAME` y sitemap actual si aplica.
3. Crear `BaseLayout.astro`, `Header.astro`, `Footer.astro`, `VideoBackground.astro` y una home placeholder estática que permita validar build sin cargar Firestore.
4. Conservar `/admin` intacto como legacy en `public/admin` solo si no rompe rutas; si hay dudas, documentarlas y no tocar admin.
5. Agregar scripts vanilla mínimos para menú y video diferido, sin frameworks de UI.
6. Ejecutar build y documentar próximos pasos para M2.

Entregables:
- Diff de scaffold Astro mínimo.
- Build exitoso.
- Nota de riesgos pendientes antes de migrar home real.
```

## 8. Git diff esperado en esta fase

En esta fase exploratoria el diff debe limitarse a documentación:

- Crear `docs/ASTRO_MIGRATION_PLAN.md`.
- Actualizar `docs/ARCHITECTURE.md` con una nota de migración propuesta.
