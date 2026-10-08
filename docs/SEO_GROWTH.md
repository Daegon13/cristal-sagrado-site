# Crecimiento orgánico: servicios públicos

## Fuente y generación

Firestore (`services`) sigue siendo la fuente de verdad. `npm run sync:services` consulta únicamente documentos con `active == true` mediante la API REST pública y la configuración web existente. No usa Firebase Admin ni cuenta de servicio. Selecciona campos conocidos, aplica `normalizeService()`, ordena con `compareServicesForPublic()` y guarda solo los campos de `PUBLIC_FIELDS` en `src/data/generated/services.public.json`. La snapshot contiene información comercial pública, se versiona y permite compilar sin conexión temporal a Firestore.

`npm run build` ejecuta el sync antes de Astro. Si Firestore responde, actualiza la snapshot. Si falla, conserva la última snapshot válida y emite una advertencia. Si falla y no hay snapshot válida, el build falla con un mensaje explícito. Una respuesta vacía se trata como fallo para evitar publicar categorías vacías por un error de consulta. Antes de publicar, revisar el diff de la snapshot para detectar cambios editoriales inesperados.

Las cuatro páginas de categoría se generan con fichas HTML desde la snapshot. El navegador conecta el buscador y el botón de ampliar sin esperar a Firebase; después consulta Firestore para actualizar las fichas solo si la lectura tiene éxito. Si la lectura falla, el HTML inicial y sus CTA siguen disponibles. El código no publica rutas de servicio individuales todavía.

## Sitemap, robots y canonical

`src/pages/sitemap.xml.js` deriva las URLs de las páginas Astro `index.astro` y genera `/sitemap.xml` durante el build. Para Fase 2, una página `src/pages/<ruta>/index.astro` aparecerá automáticamente cuando exista de verdad. No añadir URLs de servicios hasta construir sus páginas. `public/robots.txt` permite el sitio público, excluye `/admin/` y `/previews/`, y apunta al sitemap. `BaseLayout.astro` emite canonical de producción para cada ruta pública y `noindex` en builds con `BASE_PATH` de preview.

## Verificación local

1. Ejecutar `npm test`, `npm run build` y `npm run test:build`.
2. Abrir `dist/magia-blanca/index.html` y las otras tres categorías como texto. Buscar nombres y descripciones de servicios reales dentro de `#lista-servicios`, sin ejecutar JavaScript. Confirmar `data-whatsapp-trigger` y metadatos por servicio.
3. Revisar `dist/sitemap.xml`, `dist/robots.txt` y el canonical de cada página pública.
4. Tras el deploy, usar «Ver código fuente» en producción y repetir la comprobación de fichas. Los resultados de Google dependen de su rastreo y no se garantizan por el build.

## Google Search Console (manual, después del deploy)

1. Crear una propiedad de **dominio** para `cristal-sagrado.com` y verificarla mediante el registro DNS que indique Google.
2. Enviar `https://cristal-sagrado.com/sitemap.xml`.
3. Inspeccionar Home y las cuatro URLs `/magia-blanca/`, `/magia-roja/`, `/magia-negra/`, `/magia-verde/`.
4. Solicitar indexación de esas páginas después del deploy.
5. Revisar consultas, impresiones, clics, CTR y posición media. Identificar páginas con posiciones aproximadas 8 a 20 para mejoras editoriales basadas en consultas reales.

No se integra ningún script de Search Console. Esta etapa no automatiza la verificación DNS ni la solicitud de indexación.

## Fase 2: páginas de servicio

`src/lib/public-services.js` expone `getPublicServices()`, `getServicesByCategory()`, `getServiceBySlug()` y `getServiceById()`. La siguiente fase puede usarlos para generar páginas individuales solo cuando haya contenido único suficiente y una decisión editorial sobre sus URLs. Mantener la validación del caso antes de WhatsApp y los eventos de analytics existentes.
