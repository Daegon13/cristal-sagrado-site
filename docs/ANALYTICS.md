# Analítica y reporte semanal

La web pública envía mediciones agregadas a Umami self-hosted. Sin las dos variables públicas del tracker, el sitio compila y no carga analytics.

```text
Cristal Sagrado → tracker Umami → Umami self-hosted → Neon PostgreSQL
Umami API → GitHub Actions → Resend → correo semanal
```

La instrumentación del sitio conserva sus eventos y filtros de privacidad. No se envían texto libre, datos de formulario ni IDs propios. `/admin/` y las previews siguen fuera de la medición.

## Instrumentación pública

El layout agrega el tracker solo cuando ambas variables tienen valor:

- `PUBLIC_UMAMI_WEBSITE_ID`: Website ID de la instancia.
- `PUBLIC_UMAMI_SCRIPT_URL`: URL del script, por ejemplo `https://analytics.example.com/script.js`.

No hay URL de proveedor por defecto. Si falta cualquiera, no se carga el tracker. En `Settings → Secrets and variables → Actions → Variables` del repositorio, definir ambas variables públicas para el build de producción. Son públicas porque terminan en el navegador. El workflow de preview no las pasa al build.

Eventos existentes:

| Evento | Significado |
| --- | --- |
| `wa_open` | Se abrió el diálogo de consulta. |
| `wa_case_valid` | Se validó el caso y se pulsó continuar. |
| `wa_outbound` | Salida desde la web a WhatsApp; es un **lead web WhatsApp**, no una venta. |
| `intent_click` | Se eligió una intención. |
| `service_detail` | Se expandió un servicio. |
| `service_wa` | Se eligió el CTA de WhatsApp de un servicio. |
| `form_submit` | Se intentó el envío de un formulario válido; el contenido no se registra. |
| `nav_cta` | Se eligió un CTA comercial. |

Las propiedades son metadata comercial definida por el sitio (`page`, `cta_location`, `category`, `service`, `intent`). Solo se conservan los UTM estándar `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` y `utm_term`. Se respeta Do Not Track y no se usa `umami.identify()`.

## API y versión

El script usa la API REST self-hosted con `Authorization: Bearer <API key>`. Las API keys self-hosted están disponibles desde Umami 3.4; crear una en el perfil de Umami → Settings → API keys y conceder acceso de lectura al Website. No se usa usuario/contraseña de administrador.

Endpoints oficiales consultados por el reporte (todos bajo `${UMAMI_API_BASE}`):

- `GET /websites/{websiteId}/stats` — visitantes, visitas/sesiones y pageviews.
- `GET /websites/{websiteId}/metrics?type=event` — conteos de eventos.
- `GET /websites/{websiteId}/metrics?type=referrer`, `path`, `entry`, `device` — origen, páginas, landing pages y dispositivo.
- `GET /websites/{websiteId}/event-data/values?event=...&propertyName=...` — valores agregados de `service`, `category`, `intent`, `cta_location` por evento. Umami cambió `eventName` por `event`; el cliente usa el parámetro vigente.
- `GET /websites/{websiteId}/utm/metrics?type=...` — fuente, campaña y contenido UTM; además se consulta `utm_campaign` filtrando `event=wa_outbound` y `eventType=2`.

Las consultas pasan `startAt`/`endAt` como timestamps Unix en milisegundos y `timezone=America/Montevideo`. Antes de consultar dimensiones y eventos, se hace un único `GET /websites/{websiteId}/stats` autenticado. Si falla, no se lanzan las consultas del informe. No se solicita el endpoint de eventos individuales ni se exportan filas con IDs, IP o user-agent. Los errores 401 (API key), 403 (permisos) y 404 (endpoint o Website ID) se distinguen sin imprimir credenciales.

## Informe y atribución

El workflow `.github/workflows/weekly-analytics-report.yml` corre los lunes a las 12:00 UTC (09:00 en Uruguay) y también se puede iniciar con `workflow_dispatch`. Usa Node 22. Cada período va desde lunes 00:00 hasta el lunes siguiente 00:00 en `America/Montevideo`; los límites se convierten a timestamps Unix. El período actual son los siete días completos inmediatamente anteriores al lunes de ejecución y el comparativo son los siete días previos, sin solapamiento. Las fechas del correo son fechas civiles de Uruguay.

