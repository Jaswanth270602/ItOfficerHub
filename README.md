# ItOfficerHub

Free mock test platform for **IBPS SO IT Officer** exams — 20 questions, 15 minutes, +1 / −0.25 marking, percentile ranking, Prep Mail community.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Backend | Spring Boot 3.4, JWT, JPA |
| Database | **PostgreSQL** (Docker local / Neon free cloud) |

## Local development

### 1. Start PostgreSQL

```powershell
cd c:\Users\dell\Downloads\ItOfficerHub
docker compose up -d
```

### 2. Backend

```powershell
copy .env.example .env
# Edit JWT_SECRET if you like
.\mvnw.cmd spring-boot:run
```

API: http://localhost:8080

### 3. Frontend

```powershell
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

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

## Deploy to Render (free tier)

### A. Database (Neon — free)

1. Create project at [neon.tech](https://neon.tech)
2. Copy **connection string** (`postgres://...`)

### B. Push to GitHub

```powershell
git init
git add .
git commit -m "ItOfficerHub PostgreSQL + Render deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USER/ItOfficerHub.git
git push -u origin main
```

### C. Render

1. [render.com](https://render.com) → **New** → **Blueprint** → connect repo (uses `render.yaml`)
2. Or manually:
   - **Web Service** `itofficerhub-api`: Docker, set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS=https://YOUR-STATIC-SITE.onrender.com`
   - **Static Site** `itofficerhub-web`: root `frontend`, build `npm ci && npm run build`, publish `dist`, env `VITE_API_URL=https://itofficerhub-api.onrender.com/api`
3. After deploy, update `CORS_ORIGINS` on the API to match your real static URL → redeploy API.

### Build commands (reference)

```powershell
# Backend JAR
.\mvnw.cmd clean package -DskipTests

# Frontend (production)
cd frontend
$env:VITE_API_URL="https://YOUR-API.onrender.com/api"
npm run build
```

## Import quizzes

Admin → **Import Mock** → copy prompt from `docs/QUIZ_IMPORT_FORMAT.md` or `/claude-quiz-prompt.txt`.

## License

MIT — educational use.
