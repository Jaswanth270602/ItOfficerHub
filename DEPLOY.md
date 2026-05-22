# Deploy ItOfficerHub on Render (step-by-step)

## Before you push to GitHub

| File | Push to GitHub? |
|------|-----------------|
| All source code | Yes |
| `.env.example` | Yes (placeholders only) |
| **`.env`** | **NO** — already in `.gitignore` |
| `src/main/resources/static/` | **NO** — built inside Docker on Render |
| `node_modules/`, `target/` | **NO** |

**Never commit** real DB passwords or `JWT_SECRET` in git.

If you ever committed `.env` by mistake, rotate Neon password and remove it from git history.

---

## Step 1 — Neon database (free)

1. Go to [neon.tech](https://neon.tech) and sign in.
2. Open your project (or create one).
3. Copy **Connection string** (`postgres://user:pass@host/db?sslmode=require`).
4. Keep it for Render — do not paste into GitHub.

---

## Step 2 — Push code to GitHub

```powershell
cd c:\Users\dell\Downloads\ItOfficerHub
git add .
git status
```

Confirm **`.env` does NOT appear** in `git status`.

```powershell
git commit -m "Prepare for Render deploy"
git push origin main
```

---

## Step 3 — Create Render Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com).
2. **New +** → **Web Service**.
3. Connect your GitHub account → select **ItOfficerHub** repo.
4. Settings:
   - **Name:** `itofficerhub` (or any name)
   - **Region:** Singapore (closest to Neon ap-southeast-1)
   - **Branch:** `main`
   - **Runtime:** **Docker**
   - **Dockerfile path:** `./Dockerfile`
   - **Plan:** Free

**Note:** The Docker build copies `frontend/` and runs `npm ci` + `npm run build` inside the image (first deploy may take 10–15 min).

5. Click **Advanced** → add **Environment Variables**:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Paste Neon `postgres://...` string *(easiest)* |
| **OR** use JDBC instead: | |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://HOST/neondb?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | `neondb_owner` |
| `SPRING_DATASOURCE_PASSWORD` | *(from Neon)* |
| `JWT_SECRET` | Long random string (32+ chars) |
| `ADMIN_PASSWORD` | Strong password (not `Admin@123`) |
| `JPA_SHOW_SQL` | `false` |
| `PORT` | `8080` |

Use **either** `DATABASE_URL` **or** the three `SPRING_DATASOURCE_*` vars — not both required.

6. **Create Web Service** → wait for first deploy (10–15 min on free tier).

---

## Step 4 — Open your app

After deploy shows **Live**:

- App + UI: `https://itofficerhub.onrender.com` (your URL may differ)
- Health check: `https://YOUR-URL.onrender.com/api/public/stats`
- Admin: `https://YOUR-URL.onrender.com/admin`

Login: `admin@itofficerhub.com` / password = whatever you set as `ADMIN_PASSWORD`.

---

## Database migrations (Flyway)

On each deploy, Spring runs SQL in `src/main/resources/db/migration/` before the app serves traffic.

If you see **`column exam_target does not exist`** before redeploying, run `docs/scripts/fix-neon-schema.sql` in the Neon SQL Editor, then restart Render.

---

## Step 5 — After first deploy

1. **Rotate Neon password** if you ever shared it in chat or committed `.env`.
2. Change admin password in production.
3. Free tier **sleeps** after ~15 min idle — first visit may take 30–60 seconds.

---

## Optional — Blueprint deploy

Instead of manual setup, use **New +** → **Blueprint** and point at repo with `render.yaml`. Then fill secret env vars in the dashboard when prompted.

---

## Local vs Render config

| | Local | Render |
|---|--------|--------|
| Secrets | `.env` file (gitignored) | Render **Environment** tab |
| UI | `static/` folder or Docker build | Built inside **Dockerfile** |
| URL | http://localhost:8080 | https://xxx.onrender.com |