El funnel muestra conteos de eventos agregados:

1. `wa_open / visitantes`.
2. `wa_case_valid / wa_open`.
3. `wa_outbound / wa_case_valid`.
4. `wa_outbound / visitantes` (rotulado “salidas a WhatsApp / visitantes”).

No son porcentajes de visitantes únicos convertidos: un visitante puede generar varios eventos. División por cero o falta de base se presenta como “Sin datos”. Los cambios de métricas de conteo son porcentajes relativos; los cambios de ratios se muestran en puntos porcentuales. No hay valores inventados. Menos de cinco `wa_outbound` muestra una advertencia de muestra pequeña.

El email incluye tráfico, embudo, comparación semanal, fuentes/referrers, páginas, dispositivos, UTM, servicios, intenciones, CTA y observaciones deterministas. Campaign leads solo cuenta `wa_outbound` con UTM campaña disponible. No produce rankings vacíos. No contiene texto de caso, nombres, teléfonos, emails de clientes, mensajes Formspree, IP, user-agent individual, ID individual o datos privados de Firebase. “Lead web WhatsApp” significa salida a WhatsApp y no confirma conversación, venta, cliente ni compra.

## Configurar GitHub Actions

En el repositorio, abrir `Settings → Secrets and variables → Actions`.

En **Variables**, crear:

- `PUBLIC_UMAMI_WEBSITE_ID` — Website ID público.
- `UMAMI_API_BASE` — base API self-hosted, por ejemplo `https://analytics.example.com/api` (sin una ruta de website).

`PUBLIC_UMAMI_SCRIPT_URL` también se crea como **Variable** para el tracker. No usar GitHub Secrets para ninguno de estos valores públicos.

En **Secrets**, crear:

- `UMAMI_API_KEY` — API key Umami self-hosted con acceso de lectura.
- `RESEND_API_KEY` — key de Resend limitada al envío si está disponible.
- `REPORT_RECIPIENT_EMAIL` — destinatario del informe.
- `REPORT_FROM_EMAIL` — remitente verificado en Resend.

No guardar estos valores en el repositorio ni imprimirlos en logs. La key de Umami y las credenciales Resend solo se entregan al paso Node de Actions; nunca al build Astro ni al navegador.

## Ejecución y operación

- **Dry run:** `Actions → Weekly analytics report → Run workflow`, dejar `dry_run=true`. Consulta Umami y genera el texto/HTML para validar cálculos, pero no llama a Resend. El log imprime solo período y resumen agregado seguro.
- **Envío manual real:** ejecutar el workflow y seleccionar `dry_run=false`. Requiere las cuatro secrets de Resend más las variables/secreto de Umami. Si Resend falla, la ejecución falla con código HTTP y un mensaje genérico saneado.
- **Cambiar destinatario/remitente:** actualizar `REPORT_RECIPIENT_EMAIL` o `REPORT_FROM_EMAIL` en Secrets.
- **Cambiar horario:** editar el cron UTC en `weekly-analytics-report.yml`. GitHub Actions usa UTC; 12:00 UTC corresponde a 09:00 en Uruguay en la fecha actual.
- **Verificar recepción de analytics:** revisar Realtime/Events en Umami y probar el diálogo/CTA desde `https://cristal-sagrado.com`; inspeccionar Network para confirmar la URL de script configurada. Verificar que previews, rutas `/admin/` y Do Not Track no generen mediciones.
- **Desactivar analytics:** borrar o dejar vacía `PUBLIC_UMAMI_WEBSITE_ID` o `PUBLIC_UMAMI_SCRIPT_URL` en las Variables de Actions y desplegar. La web sigue compilando sin cargar tracker.

Las pruebas locales están en `tests/analytics.test.mjs` y `tests/weekly-analytics-report.test.mjs` (`npm test`). `npm run weekly-analytics-report` se ejecuta en Actions; localmente requiere las variables server-side indicadas. Para no enviar email, definir `DRY_RUN=true`. El primer correo compara la semana completa previa con la inmediatamente anterior; si el sitio aún no tenía tráfico o eventos en esas fechas, mostrará "Sin datos suficientes para este período" y cero métricas, sin fallar por ausencia de actividad.
