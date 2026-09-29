# Guía: GitHub → Vercel → Base de datos (paso a paso)

Qué queda al final:
- **Propiedades, asesores, testimonios, leads y usuarios del Admin** → se guardan en una base de datos (**Upstash Redis**). Lo que cambies en `/admin` se ve en todos los dispositivos.
- **Fotos y videos que subas desde el Admin** → se guardan en **Vercel Blob**.
- Todo gratis en el plan Hobby/Free para el tamaño de tu página.

> En Vercel el disco es de solo lectura. Por eso antes los cambios "no se guardaban": se escribían en archivos `.json` que ahí no persisten. Ahora se escriben en la base de datos.

---

## PARTE 1 — Subir el proyecto a GitHub

1. Instala Git (https://git-scm.com) y crea cuenta en https://github.com.
2. En github.com → **New repository** → nombre `bacru` → **Private** → *Create repository* (sin README).
3. Abre una terminal **dentro de la carpeta `bacru-next`** (donde está `package.json`). Primero ejecuta `npm install` una vez (agrega las 2 librerías nuevas y actualiza `package-lock.json`). Luego:

```bash
git init
git add .
git commit -m "Bacru v22"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/bacru.git
git push -u origin main
```

4. Verifica en GitHub que **NO** aparezca `.env.local` (el `.gitignore` ya lo excluye). Ahí están tu correo y contraseña de admin: nunca deben subirse.

---

## PARTE 2 — Crear el proyecto en Vercel

1. Entra a https://vercel.com → **Sign Up → Continue with GitHub**.
2. **Add New… → Project** → elige el repo `bacru` → **Import**.
3. *Framework Preset*: **Next.js** (lo detecta solo). *Root Directory*: déjalo en `./` (porque `package.json` quedó en la raíz del repo).
4. Abre **Environment Variables** y agrega estas 3 (los valores te los di en el chat; **no están en el proyecto**):
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `ADMIN_SECRET`
5. Clic en **Deploy**. Cuando termine tendrás la página en `https://tu-proyecto.vercel.app`.

Todavía **no** guarda cambios: falta la base de datos.

---

## PARTE 3 — Crear la base de datos (Upstash Redis)

1. En Vercel abre tu proyecto → pestaña **Storage**.
2. **Create Database** → en *Marketplace / Storage partners* elige **Upstash** → **Upstash Redis** (si ves "KV", es lo mismo).
3. Plan **Free**. Región: la más cercana a México (por ejemplo **US East / N. Virginia**). Nombre: `bacru-db` → **Create**.
4. Cuando pregunte si lo conecta al proyecto, elige tu proyecto `bacru` y marca **Production, Preview y Development** → **Connect**.
5. Ve a **Settings → Environment Variables** y comprueba que aparezcan `KV_REST_API_URL` y `KV_REST_API_TOKEN` (las crea Vercel solas). El código las lee automáticamente.

## PARTE 4 — Crear el almacén de fotos/videos (Vercel Blob)

1. Otra vez pestaña **Storage → Create Database → Blob**.
2. Nombre `bacru-archivos` → **Create** → conéctalo al proyecto (todos los entornos).
3. Debe aparecer la variable `BLOB_READ_WRITE_TOKEN` en Environment Variables.

## PARTE 5 — Volver a publicar (obligatorio)

Las variables nuevas solo se aplican en un deploy nuevo:
**Deployments → (el último) → ⋯ → Redeploy**.

---

## PARTE 6 — Probar que funciona

1. Entra a `https://tu-proyecto.vercel.app/admin/login` con el correo y la contraseña que pusiste en Vercel.
2. La **primera vez** la base se llena sola con las propiedades, asesores y testimonios que trae el proyecto (`content/*.json`).
3. Cambia algo (por ejemplo el precio de una propiedad o agrega un asesor con foto).
4. Abre la página pública **en tu celular con datos móviles** (o en una ventana de incógnito): debes ver el cambio.
5. Agrega una propiedad nueva y prueba el bot 💬: ahora la encuentra y aparece su zona en los botones.

## Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| "Falta conectar la base de datos" al guardar | No están `KV_REST_API_*` | Parte 3 y luego **Redeploy** |
| Error al subir foto/video | Falta `BLOB_READ_WRITE_TOKEN` | Parte 4 y **Redeploy** |
| No entro al admin | `ADMIN_EMAIL`/`ADMIN_PASSWORD` distintos a los que escribes | Corrígelos en Vercel y **Redeploy** |
| Sigo viendo lo viejo | Caché del navegador | Recarga forzada o modo incógnito |

## Trabajar en tu PC (opcional)

```bash
npm install
cp .env.local.example .env.local   # edita los valores
npm run dev
```
Sin `KV_REST_API_*` en local, el proyecto sigue guardando en `content/*.json` como antes (solo para pruebas). Para probar contra la base real: `npx vercel link` y `npx vercel env pull .env.local`.

## Cambios de código futuros
Cada `git push` a `main` publica solo en Vercel. **Los datos del Admin no se pierden**: viven en la base de datos, no en el repo.
