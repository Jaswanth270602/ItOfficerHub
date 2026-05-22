# ItOfficerHub

Free mock test platform for **IBPS SO IT Officer** exams — 20 questions, 15 minutes, +1 / −0.25 marking, percentile ranking, Prep Mail community.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Backend | Spring Boot 3.4, JWT, JPA |
| Database | **PostgreSQL** (Docker local / Neon free cloud) |

## Local development

### 1. Neon / PostgreSQL config

```powershell
copy .env.example .env
# Edit .env with your Neon JDBC URL, DB_USER, DB_PASSWORD (see .env.example)
```

`.env` is loaded automatically (`spring.config.import`). **Never commit `.env`.**

### 2. Build UI into Spring static (one app on port 8080)

```powershell
cd frontend
npm install
npm run build
cd ..
powershell -ExecutionPolicy Bypass -File .\scripts\build-static.ps1
```

### 3. Run backend (serves API + React UI)

```powershell
.\mvnw.cmd spring-boot:run "-Dskip.frontend.build=true"
```

Open **http://localhost:8080** (UI + `/api` on same host).

Optional Vite dev server (hot reload):

```powershell
cd frontend
npm run dev
```

→ http://localhost:5173 (proxies `/api` to 8080)

**Admin:** `/admin` — `admin@itofficerhub.com` / `Admin@123` (change `ADMIN_PASSWORD` in production)

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL (local) |
| `DATABASE_URL` | Full Neon URL (`postgres://...`) — auto-mapped to JDBC |
| `SPRING_DATASOURCE_URL` | Optional full JDBC URL override |
| `JWT_SECRET` | **Required** in production |
| `CORS_ORIGINS` | Frontend URL(s), comma-separated |
| `PORT` | HTTP port (Render sets this) |
| `VITE_API_URL` | Frontend build: backend `/api` base URL |

## Deploy to Render (one service: API + UI)

### A. Neon database

Use your Neon project; set on Render:

| Key | Example |
|-----|---------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://....neon.tech/itofficerhub_db?sslmode=require` |
| `DB_USER` | `neondb_owner` |
| `DB_PASSWORD` | *(from Neon dashboard)* |
| `JWT_SECRET` | long random string |
| `ADMIN_PASSWORD` | strong admin password |

### B. Push to GitHub

```powershell
git add .
git commit -m "Deploy: Neon Postgres + bundled static UI"
git push
```

Do **not** push `.env` (it is gitignored).

### C. Render Web Service (Docker)

1. [render.com](https://render.com) → **New** → **Blueprint** or **Web Service** → connect repo  
2. Dockerfile builds frontend + backend JAR (`-Dskip.frontend.build=false`)  
3. Add env vars above  
4. Open your Render URL → full app at `https://your-app.onrender.com`

### Full production JAR locally

```powershell
.\mvnw.cmd clean package -DskipTests "-Dskip.frontend.build=false"
java -jar target\ItOfficerHub-1.0.0-SNAPSHOT.jar
```

## Import quizzes

Admin → **Import Mock** → copy prompt from `docs/QUIZ_IMPORT_FORMAT.md` or `/claude-quiz-prompt.txt`.

## License

MIT — educational use.
