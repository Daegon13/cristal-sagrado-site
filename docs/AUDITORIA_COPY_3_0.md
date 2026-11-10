# Auditoría editorial y comercial del catálogo 3.0

**Estado:** propuesta local, pendiente de aprobación de Lucía. **Base:** rama `feat/cristal-sagrado-3-0` de PR #14, commit `6053cc0`; 52 servicios activos del snapshot `src/data/generated/services.public.json` (SHA-256 `f135837c794da7f8b66b767d8444d227516777bbf6e1d5dce449dce65ae1aab2`). Se creó una rama editorial independiente. El respaldo byte a byte está en `.local/copy-audit-2026-11-10/services.public.original.json`, ignorado por Git. No hay escrituras a Firestore ni cambios en el snapshot o la web pública.

## Evidencia y alcance

El 2026-11-10 se leyó Firestore mediante la consulta pública de solo lectura de `scripts/sync-public-services.mjs`; los 52 registros activos normalizados coincidían en ese momento con el snapshot. **Esto no certifica el estado futuro de Firestore.** El snapshot contiene 52 IDs únicos, 18 trabajos de magia roja, 20 de blanca, 9 de verde y 5 de negra. En los 52, `descriptionShort` y `descriptionLong` son idénticas. El promedio de la descripción actual es **1463,13 caracteres** y **42** superan los 1000. `intent`, `idealFor`, `benefits` y `notFor` están vacíos en los 52.

Se revisaron el modelo público de Firestore, la proyección de campos del sincronizador, el normalizador, el formulario admin, las tarjetas del catálogo, las fichas SEO, el flujo de WhatsApp y los tests. La tarjeta usa `descriptionShort` y muestra `intent`, `idealFor` y `benefits` cuando existan; las fichas usan el texto largo. El flujo de WhatsApp incluye el nombre del trabajo en la consulta y la persona puede describir su situación. Por eso, un texto corto realmente breve y una distinción comprensible antes del clic pueden mejorar la selección, aunque **no hay prueba de efecto en conversiones** en esta auditoría. No se midió comportamiento real de visitantes.

La fuente pública no expone duración. Tampoco permite verificar materiales, pasos, modalidad, requisitos ni justificación de diferencias de precio en la mayoría de los trabajos. Se conservaron los nombres, IDs, categorías, slugs, precios, orden y estado. Las propuestas no convierten un nombre ritual en prueba de procedimiento. Donde el original menciona un plano de vivienda, hierbas, perfume, baño o velas, se pide confirmar si son materiales o condiciones reales.

## Diagnóstico por gravedad

| Gravedad editorial | Registros | Hallazgo y acción |
| --- | ---: | --- |
| Crítica | 19 | Promesas de salud humana o animal, control de voluntad/consentimiento, o daño a terceros detectadas en la revisión semiautomática de los problemas individuales. Revisión expresa de Lucía; los servicios de daño y dominio requieren decisión ética sobre su oferta, no solo un ajuste de estilo. |
| Alta | 22 | Solapamiento comercial o falta de diferencia verificable; precio distinto no justifica inventar un proceso. Pedir explicación de práctica, destinatario y límites. |
| Media | 11 | Exceso de longitud, promesas generales o ausencia de información práctica aun cuando la situación de consulta se entiende mejor. Validar texto y condiciones. |

La clasificación es una **prioridad editorial**, no una calificación legal o médica. Algunos registros presentan varios problemas; la tabla usa una sola severidad por registro. La prioridad crítica se activa por términos de riesgo en el problema o duda documentada y se revisó manualmente en la segunda pasada. Ver el detalle de los ocho criterios y la justificación de cada trabajo en `PROPUESTAS_COPY_3_0.json`.

## Calificación general del catálogo actual

**2,13/5**, promedio simple de 8 dimensiones × 52 servicios, juicio editorial de esta auditoría. No es una métrica de rendimiento comercial. La rúbrica puntúa de 1 (déficit serio) a 5 (bien resuelto) claridad, diferenciación, extensión adecuada, ayuda para convertir, credibilidad, seguridad comunicacional, identidad de marca y calidad de información. Las medias son:

