# Revisión comercial de servicios (snapshot de build)

Fuente: `src/data/generated/services.public.json`, sincronizada desde Firestore. Precios publicados en la snapshot, sujetos a confirmación por Lucía; no son un tarifario nuevo. La categoría puede mostrar datos vivos de Firestore que difieran.

| Categoría | Servicio publicado | Precio en snapshot |
| --- | --- | ---: |
| roja | El Lazo Carmesí 🃏🔮📜✨ | $4500 |
| roja | 🔮✨ El Espejo de Lilith | $5000 |
| roja | ❤️🔥 El Corazón de Canela | $4500 |
| roja | 🔥🔴 El Nudo Ardiente | $5500 |
| roja | 🍷🔥 El Encendido del Vino | $5000 |
| roja | 🌹🌙 La Rosa de Medianoche | $5000 |
| roja | 🌸✨ El Perfume de Venus | $5000 |
| roja | ❤️🔥 El Doble Corazón Encendido | $4500 |
| roja | 🔥✨ La Llama Gemela | $5600 |
| roja | 💋✨ El Beso Encantado | $4500 |
| roja | ❤️‍🔥✨ Amarre de Amor Total – Alma y Cuerpo | $7000 |
| roja | 🔥💋 Amarre Sexual | $5000 |
| roja | 🖤🔥 Amarre Mental y Dominio Sexual | $7000 |
| roja | 🖤🔗 Amarre de Sumisión | $6500 |
| roja | 🖤🧠 Dominio Total Mental y Emocional | $5000 |
| roja | 🍯✨ Endulzamiento Fuerte | $4000 |
| roja | 🌑🔥 Ritual de Amor con Lilith | $7000 |
| roja | 🌸💖 Ritual de Amor y Seducción con Afrodita | $7000 |
| blanca | ☀️✨ Invocación de Energía Solar ✨☀️ | $2400 |
| blanca | ✨💫 Círculo de Sanación 💫✨ | $3500 |
| blanca | ✨🕊️ Baño de Luz Protectora 🕊️✨ | $3000 |
| blanca | 🌙✨ Protección del Sueño ✨🌙 | $3000 |
| blanca | 🌞🌈 Ritual de Alegría y Optimismo 🌈🌞 | $1500 |
| blanca | 🌸🏠 Ritual de Armonía Familiar 🏠🌸 | $5000 |
| blanca | 🌸🕊️ Ritual de Paz Interior 🕊️🌸 | $2500 |
| blanca | 🌸🙏 Ritual de Gratitud 🙏🌸 | $4500 |
| blanca | 🌿💭 Ritual de Purificación de Pensamientos y Sanación Interna 💭🌿 | $3000 |
| blanca | 🌿🛁 Baño de Despojo con Hierbas 🛁🌿 | $2000 |
| blanca | 🍀✨ Amuleto de la Suerte ✨🍀 | $3000 |
| blanca | 🏠✨ Protección del Hogar ✨🏠 | $7000 |
| blanca | 🐾✨ Ritual de Luz para Mascotas ✨🐾 | $2000 |
| blanca | 👼✨ Invocación a los Ángeles Guardianes ✨👼 | $3000 |
| blanca | 💖🕊️ Ritual del Perdón 🕊️💖 | $2000 |
| blanca | 💞✨ Trabajo de Unión Espiritual ✨💞 | $2500 |
| blanca | 💰🌟 Trabajo de Prosperidad 🌟💰 | $3000 |
| blanca | 🔑✨ Ritual de Apertura de Caminos ✨🔑 | $4000 |
| blanca | 🕯️✨ Encendido de Velas Blancas ✨🕯️ | $3000 |
| blanca | 🧠✨ Ritual de Claridad Mental ✨🧠 | $2500 |
| verde | Abrecaminos Verde 🌿🛤️🚪✨ | $4500 |
| verde | Armonización de Pareja🌹✨💞 | $5000 |
| negra | Ataduras y vínculos 🕯️🕸️🩸💀 | $6000 |
| verde | Cierre de Ciclo Amoroso 🌙✂️🕯️🍃 | $3500 |
| negra | Cierre total de caminos. ⚫🚫🕳️⛓️ | $7000 |
| verde | Encuentro & Reencuentro 💌🤝🔄✨ | $4000 |
| verde | Firma & Cierre de Acuerdos 🖊️📄🤝✅ | $4000 |
| verde | Imán de Clientes (Emprendimientos) 🧲🛍️📣💼 | $3500 |
| verde | Limpieza Energética Personal 🧿🌬️🕯️✨ | $4000 |
| negra | Maldiciones o Maleficios 💀🦂🕷️🦴 | $7000 |
| verde | Protección de Negocio 🏪🛡️🔐📊 | $4000 |
| verde | Protección del Aura (Sellado) 🛡️🔒🕯️✨ | $4000 |
| negra | Separación de parejas 💔 🖤 😞 😢 | $5500 |
| negra | Trabajos de enfermedad / desgaste ☠️⚰️🥀😵‍💫 | $5000 |

## Inconsistencias y decisiones pendientes

- La comunicación externa menciona «Retorno de pareja»; el catálogo incluye «Encuentro & Reencuentro». No se ha verificado equivalencia. Confirmar la denominación con Lucía antes de crear alias o campaña específica.
- Verificar la vigencia de los 52 precios en Firestore y aprobar cualquier cambio en la fuente antes de sincronizar. Las fichas SEO toman el precio de la snapshot; las tarjetas de categoría pueden actualizarse con Firestore en vivo.
- Confirmar duración, modalidad, materiales, condiciones, informe o registro por servicio. La snapshot no tiene campos específicos para esos datos.
- Revisar descripciones con afirmaciones de efecto inmediato, control de terceros o síntomas de salud; se conservan de la fuente actual sin ampliar promesas en el trabajo 3.0.
- Confirmar si se mantienen todos los servicios activos y sus nombres públicos, especialmente los que puedan generar dudas éticas o de alcance.
