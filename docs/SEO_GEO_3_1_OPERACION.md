# Operación de búsqueda y medición 3.1

## Antes y después de publicar

1. Revisar el PR y su preview con `BASE_PATH`; verificar Home, nueva landing, categorías, Tarot, diez fichas, guías, tres libros y enlaces a WhatsApp sin enviar mensajes reales. El merge a `main` dispara el workflow de producción; anotar la fecha y hora efectivas del despliegue.
2. En Google Search Console, entrar con una cuenta que ya tenga acceso a la propiedad de dominio `cristal-sagrado.com`. Si no existe, crear propiedad de **dominio** y verificarla por el registro DNS TXT que entregue Google en ese momento; no copiar tokens a este repositorio. Revisar «Páginas», «Sitemaps», «Rendimiento», «Inspección de URL» y «Métricas web principales». Enviar `https://cristal-sagrado.com/sitemap.xml` y probar la nueva URL con inspección en vivo. Registrar cobertura, canonical elegido, recursos bloqueados, consultas, impresiones, clics, CTR y posición media sin inventar valores.
3. En Bing Webmaster Tools, comprobar si la propiedad ya existe. Si no, importar una propiedad verificada desde Search Console con la cuenta autorizada o añadir `https://cristal-sagrado.com/` y verificar según las opciones de Bing. Enviar el mismo sitemap; revisar URL Inspection, Site Explorer, Search Performance e IndexNow. La verificación de titularidad no se puede deducir de la falta de archivos de verificación en el repositorio.
4. Probar HTTP 200, canonical, meta robots y contenido visible de la nueva ruta **en producción** tras el despliegue. Confirmar que `/previews/pr-N/` conserva `noindex` y que Admin no aparece en sitemap. La preview no sustituye esta comprobación.

Fuentes operativas: [Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start), [Bing: alta y verificación](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b), [Bing: sitemaps](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed).

## IndexNow

Se evaluó [el protocolo oficial](https://www.indexnow.org/documentation). Este sitio tiene publicación estática de baja frecuencia, sitemap generado en cada build y aún no hay evidencia de propiedad en Bing ni clave IndexNow publicada. Por ahora usar el sitemap y la inspección/envío manual de URLs modificadas en Bing. No añadir una clave ni envíos automáticos en cada build: las previews también compilan, el build local no es publicación y un aviso podría anunciar una URL inexistente. Si la cadencia de cambios justifica IndexNow, definir en otro cambio una clave pública de 8 a 128 caracteres, alojarla en la raíz canónica, comprobar HTTP 200 y enviar solo URLs canónicas nuevas, cambiadas o eliminadas después de publicar. Una respuesta 200 significa recepción, no indexación.

## Medición a 4, 8 y 12 semanas

Usar como punto cero la fecha real de publicación, no la fecha del PR. Guardar una exportación privada de Search Console, Bing y el resumen agregado de Umami para la ventana previa comparable. No almacenar en Git consultas privadas de clientes ni datos de contacto.

| Momento | Revisión | Interpretación |
| --- | --- | --- |
| Semana 4 | Estado de sitemap/URL, páginas indexadas, impresiones y clics por página/consulta, entradas con referrer conocido, landing pages SEO e intentos `wa_outbound` en ellas. | Detectar fallos de rastreo/canonical y primeras señales. Una muestra pequeña no permite atribución causal. |
| Semana 8 | Repetir por consultas relevantes de Montevideo/Uruguay y tipos de servicio; contrastar CTR y posición media disponibles, visitas identificadas y mensajes recibidos registrados manualmente. | Ajustar títulos/contenido solo ante necesidades reales, sin crear páginas duplicadas. |
| Semana 12 | Comparar las mismas cohortes y periodos, ventas confirmadas manualmente y calidad de consultas. Revisar si la landing aporta consultas útiles y si las guías asisten al recorrido. | Decidir siguiente iteración; distinguir estacionalidad, campañas de Instagram, cambios de catálogo y variación natural. |

**Definiciones:** Search Console/Bing miden impresiones y clics de búsqueda; Umami mide visitas/pageviews y eventos; `wa_outbound` es intento de abrir WhatsApp; mensaje recibido y venta confirmada requieren registro privado de Lucía. No se suman ni equiparan estas magnitudes. El reporte nuevo clasifica referrers conocidos de Google, Bing, ChatGPT, Claude, Gemini y Copilot cuando llegan como host reconocible. No atribuye todo el tráfico de IA ni puede cruzar referrer, landing y evento con las métricas agregadas actuales. Comparar `wa_outbound` anterior a 3.0 con cuidado porque cambió su composición.

## Autoridad externa

Tras confirmar titularidad, enlazar la web canónica desde las biografías oficiales de Instagram y TikTok, y mantener nombre/descripción coherentes con la modalidad real. Buscar menciones auténticas de colaboradores o medios solo cuando existan; crear contenido original que responda dudas observadas. No comprar enlaces ni crear reseñas. [Google Business Profile](https://support.google.com/business/answer/13763036) exige elegibilidad por atención presencial; una operación exclusivamente online no debe crear una ficha física.
