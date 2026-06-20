# Modelo Firebase — Cristal Sagrado

## Proyecto

La configuración pública está en `admin/config.js`. Las claves web de Firebase no son secretas, pero las reglas de Firestore y Auth son críticas.

## Colección `services`

Documentos usados por las páginas públicas y el panel admin.

Campos actuales observados/soportados:

- `name` o `title` (`string`): nombre visible del servicio.
- `description` (`string`): descripción pública.
- `category` (`string`): `roja`, `blanca`, `negra` o `verde`.
- `active` (`boolean`): si aparece en el sitio público.
- `order` (`number`): orden manual dentro de la categoría.
- `price` (`number|null`): precio opcional.
- `duration` (`number|null`): duración opcional en días.
- `updatedAt` (`string ISO`): fecha de última edición desde admin.

Campos recomendados para FASE 3, compatibles hacia atrás:

- `slug` (`string`)
- `descriptionShort` (`string`)
- `descriptionLong` (`string`)
- `intent` o `tags` (`string[]`)
- `benefits` (`string[]`)
- `idealFor` (`string[]`)
- `featured` (`boolean`)
- `ctaText` (`string`)

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

El frontend no puede proteger escrituras por sí solo. Firestore Rules deben permitir lectura pública donde corresponda y escrituras solo a admins autenticados.

Checklist mínimo:

- `services`: `allow read: if true; allow write: if isAdmin();`
- `settings`: `allow read: if true; allow write: if isAdmin();`
- Nunca usar `allow write: if true;`.
- Preferir custom claims `admin=true` o whitelist de emails en Rules.

## Render seguro

- Público: `assets/js/data.js` crea nodos y usa `textContent` para datos remotos.
- Admin: evitar interpolar campos remotos sin sanitizar. Si se usa `innerHTML`, solo debe contener estructura estática y los valores remotos deben setearse luego con `textContent`.
