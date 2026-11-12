# Auditoría SEO/GEO 3.1

Fecha de revisión: 11 de noviembre de 2026. Base: `origin/main` en `235856a` (PR #14 integrado). Esta auditoría distingue el sitio público previo a 3.1 del build de esta rama; no contiene datos de Search Console ni de Bing Webmaster Tools.

## Evidencia inicial

| Área | Observación verificable | Clasificación |
| --- | --- | --- |
| Acceso HTTP | `GET` a Home, `/robots.txt`, `/sitemap.xml`, `/tarot/`, `/magia-roja/` y `/admin/`: 200 el 11/11/2026; la ruta local nueva y `/previews/`: 404 antes de publicar. | Confirmado en producción para esas URLs solamente. |
| Sitemap | 29 `<loc>` públicas antes de 3.1. El generador toma rutas Astro, 10 fichas seleccionadas, 6 guías y 3 libros; excluye admin y rutas `.html` legacy. | Confirmado. |
| Robots | `User-agent: *` permite páginas públicas y excluye `/admin/` y `/previews/`. No había una preferencia explícita para GPTBot o ClaudeBot. | Confirmado en código y HTTP. |
| Canonical y meta robots | Home, Tarot y Magia Roja publicaban canonical absoluto propio y `index,follow`. `BaseLayout` usa `noindex,follow` cuando `BASE_PATH` corresponde a preview. | Confirmado en muestra HTTP y código; no equivale a indexación real. |
| Contenido | Home, Tarot, cuatro categorías, diez fichas, seis guías y libros tienen HTML generado. Las categorías agregan lectura Firebase en cliente, pero sus 52 servicios están presentes en el HTML inicial del build. | Confirmado por build y tests. |
| Relevancia local | Home nombra Uruguay, pero no había ruta dedicada a explicar consultas desde Montevideo. Los títulos de Home, Tarot, Roja y Blanca no mencionaban Uruguay ni Montevideo. | Oportunidad confirmada de contenido; impacto de búsqueda hipotético. |
| Datos estructurados | FAQ, guías, fichas SEO y libros tenían JSON-LD propio; Home carecía de `Organization` y `WebSite`. | Confirmado en código. |
| Admin | `/admin/` devuelve 200 y su HTML no tiene meta robots; robots impide el rastreo. | Riesgo probable de exposición de URL en resultados si otros sitios enlazan; no se modifica admin por la restricción de 3.1. |
| Perfiles sociales | El footer enlaza Instagram y TikTok. No se verificó titularidad ni coherencia de las biografías desde cuentas administradas. | Requiere intervención humana. |

No se encontraron URLs SEO huérfanas entre las fichas y guías: categoría → ficha, footer → guías → fichas. Las rutas `.html` históricas son puentes con `noindex`, canonical y refresh porque GitHub Pages no ofrece redirecciones HTTP configurables en este repositorio. Las previews se bloquean en robots de producción y usan meta `noindex` en el build con `BASE_PATH`; una URL bloqueada en robots puede impedir que un crawler lea su meta noindex, por lo que se debe comprobar la exposición de previews con las herramientas de webmaster. No hay evidencia de 403/429 para bots reales, Core Web Vitals de campo, indexación, consultas ni posiciones.

En la revisión de rendimiento móvil del código, el Hero usa WebP de 70.106 bytes (móvil) y 74.640 bytes (escritorio), y el poster secundario pesa 33.922 bytes. El sitio usa Google Fonts externas. Estos tamaños y las pruebas de layout local no sustituyen LCP, INP o CLS reales; medirlos en Search Console y PageSpeed Insights después de publicar.

## Prioridades

1. Crear una única página útil para la consulta desde Montevideo y enlazarla en HTML desde Home y footer, sin afirmar local físico.
2. Precisar metadata en Home, Tarot, Roja y Blanca; conservar canonical y sitemap coherentes.
3. Añadir identidad semántica mínima para la marca y expresar preferencia separada para crawlers de entrenamiento conocidos.
4. Validar con Search Console y Bing después del despliegue: indexación, canonical elegido, cobertura, recursos y rendimiento de campo.

## Investigación oficial y límites

- [Google Search Central: IA en Search](https://developers.google.com/search/docs/appearance/ai-features) y [guía de optimización para IA](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): se aplican fundamentos SEO; no hay un requisito especial de marcado para AI Overviews/AI Mode ni garantía de aparición.
- [Google: canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) y [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview): son señales de descubrimiento/preferencia, no órdenes de indexación.
- [Google: nombres de sitio](https://developers.google.com/search/docs/appearance/site-names) y [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization): justifican un nodo de marca en Home; se omiten dirección, horario, reseñas y perfiles no verificados.
- [OpenAI: crawlers](https://developers.openai.com/api/docs/bots) y [FAQ para editores](https://help.openai.com/en/articles/12627856): OAI-SearchBot es búsqueda, GPTBot es entrenamiento y ChatGPT-User responde a solicitudes de usuarios; las preferencias son independientes.
- [Anthropic: crawlers](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler): Claude-SearchBot, Claude-User y ClaudeBot tienen propósitos distintos.
- [Bing Webmaster Tools](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b) y [IndexNow](https://www.indexnow.org/documentation): exigen propiedad/verificación para operación y el aviso de URL no garantiza indexación.
- [Schema.org WebPage](https://schema.org/WebPage) y [BreadcrumbList](https://schema.org/BreadcrumbList): se usan solo donde representan contenido y navegación visibles. [Google retiró los resultados enriquecidos FAQ en 2026](https://developers.google.com/search/updates); no se agregó más marcado FAQ.
- [Google Business Profile](https://support.google.com/business/answer/13763036): negocios exclusivamente online no son elegibles para una ficha física.

Las frases de búsqueda del plan son hipótesis; faltan datos para afirmar demanda, dificultad o posición. Search Console debe aportar páginas indexadas, consultas, impresiones, clics y canonicals elegidos. Bing debe aportar sus propios datos de cobertura y rendimiento. También faltan mediciones reales en móvil y validación de Safari/WebView.
