# Modelo Firebase — Cristal Sagrado

## Proyecto

La configuración pública está en `admin/config.js`. Las claves web de Firebase no son secretas; la seguridad real depende de Firebase Auth, Firestore Rules y render seguro en frontend.

## Colección `services`

Documentos usados por las páginas públicas de categorías y el panel `/admin`.

### Modelo actual soportado

Los documentos existentes pueden seguir usando únicamente estos campos:

- `name` o `title` (`string`): nombre visible del servicio.
- `category` (`string`): `roja`, `blanca`, `negra` o `verde`.
- `description` (`string`): descripción pública principal.
- `price` (`number|string|null`): precio opcional. El frontend público lo normaliza a número válido o `null`.
- `duration` (`number|string|null`): duración opcional en días. El frontend público la normaliza a número válido o `null`.
- `order` (`number|string`): orden manual dentro de la categoría.
- `active` (`boolean`): si aparece en el sitio público.

El admin actual continúa editando el modelo existente y no requiere migración destructiva para que el sitio público funcione.

### Modelo v2 opcional preparado en FASE 3A

Todos los campos nuevos son opcionales y compatibles hacia atrás:

- `slug` (`string`): identificador legible para futuras URLs o analítica.
- `descriptionShort` (`string`): descripción breve para cards/listados.
- `descriptionLong` (`string`): descripción extendida para futuras vistas detalle o admin mejorado.
- `intent` (`string[]`): intenciones del usuario asociadas al servicio.
- `benefits` (`string[]`): beneficios comunicables en UI.
- `idealFor` (`string[]`): casos para los que el servicio es adecuado.
- `notFor` (`string[]`): límites o casos para los que no corresponde.
- `featured` (`boolean`): marca para priorizar destacados en grillas públicas.
- `ctaText` (`string`): mensaje personalizado para WhatsApp del servicio.
- `updatedAt` (`string`): fecha ISO de última edición.

### Defaults de compatibilidad pública

El render público normaliza cada documento antes de pintarlo:

- Si falta `descriptionShort`, usa `description`.
- Si falta `descriptionLong`, usa `description`.
- Si falta `slug`, genera uno en cliente desde `name`; no se guarda automáticamente en Firestore.
- Si falta `intent`, usa `[]`.
- Si falta `benefits`, usa `[]`.
- Si falta `idealFor`, usa `[]`.
- Si falta `notFor`, usa `[]`.
- Si falta `featured`, asume `false`.
- Si falta `active`, asume `true`.
- Si falta `order` o no es un número válido, ordena el servicio al final.
- Si falta `ctaText`, genera el mensaje: `Hola Luz, llego desde la web de Cristal Sagrado. Quiero consultar por [NOMBRE DEL SERVICIO]. Mi situación es:`.
- Los strings se convierten a strings limpios; los arrays se filtran a strings no vacíos; booleanos y números se validan con fallback seguro.

## Ordenamiento público

Las páginas públicas consultan por `category` y `active == true` para mantener el comportamiento actual. En cliente, los documentos normalizados se ordenan por:

1. activos primero;
2. destacados (`featured`) primero;
3. `order` ascendente;
4. `name` alfabético en español.

## CTA WhatsApp por servicio

El número se mantiene fijo en `59896106373`. Cada card de servicio genera una URL `https://wa.me/59896106373?text=...` con el mensaje encodeado. Si `ctaText` existe, se usa como override del mensaje.

## Documento `settings/site`

Configuración editable desde admin:

- `title`
- `subtitle`
- `primaryColor`
- `whatsapp`
- `email`
- `instagram`
- `heroImage`
- flags `show_services`, `show_faq`, `show_tarot`
- `updatedAt`

## Reglas de seguridad esperadas

No hay confirmación en este repositorio de que las reglas reales de Firebase Console estén aplicadas. Conceptualmente, las Firestore Rules deberían cubrir:

- Lectura pública de `services` solo para documentos activos si la UX pública no debe exponer inactivos.
- Lectura pública de `settings/site` si el sitio la necesita.
- Escritura en `services` y `settings` solo para usuarios autenticados y autorizados como administradores.
- Validación de tipos principales: `name`, `category`, `description`, `slug`, `ctaText` como strings; arrays v2 como listas de strings; `active` y `featured` como booleanos; `order`, `price`, `duration` como números cuando existan.
- Nunca usar `allow write: if true;`.
- Preferir custom claims `admin == true` o una whitelist controlada en Rules, no solo `ALLOWED_EMAILS` de frontend.

## Campos recomendados para FASE 3B admin

Para la siguiente fase, el formulario de `/admin` debería permitir editar sin romper documentos antiguos:

- `slug` con autogeneración sugerida desde `name`, editable manualmente.
- `descriptionShort` y `descriptionLong` separados.
- `intent`, `benefits`, `idealFor`, `notFor` como listas simples o textarea una línea por ítem.
- `featured` como checkbox.
- `ctaText` como textarea opcional con preview de WhatsApp.
- `updatedAt` automático al guardar.

## Render seguro

- Público: `assets/js/data.js` crea nodos DOM y usa `textContent` para datos remotos; no usa `innerHTML` con contenido de Firestore.
- Normalización pública: `assets/js/service-helpers.js` evita mutar el documento original y tolera datos parciales/corruptos.
- Admin: puede usar `innerHTML` solo para estructura estática; valores remotos deben insertarse con `textContent` o controles de formulario.

## FASE 3B.1 — Campos editables desde `/admin`

El panel `/admin` ya permite crear y editar el modelo legacy y los campos v2 opcionales en la misma colección `services`, sin migración destructiva ni backfill automático.

### Campos legacy conservados

- `name` (`string`): nombre visible principal. El render público sigue tolerando `title` en documentos antiguos.
- `category` (`string`): se asigna desde la categoría activa del admin (`?cat=roja|blanca|negra|verde`).
- `description` (`string`): descripción legacy.
- `price` (`number|null`): precio opcional normalizado desde input numérico.
- `duration` (`number|null`): duración opcional normalizada desde input numérico.
- `order` (`number`): orden manual dentro de la categoría.
- `active` (`boolean`): checkbox. En servicios nuevos queda marcado por defecto y se guarda como `true` salvo que el usuario lo desmarque.

### Campos v2 editables

- `slug` (`string`): editable. Si queda vacío al guardar, se genera desde `name`.
- `descriptionShort` (`string`): copy corto para cards/listados.
- `descriptionLong` (`string`): copy extendido opcional.
- `intent` (`string[]`): textarea, un ítem por línea.
- `benefits` (`string[]`): textarea, un ítem por línea.
- `idealFor` (`string[]`): textarea, un ítem por línea.
- `notFor` (`string[]`): textarea, un ítem por línea.
- `featured` (`boolean`): checkbox.
- `ctaText` (`string`): mensaje WhatsApp personalizado opcional.
- `updatedAt` (`string ISO`): se actualiza en cada guardado.
- `createdAt` (`string ISO`): se agrega al crear servicios nuevos; si un documento existente ya lo tiene, no se sobreescribe.

### Riesgo legacy conocido

Las páginas públicas consultan Firestore con `where("active", "==", true)`. Por eso, un documento legacy sin campo `active` no es devuelto por Firestore y el normalizador público no puede recuperarlo en cliente. FASE 3B.1 no ejecutó backfill ni modificó documentos existentes en lote. El panel muestra diagnóstico al editar y todo servicio nuevo queda con `active: true` por defecto.

### Backfill pendiente

Un backfill controlado para documentos legacy sin `active`, `slug` o campos recomendados queda propuesto para FASE 3B.2. Debe ser explícito, revisable y no destructivo.
