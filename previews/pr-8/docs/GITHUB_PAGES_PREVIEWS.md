# GitHub Pages con Previews (PR & patch branches)

GitHub Pages no trae previews nativos de PR en modo general (lo “preview” del action oficial no está abierto al público).
Por eso usamos una estrategia práctica:

- Producción se publica en `gh-pages` (raíz del sitio)
- Previews se publican en subcarpetas:
  - `previews/pr-123/` para Pull Requests
  - `previews/branch-patch--02-servicios-v2/` para branches `patch/**`

Como este repo usa rutas absolutas (`/css/...`, `/assets/...`) en varios HTML, el workflow reescribe
esas rutas SOLO en el preview para que funcione bajo `/previews/...`, sin tocar tu código de producción.

---

## 1) Qué archivos agrega

- `.github/workflows/pages-deploy.yml` → Deploy de producción (push a `main`)
- `.github/workflows/pages-preview.yml` → Preview por PR + por branches `patch/**`
- `.github/workflows/pages-cleanup.yml` → Limpieza de previews (al cerrar PR o borrar branch `patch/*`)
- `scripts/rewrite_basepath.py` → Reescritura de rutas absolutas para previews

---

## 2) Setup en GitHub (1 vez)

1) Repo → **Settings → Actions → General**
   - Workflow permissions: **Read and write**
   - Save

2) Repo → **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: `gh-pages`
   - Folder: `/ (root)`
   - Save

> `gh-pages` se crea automáticamente en el primer deploy si no existe.

---

## 3) Cómo usarlo

### Producción
- Merge a `main` → corre **Pages - Deploy (prod)** → publica el sitio.

### Preview por PR (recomendado)
- Abrí PR desde `patch/XX...` hacia `main`
- El workflow deja un comentario con el link del preview.

### Preview por branch `patch/**` (sin PR)
- Push a una branch que matchee `patch/**`
- Mirá el link en **Actions → run → Summary**

---

## 4) URLs típicas

Project Pages:
- `https://OWNER.github.io/REPO/previews/pr-123/`

Con dominio propio (CNAME):
- `https://TU-DOMINIO/previews/pr-123/`

---

## 5) Notas

- PRs desde forks: GitHub bloquea el push a `gh-pages`; el workflow se saltea.
- Al cerrar un PR, el preview se elimina automáticamente.
- Si borrás una branch `patch/*`, el preview de esa branch también se elimina.
