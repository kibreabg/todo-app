# Todo App Monorepo

This repository contains:

- `todo-frontend`: Next.js frontend
- `todo-backend`: ASP.NET Core Web API backend

## Containerization

This repo now includes:

- `todo-frontend/Dockerfile` (dev + production stages)
- `todo-backend/Dockerfile` (dev + production stages)
- `docker-compose.dev.yml` for local development in containers
- `docker-compose.prod.yml` for production-style container runs

### Exact Port And Route Mapping

| Flow | Host address | Container/internal address |
| --- | --- | --- |
| Browser -> Frontend | `http://localhost:3000` | `frontend:3000` |
| Frontend proxy -> Backend API | N/A (server-side in frontend container) | `http://backend:8080` |
| Host direct -> Backend API | `http://localhost:5284` | `backend:8080` |
| Backend -> Postgres | N/A | `postgres:5432` |
| Host direct -> Postgres | `localhost:5433` | `postgres:5432` |

### Environment Variable Mapping

Frontend (`todo-frontend`):

- `BACKEND_API_URL=http://backend:8080`
- `NEXT_TELEMETRY_DISABLED=1`

Backend (`todo-backend`):

- `ASPNETCORE_URLS=http://+:8080`
- `ASPNETCORE_ENVIRONMENT=Development` (dev compose)
- `ASPNETCORE_ENVIRONMENT=Production` (prod compose)
- `ConnectionStrings__TodoDatabase=Host=postgres;Port=5432;Database=todo_app;Username=postgres;Password=postgres` (dev default)
- `ConnectionStrings__TodoDatabase=Host=postgres;Port=5432;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD}` (prod compose pattern)
- `Jwt__Issuer=todo-backend`
- `Jwt__Audience=todo-frontend`
- `Jwt__SigningKey=...` (must be at least 32 chars)
- `Jwt__AccessTokenLifetimeMinutes=15`
- `Jwt__RefreshTokenLifetimeDays=14`
- `Jwt__AccessTokenCookieName=todo_auth`
- `Jwt__RefreshTokenCookieName=todo_refresh`

Postgres:

- `POSTGRES_DB=todo_app`
- `POSTGRES_USER=postgres`
- `POSTGRES_PASSWORD=postgres`

### Run Dev Stack In Containers

```powershell
docker compose -f docker-compose.dev.yml up --build
```

Then use:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5284`
- Postgres: `localhost:5433`

### Run Production-Style Stack Locally

Set at least one secure variable before starting:

```powershell
$env:JWT_SIGNING_KEY="replace-with-a-long-random-secret-at-least-32-characters"
```

Or copy `.env.prod.example` to `.env` and adjust values before running compose.

Then run:

```powershell
docker compose -f docker-compose.prod.yml up --build
```

The host ports remain the same for consistency:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5284`
- Postgres: `localhost:5433`

## Prerequisites

- Node.js 20+
- npm 10+
- .NET SDK 10 (or the SDK compatible with `net10.0`)

## Run The Frontend (Next.js)

```powershell
cd todo-frontend
npm install
npm run dev
```

Use `npm run dev` for local debugging. This runs the development build with full React/Next diagnostics.

Frontend runs on:

- http://localhost:3000

### Optional production run

```powershell
cd todo-frontend
npm install
npm run build
npm run start
```

`npm run start` serves the production build. Avoid this command while debugging local issues.

## Run The Backend (.NET Web API)

```powershell
cd todo-backend
dotnet restore
dotnet run
```

Backend default local URLs are shown in terminal output when the app starts.

## Run Both In Separate Terminals

Terminal 1:

```powershell
cd todo-frontend
npm run dev
```

Terminal 2:

```powershell
cd todo-backend
dotnet run
```
