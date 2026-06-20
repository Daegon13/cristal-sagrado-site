# Arquitectura — Cristal Sagrado

## Tipo de proyecto

Sitio estático en HTML, CSS y JavaScript, publicado como archivos planos. No usa bundler ni framework frontend. El objetivo actual es mejorar conversión, SEO técnico, accesibilidad, performance y mantenibilidad mediante parches pequeños.

## Estructura principal

- `index.html`: home pública, hero, grilla de categorías, testimonios y formulario Formspree.
- `magia-blanca.html`, `magia-roja.html`, `magia-negra.html`, `magia-verde.html`: páginas públicas de categorías que cargan servicios activos desde Firestore.
- `tarot.html`, `faq.html`, `como-trabajamos.html`: páginas informativas públicas.
- `servicios.html`: redirección heredada hacia la sección de servicios de la home.
- `admin/`: panel administrativo con Firebase Auth y Firestore.
- `assets/js/data.js`: lectura pública de servicios desde Firestore y render seguro de listados.
- `scripts/perf-media.js`: carga diferida del video de fondo respetando señales de performance/accesibilidad.
- `css/`: estilos globales y estilos específicos por categoría.
- `images/` y `favicon_io/`: video, poster y favicons.
- `robots.txt`, `sitemap.xml`, `CNAME`: señales de SEO/deploy.

## Flujo público

1. El usuario llega a la home o a una categoría.
2. Los CTAs principales apuntan a WhatsApp con mensaje prellenado o al formulario Formspree.
3. En páginas de categoría, el HTML importa `assets/js/data.js` como módulo.
4. `renderServices()` consulta Firestore `services` por `category` y `active=true`, ordena en cliente por `order` y renderiza con nodos DOM seguros.
5. El buscador filtra en cliente por título/descripción ya renderizados.

## Flujo admin

1. `/admin/index.html` carga `admin/app.js` y `admin/config.js`.
2. Firebase Auth valida email/contraseña.
3. `ALLOWED_EMAILS` mejora la UX, pero no reemplaza Firestore Rules.
4. El panel lee/escribe `settings/site` y documentos de `services`.
5. La categoría activa se decide por `?cat=roja|blanca|negra|verde`.
6. Desde FASE 3B.1, el formulario de servicios conserva campos legacy y agrega edición opcional de modelo v2 (`slug`, copies extendidos, arrays de intención/beneficios, `featured` y `ctaText`) sin migración destructiva. Los servicios nuevos guardan `active: true` por defecto para ser compatibles con la consulta pública `where("active", "==", true)`.

## Dependencias externas

- Firebase SDK modular vía CDN (`firebase-app`, `firebase-auth`, `firebase-firestore`).
- Google Fonts.
- Formspree para el formulario de contacto.
- WhatsApp `wa.me` para conversión directa.

## Decisiones de seguridad y mantenimiento

- Los datos remotos de Firestore deben renderizarse con `textContent` o creación explícita de nodos, no con `innerHTML`.
- La protección real de escrituras debe estar en Firestore Rules/Auth, no en el frontend.
- No se debe cargar Firebase en páginas que no consumen Firestore/Admin.
- Mantener rutas heredadas para no romper SEO ni enlaces compartidos.

## Hallazgos FASE 0/1

- Hay assets pesados en `images/`: `Eclipse_small.mp4` (~21 MB) y `Eclipse_small.7z` (~20 MB). Deben tratarse en FASE 4.
- `sitemap.xml` usaba `www`, mientras `CNAME` y `robots.txt` apuntan a `cristal-sagrado.com`. Se normaliza a dominio canónico sin `www`.
- Las páginas públicas necesitaban `h1` único y meta descriptions específicas.
- `faq.html` tenía dos elementos `<main>` y contenido duplicado; queda consolidado en un solo `<main>`.
- `assets/js/data.js` tenía auto-inicialización además de llamadas explícitas por página; eso podía duplicar render/lecturas Firestore.