| Dimensión | Media /5 | Lectura |
| --- | ---: | --- |
| Claridad | 2,19 | El propósito suele aparecer, pero después de rodeos. |
| Diferenciación | 1,81 | Varios nombres comparten la misma situación de consulta. |
| Extensión | 1,87 | Los dos campos repiten textos largos. |
| Conversión | 2,40 | Falta ayuda para elegir entre variantes. |
| Credibilidad | 1,63 | Hay resultados absolutos y afirmaciones no verificadas. |
| Seguridad comunicacional | 2,27 | Salud, consentimiento y daño necesitan límites claros. |
| Identidad de marca | 3,85 | Hay símbolos y tono esotérico; ocho servicios carecen de una finalidad segura verificable. |
| Calidad de información | 1,00 | No constan pasos, duración o condiciones verificadas en la fuente pública. |

La rúbrica no utiliza precio como señal de calidad. El campo de información se califica bajo por la falta de datos verificables, **no porque la duración deba publicarse**: el contrato público actual la excluye. La puntuación es conservadora y sus razones individuales permiten que Lucía la discuta.

## Criterios aplicados a las propuestas

- 52 textos cortos de **149–185** caracteres y 52 largos de **583–687**; cada par es distinto y parte de la situación de consulta y de la identidad simbólica del trabajo.
- `idealFor` contiene 2 situaciones concretas en 44 registros. En 8 trabajos de dominio o daño, `idealFor` y `benefits` quedan vacíos: no hay situación de uso ni beneficio seguros y verificables para proponer sin aclaración. En los demás, `benefits` describe el enfoque simbólico o una característica declarada, sin prometer resultados externos. `intent` usa etiquetas de consulta. `notFor` se deja vacío cuando no aporta una advertencia específica.
- No se introducen duración, técnica, materiales, modalidades, requisitos, precios ni efectos garantizados como hechos nuevos. Los campos actuales de producción no se modifican.
- El lenguaje de magia negra y de dominio se conserva como contexto del nombre, pero las variantes que describen coerción o perjuicio quedan **pendientes de decisión expresa**. El borrador evita vender daño o control como eficacia comprobada.
- No hay equivalencia documentada entre `Encuentro & Reencuentro` y un supuesto servicio `Retorno de Pareja`: este último no figura entre los 52 registros activos.

## Decisiones pendientes de Lucía

1. Confirmar si los grupos marcados `REQUIERE ACLARACIÓN COMERCIAL` son ofertas diferentes y explicar en qué cambia la práctica. No atribuir la diferencia al precio.
2. Decidir el tratamiento de los servicios de control, separación y daño: permanencia en catálogo, alcance, límites y formulación admisible. El texto propuesto de esos registros es un marcador de revisión, no una recomendación de publicación automática.
3. Confirmar materiales y condiciones de baños, hierbas, perfume, amuleto, velas y Protección del Hogar (incluida la mención del plano y sus implicancias de privacidad).
4. Confirmar si la limpieza es requisito previo del sellado, si `Encuentro & Reencuentro` abarca encuentros nuevos y quién participa en trabajos sobre vínculos o familia.
5. Aprobar o corregir por ID cada texto y campo estructurado. Releer las fichas SEO y tarjetas con los textos ya aprobados antes de una futura sincronización.

## Segunda auditoría editorial

Una revisión posterior al primer borrador comprobó la cobertura de los cuatro grupos, la unicidad de enfoque narrativo, la ausencia de precios/duraciones nuevos, el trato de salud y consentimiento y la trazabilidad de cada duda. Se corrigió la tentación de interpretar términos como `baño`, `perfume`, `amuleto` o `sellado` como procedimientos confirmados; el borrador pide validarlos. También se dejaron vacíos `idealFor` y `benefits` en ocho servicios de dominio o daño, donde el primer borrador proponía orientaciones artificiales. Se mantuvo como pendiente toda diferencia técnica no documentada. La revisión automatizada complementaria está en `tests/copy-proposals.test.mjs`; no mide persuasión ni sustituye la decisión humana.

## Navegación del paquete

- `PROPUESTAS_COPY_3_0.json`: datos originales, propuestas y ocho puntuaciones justificadas de los 52 IDs.
- `REVISION_HUMANA_COPY_3_0.md`: tabla completa y comparación integral por servicio.
- `MATRIZ_DIFERENCIACION_3_0.md`: grupos, solapamientos y preguntas para Lucía.
- `PLAN_PUBLICACION_COPY_3_0.md`: diseño de aplicación futura, sin ejecución.
