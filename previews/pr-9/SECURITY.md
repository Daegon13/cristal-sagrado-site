# SECURITY — Cristal Sagrado

Este proyecto es un sitio público estático con un panel `/admin` que administra datos en Firestore.
La seguridad real no se basa en ocultar el panel ni en validaciones de frontend: se basa en reglas de Firestore/Auth y en evitar XSS.

## 1) Modelo de amenazas (mínimo)

Activos a proteger:
- Escrituras en Firestore (services/settings) que afectan contenido del sitio.
- Cuentas admin (Firebase Auth).

Amenazas típicas:
- Rules permisivas (writes desde cualquier cliente).
- Credenciales robadas (phishing/contraseñas débiles).
- Inyección de HTML/JS en descripciones (XSS) si alguien logra escribir en Firestore.

Regla de oro:
- Web pública puede ser pública.
- Panel puede ser visible.
- Rules y render seguro no pueden fallar.

## 2) Firestore Rules (mínimo viable)

La allowlist del frontend (por ejemplo `ALLOWED_EMAILS`) ayuda a UX, pero NO es seguridad.

Opción A (rápida): whitelist de emails en Rules
- Bien para 2–5 admins.

Ejemplo (adaptar emails):
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && request.auth.token.email in [
          "admin1@dominio.com",
          "admin2@dominio.com"
        ];
    }

    match /services/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /settings/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

Opción B (mejor práctica): Custom Claims `admin=true`

Rules:
```js
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}
```

Checklist Rules:
- Prohibido: `allow write: if true;`
- Prohibido: confiar en “isAdmin” definido solo en frontend.

## 3) XSS (crítico)

Si el frontend renderiza `title/description` desde Firestore usando `innerHTML` con template strings, existe XSS.

Mitigación recomendada:
- Renderizar con `textContent` por defecto.
- Si se requiere formato, usar sanitización robusta o Markdown seguro.

## 4) Respuesta ante incidentes (si hay sospecha)

1) Cambiar contraseñas de admins y revisar accesos.
2) Endurecer Rules (bloquear writes si es necesario).
3) Revisar docs en `services/settings` buscando contenido malicioso.
4) Desplegar patch de render seguro (textContent) si no existe.
