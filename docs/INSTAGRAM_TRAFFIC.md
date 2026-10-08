# Tráfico de Instagram

Usá un enlace directo al contenido que promete la publicación. Un post o story sobre un trabajo va a la landing de ese servicio. Un reel educativo va a una guía si responde una pregunta; si la intención es consultar un trabajo concreto, va a la landing. La bio puede apuntar a Home o a una página principal de campaña. No hace falta Linktree mientras una URL propia cubra esa necesidad.

## Convención UTM

- `utm_source=instagram`.
- `utm_medium`: `bio`, `story`, `reel` o `post`.
- `utm_campaign`: tema corto, en minúsculas y con guiones bajos, por ejemplo `educacion_amor`.
- `utm_content`: variante de la publicación, por ejemplo `amarre_vs_endulzamiento` o `story_01`.

No incluyas nombres, teléfonos, correos, texto de casos ni identificadores personales. La herramienta normaliza minúsculas, acentos y espacios; rechaza rutas no publicadas y etiquetas de aspecto privado. La ruta debe ser Home, `/guias/`, una guía publicada o una landing de la allowlist.

Desde PowerShell:

```powershell
npm run campaign-link -- --path /guias/amarre-vs-endulzamiento/ --source instagram --medium reel --campaign educacion_amor --content amarre_vs_endulzamiento
```

Resultado:

```text
https://cristal-sagrado.com/guias/amarre-vs-endulzamiento/?utm_source=instagram&utm_medium=reel&utm_campaign=educacion_amor&utm_content=amarre_vs_endulzamiento
```

Otro ejemplo para una story sobre limpieza:

```powershell
npm run campaign-link -- --path /magia-verde/limpieza-energetica-personal/ --source instagram --medium story --campaign limpieza_octubre --content story_01
```

El flujo del reel es: Instagram → guía de diferencia entre amarre y endulzamiento → landing de un servicio real → CTA de WhatsApp → descripción obligatoria del caso → WhatsApp. La salida se mide como **lead web WhatsApp**, no como venta. Revisá visitas y eventos por ruta y UTM en Umami y contrastá búsquedas orgánicas en Search Console después del deploy.
