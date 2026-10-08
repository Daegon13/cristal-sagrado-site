# Auditoría de copy público — 2026-10-08

Alcance: páginas Astro públicas, componentes compartidos, textos generados por `assets/js`, estados de categorías y redirects HTML legacy. La prioridad de contacto es WhatsApp con descripción obligatoria de la situación; el formulario Formspree es una alternativa. No se modificaron datos remotos de Firestore ni testimonios.

| Ubicación / función | Antes | Después | Motivo |
| --- | --- | --- | --- |
| Home, Hero / orientación y CTA | «Contame qué estás viviendo y te oriento sobre qué trabajo puede tener más sentido para tu caso»; «Contame mi caso» | Explica que no hace falta elegir ritual; «Consultar por WhatsApp» | Aclara la atención personalizada y el destino del CTA. El H1 conserva rituales, tarot y trabajos personalizados. |
| Header y sticky / CTA | «Consultar»; «Contame tu caso por WhatsApp» | «Consultar por WhatsApp» en escritorio, «WhatsApp» con nombre accesible completo en móvil; «Hablar por WhatsApp» en sticky | Hace explícito el canal sin alargar el espacio móvil. |
| Confianza / explicación | «Reserva total»; «Cada lectura o trabajo se adapta al caso» | «Consulta privada»; orientación sobre qué opción tiene sentido | Usa palabras concretas y evita sugerir una adaptación garantizada. |
| Intenciones / orientación y CTA | Una misma acción «Contame tu caso» para cinco motivos | Acciones según amor, protección, tarot, trabajo o duda inicial | La persona reconoce su motivo antes de iniciar la consulta. |
| Trabajos y lecturas / navegación | «Soluciones para situaciones complejas»; «Lecturas precisas para guiar tu camino» | Descripciones del contenido por categoría; «Explorar…» | Evita promesas, distingue navegación de consulta y conserva términos buscables. |
| Categorías / H1, explicación y búsqueda | H1 genéricos; «Elegí el servicio…»; «Buscar servicios» | H1 con categoría y orientación; indica que se puede consultar antes de elegir; búsqueda por nombre o descripción | Mantiene el término de cada categoría y explica el próximo paso. |
| Servicios Firestore / CTA y estados | «Consultar por este servicio»; «Ver más»; estados largos | «Consultar este trabajo»; «Ver descripción completa»; carga, vacío, error y búsqueda sin resultados más claros | Distingue consulta de compra y mejora la orientación. Nombres, precios, descripciones y `ctaText` remotos siguen intactos. |
| Panel de WhatsApp / formulario obligatorio | Explicación breve y label «Tu situación» | Explica que unas líneas ayudan a entender la situación; pregunta, placeholder y «Continuar a WhatsApp» | Explica la solicitud antes de abrir WhatsApp. La validación mínima y el flujo de envío no cambian. |
| Formspree / conversión secundaria | «También podés enviarme tu consulta…» | Explicita que es alternativa si se prefiere no abrir WhatsApp; «Enviar mi consulta» | Diferencia claramente el formulario del CTA principal. |
| Cómo trabajamos / proceso | Pasos en plural y repetitivos | Pasos en primera persona: situación, opciones, explicación, acompañamiento | Refleja una voz personal y aporta información distinta en cada paso. |
| Tarot / explicación | «Conecta con tu destino»; tuteo; «Resuelve una duda» | Voseo y descripciones exploratorias sin predicción asegurada | Coherencia de tono y alcance prudente de las lecturas. |
| FAQ / orientación y SEO | No explica cómo elegir; respuestas visibles y schema divergentes | Preguntas sobre elección y primer mensaje; schema generado de las mismas respuestas visibles | Responde dudas previas a la consulta y evita dos versiones de las respuestas. |
| Cierre / CTA | «Contame mi caso» | «Consultar por WhatsApp» | Cierra con una acción inequívoca. |

## Diccionario breve

- **Situación**: lo que la persona está viviendo; se usa en el mensaje libre. **Consulta**: el contacto o la pregunta. **Trabajo** y **lectura**: opciones ofrecidas, según corresponda.
- **Orientación**: conversación para evaluar opciones, sin prometer un resultado. **WhatsApp**: canal principal, abierto solo después de escribir una situación válida. **Formulario**: alternativa para dejar datos y consulta.
- Voseo rioplatense y primera persona singular para la voz de Cristal Sagrado.

## Límites y puntos para confirmar

- Los testimonios son citas atribuidas; no se reescribieron ni se verificó su origen. «Voces reales» se suavizó a «Experiencias compartidas». Conviene confirmar autorización y procedencia antes de usarlos como prueba comercial.
- No hubo acceso a Firestore para revisar nombres, descripciones, precios, promesas o CTA comerciales vigentes. Revisar esos textos en una auditoría de contenido remoto sin escribir en la base.
- La FAQ ya afirmaba duración de lecturas, videollamadas y reprogramación con 24 horas. Se conservaron esas condiciones existentes; confirmar su vigencia con quien atiende antes de publicarlas como política actual.
- Los HTML legacy son redirects con fallback breve. Se conservaron sus destinos y textos funcionales. No se cambiaron las etiquetas de eventos ni atributos de contexto, rutas, paleta, imágenes o estructura de Home.

## Verificación local

- `npm test`: 37 tests aprobados. `npm run build`: 8 rutas generadas. `git diff --check`: sin errores.
- Chrome headless con `scripts/qa-copy.mjs`: 64 combinaciones de 8 rutas y 8 anchos (320, 360, 390, 430, 768, 1024, 1366 y 1440 px), sin overflow horizontal, CTA principales partidos, H1 duplicados ni enlaces directos a `wa.me`. En Home se comprobó que Formspree bloquea el envío vacío y que el panel de WhatsApp abre, exige una situación y cierra.
- `scripts/qa-hero.mjs`: disposición del Hero y CTA aprobada en los anchos de su propia matriz. La QA de Chrome no sustituye pruebas en Safari iOS o Instagram WebView ni confirma la entrega externa de Formspree o WhatsApp.
