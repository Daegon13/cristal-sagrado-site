# Diseño de conversión — Cristal Sagrado

## Criterio de diseño

La Home se diseña primero para 390 px y se revisa desde 320 px. La navegación móvil es HTML visible en dos filas: marca y **Consultar** arriba; Trabajos, Tarot, Cómo funciona y FAQ debajo. No hay menú hamburguesa, overlay ni dependencia de JavaScript para navegar. En móvil el header no es sticky; el CTA inferior conserva el acceso persistente a WhatsApp.

## Recorrido de Home

1. Hero: propuesta centrada en la situación de la persona, CTA principal **Contame mi caso** y enlace secundario a trabajos.
2. Navegación secundaria visible y estática hacia Magia Blanca, Magia Roja, Magia Negra, Magia Verde y Tarot; la misma arquitectura se refuerza en el footer.
3. Franja compacta de confianza: hechos que ya se comunican en el sitio.
4. Intenciones: cinco entradas por necesidad que abren el panel de WhatsApp.
5. Trabajos y lecturas: cada categoría conserva su descripción y tiene nombre enlazado y CTA textual descriptivo hacia su ruta.
6. Cómo funciona: pasos breves del proceso vigente y CTA de consulta.
7. Testimonios existentes, enlace a Instagram y CTA de consulta.
8. Formspree como alternativa secundaria para dejar datos, con acceso discreto a WhatsApp.
9. CTA final hacia la consulta.

Los CTA de WhatsApp siguen el diálogo obligatorio donde la persona describe su caso. Sin JavaScript, sus enlaces llegan al formulario existente. El verde se reserva para las acciones identificadas explícitamente con WhatsApp, especialmente la barra inferior. Formspree mantiene un único formulario y su endpoint. El campo de contacto acepta un email práctico o un teléfono plausible de 8 a 15 dígitos; los errores se muestran junto a cada campo y un submit inválido se bloquea antes de salir a Formspree.

## Dirección visual

La paleta se centraliza en `src/styles/tokens.css`: negro violáceo, violeta profundo, dorado, marfil y vino como acento. La tipografía conserva Playfair Display y Roboto. Cinco intenciones usan superficies pequeñas con acentos sutiles; los trabajos recuperan tarjetas de cristal oscuro con borde dorado. La Home mantiene la jerarquía comercial del rediseño y vuelve a mostrar profundidad cósmica.

El Hero móvil usa `public/images/moon-poster.webp` (1280 × 720, 34 KB), un fotograma derivado del video aprobado `Eclipse_small.mp4`. No descarga el video hasta 960 px. En escritorio se mantiene su carga diferida. El poster SVG original permanece como fallback del fondo de video. La nueva composición sitúa la luna por encima y a la derecha del texto para evitar que la superficie translúcida la oculte.

La comparación de la versión anterior (`0421a15`) con la propuesta está en [`visual-qa/README.md`](visual-qa/README.md), con capturas completas a 390, 430 y 1440 px.

## Hipótesis a medir

Comparar tráfico de Instagram antes y después del despliegue con las mismas ventanas y campañas: visitas a Home, `intent_click` por intención, `nav_cta` por `cta_location`, `wa_open`, `wa_case_valid`, `wa_outbound` y `form_submit`. Seguir la tasa de cada paso del embudo y las salidas a WhatsApp por visitante, separando móvil y escritorio cuando el agregado de Umami lo permita. `wa_outbound` representa un lead potencial; no confirma conversación ni venta. No registrar texto del caso, datos de contacto ni identificadores personales. El rediseño plantea una hipótesis de mejora, todavía sin resultado medido.
