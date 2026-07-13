# Scaffold Astro M1 — Cristal Sagrado

> Estado: guía de mantenimiento del scaffold mínimo. M1 debe validar estructura, build estático y rutas base sin migrar la home ni tocar Firebase, Firestore, `/admin` funcional o producción.

## Alcance M1

- Mantener un scaffold Astro mínimo con `src/`, `public/`, `astro.config.mjs` y `package.json` solo cuando la rama de migración lo incluya.
- Usar una página placeholder estática para smoke test; la migración visual y funcional de la home queda para M2.
- No cargar Firebase ni Firestore desde el layout global, la home placeholder ni páginas informativas.
- No modificar el número de WhatsApp ni agregar dependencias innecesarias.

## Política de assets pesados

- M1 no debe incluir el video duplicado `public/images/Eclipse_small.mp4`.
- El video legacy original se conserva intacto en `images/Eclipse_small.mp4`.
- El video no fue procesado, abierto, comprimido, reemplazado ni convertido durante este cleanup; se trató únicamente como ruta de archivo.
- La integración del video en Astro debe hacerse de forma controlada en M2/M4, después de definir comportamiento responsive, `poster`, `preload="none"`, guardas de reduced-motion/reduced-data/saveData y verificación de network.
- Si `VideoBackground.astro` existe en M1, debe poder renderizar un fondo decorativo con poster/fallback sin solicitar agresivamente `/images/Eclipse_small.mp4` ni depender de un binario duplicado en `public/`.

## Verificaciones de cleanup

Comandos recomendados para auditar sin abrir binarios:

```bash
find public -type f -exec du -h {} + | sort -h
find public -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.webm" -o -name "*.zip" -o -name "*.7z" -o -name "*.rar" \) -print
test ! -f public/images/Eclipse_small.mp4 && echo "duplicated public mp4 removed"
test -f images/Eclipse_small.mp4 && echo "legacy mp4 preserved"
rg -n "public/images/Eclipse_small\\.mp4|Eclipse_small\\.mp4" src public docs astro.config.mjs package.json || true
```

Si `public/` no existe en una rama local de diagnóstico, los comandos de `find public` pueden fallar por ausencia de scaffold; eso no implica que el video legacy falte.

## Próximo paso recomendado

En M2, migrar la home estática y decidir explícitamente cómo `VideoBackground.astro` activa el video sin impactar mobile, reduced-motion, reduced-data ni el smoke test del scaffold. No mover ni recomprimir el MP4 legacy dentro de M2 sin una tarea separada de performance/media.
