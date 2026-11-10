# Copy 3.0 aprobado para la web oficial

El 10 de noviembre de 2026, el usuario confirmó que Lucía aprobó las 52 propuestas completas, incluidos los casos críticos, y que los pendientes comerciales del PR #14 quedaron resueltos. Esta aprobación alcanza los seis campos propuestos cuando contienen texto: `descriptionShort`, `descriptionLong`, `idealFor`, `benefits`, `intent` y `notFor`. Los valores vacíos se omiten. La confirmación no autoriza nuevos precios, nombres, servicios ni afirmaciones fuera de `docs/PROPUESTAS_COPY_3_0.json`.

## Integración

`src/data/approved-copy.public.json` contiene solo el copy público aprobado, vinculado por ID exacto. Se deriva de las propuestas con `npm run prepare:copy`. La snapshot `src/data/generated/services.public.json` conserva los datos obtenidos de Firestore; no se crea un segundo catálogo de servicios ni se escribe en la base remota. `npm run build` consulta Firestore en modo lectura y verifica que la snapshot coincide exactamente con la auditada antes de emitir páginas. Si cambió algún servicio, falla el build y exige revisar el origen.

Las categorías Astro, las diez fichas SEO y la actualización dinámica del navegador aplican el mismo copy aprobado. Nombre, precio, categoría, slug, orden, estado, destacados y CTA siguen viniendo del servicio original. Una identidad cambiada no recibe el texto de otro ID. Al depender este copy del repositorio, las futuras ediciones de esos seis campos en Firestore no aparecerán públicamente hasta actualizar y aprobar la fuente de copy en código; los demás campos mantienen el comportamiento actual. El administrador no se modifica.

El selector de comparación de `feat/cristal-sagrado-3-0-copy-preview` permanece solo en esa rama local y no forma parte de la publicación. Los documentos de auditoría conservan su estado histórico `PENDIENTE_APROBACION`; esta nota registra la aprobación posterior y su alcance.

## Comprobación previa al merge

```text
npm test
npm run build
npm run test:build
git diff --check
```

La rama del PR #14 apunta a `main`. Su merge dispara el workflow `Pages - Deploy (prod)` y publica `dist/` automáticamente; por tanto, merge y despliegue son el mismo gate operativo. Verificar el workflow, las cuatro categorías, diez fichas SEO, búsqueda, expansión, WhatsApp, precios, Libros y `/admin/` tras ese gate. No ejecutar una escritura separada a Firestore para este despliegue.
