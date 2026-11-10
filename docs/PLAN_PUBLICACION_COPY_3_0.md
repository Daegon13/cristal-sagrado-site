# Plan de publicación futura del copy 3.0

**Diseño, no ejecución.** Las 52 propuestas están `PENDIENTE_APROBACION`; esta rama no escribe en Firestore, no sincroniza el snapshot ni despliega la web. La aplicación requiere una autorización posterior que identifique exactamente los IDs y campos aprobados. La aprobación de un texto no implica aprobar automáticamente las demás propuestas de ese registro.

## Contrato de entrada de la herramienta futura

Preparar una herramienta local de uso único, fuera de las rutas públicas y del admin, que reciba un manifiesto versionado y revisado por Lucía:

```json
{
  "sourceSha256": "f135837c794da7f8b66b767d8444d227516777bbf6e1d5dce449dce65ae1aab2",
  "approved": [
    { "id": "ID_EXACTO_DE_FIRESTORE", "fields": ["descriptionShort", "descriptionLong", "idealFor", "benefits", "intent", "notFor"] }
  ]
}
```

El ejemplo es un esquema, **no una lista aprobada**. Rechazar IDs repetidos, inexistentes o no activos, campos fuera de la lista y cualquier propuesta cuyo estado no haya pasado por aprobación humana. No usar posición, nombre, slug, categoría ni coincidencia parcial para seleccionar documentos. Rechazar registros críticos sin resolución editorial expresa. Cada elemento debe poder aprobarse por campo; `notFor` vacío no obliga a escribir ese campo.

## Secuencia controlada

1. **Lectura fresca y respaldo previo.** Leer cada documento remoto por ID exacto con metadatos de versión del documento. Exportar el documento completo y el momento de lectura a un archivo local privado e ignorado por Git, con hash y permisos adecuados. No incluir credenciales en el repositorio. El backup actual de `.local/copy-audit-2026-11-10/` preserva el snapshot público original, pero no sustituye este respaldo remoto completo.
2. **Verificación de concurrencia.** Comparar los campos originales auditados con la lectura fresca. Si difieren, detener ese ID y pedir nueva revisión. Guardar el token de versión remoto (`updateTime` del documento) y exigir una precondición de versión en la escritura para que una edición entre el dry-run y la aplicación no sea sobreescrita. `updatedAt` del contenido y el hash del snapshot, por sí solos, no son controles de concurrencia suficientes.
3. **Dry-run obligatorio.** Mostrar por ID y campo el valor anterior, el propuesto, longitud, diferencia y token de versión, sin escribir. Ocultar datos privados ajenos al copy en reportes compartibles. Marcar como `SIN_CAMBIO` los campos ya iguales. Requerir revisión del reporte exacto y confirmación de que corresponde a la lista aprobada antes de habilitar modo de aplicación en una sesión posterior.
4. **Aplicación limitada.** Escribir únicamente los campos aprobados mediante máscara de actualización. No tocar `name`, `category`, `slug`, `price`, `order`, `active`, `featured`, `ctaText`, otros campos o subcolecciones. Ejecutar de forma secuencial o con concurrencia acotada y precondición por documento. No reintentar una falla de versión a ciegas. Evitar escrituras cuando todos los campos aprobados ya coinciden.
5. **Resultado auditable.** Guardar un reporte local con `APLICADO`, `SIN_CAMBIO`, `CONFLICTO`, `ERROR` o `NO_APROBADO` por ID, campo, versión anterior/nueva y hora. No imprimir credenciales ni datos de consultas privadas. Un error parcial detiene las aplicaciones restantes; no se declara éxito global.
6. **Recuperación.** Releer cada ID aplicado o fallido. Si se necesita revertir, preparar otro dry-run con los valores del respaldo, limitado a los mismos campos y condicionado a la versión actual. No restaurar documentos completos, porque ello podría borrar cambios legítimos de otra persona. La nueva aplicación o reversión también requiere revisión y autorización explícita.
7. **Distribución y QA posteriores.** Una vez aprobada y completada la escritura, ejecutar la sincronización pública existente, revisar diff del snapshot por ID y campo, y correr tests y build de Astro. Verificar tarjetas, filtros, precios mostrados, CTA de WhatsApp, fichas SEO, metadatos y enlaces en móvil y escritorio. La escritura remota, la sincronización, el despliegue y la verificación de producción son hitos distintos. No desplegar sin autorización separada.

## Controles de acceso y límites

La herramienta debe reutilizar un mecanismo de acceso ya autorizado para la persona operadora; esta fase no crea credenciales administrativas, reglas nuevas ni secretos. La consulta pública usada en la auditoría es **solo lectura** y no es un mecanismo para escribir. Si el mecanismo autorizado no puede obtener el token de versión o aplicar una escritura condicionada, la herramienta debe fallar y no usar una actualización sin precondición. Los documentos de esta rama son insumos editoriales, no instrucciones automáticas de publicación.
