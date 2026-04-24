# CI/CD And Deployment Setup

This repository now includes deployment automation for this stack:

- Frontend: Vercel (Next.js, `todo-frontend`)
- Backend: Render (`todo-backend`)
- Database: Supabase PostgreSQL
- CI/CD: GitHub Actions

## Included Files

- `.github/workflows/ci.yml`
  - Runs frontend lint/build and backend build on PRs and pushes to `main`.
- `.github/workflows/deploy.yml`
  - Deploys frontend to Vercel and triggers backend deployment on Render.
  - Runs on pushes to `main` or manual dispatch.
- `render.yaml`
  - Render Blueprint for backend deployment.
- `todo-backend/Program.cs`
  - Adds `GET /healthz` endpoint for Render health checks.

## 1) Supabase Setup

1. Create a Supabase project.
2. Copy the PostgreSQL connection details.
3. Use a connection string compatible with Npgsql, for example:

```text
Host=db.<your-project-ref>.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=<your-password>;SSL Mode=Require;Trust Server Certificate=true
```

If using the pooler, replace host and port according to Supabase pooler settings.

## 2) Render Setup (Backend)

1. In Render, create a new Blueprint deployment from this repo.
2. Render will detect `render.yaml` and configure `todo-backend` as a web service.
3. In Render service environment variables, set secrets:
   - `ConnectionStrings__TodoDatabase` = your Supabase connection string
   - `Jwt__SigningKey` = long random secret (minimum 32 chars)
4. Keep the default public health check path: `/healthz`.

Render build/start are already defined in `render.yaml`.

## 3) Vercel Setup (Frontend)

1. Import this repo in Vercel.
2. Set Root Directory to `todo-frontend`.
3. Add environment variable in Vercel (Production):
   - `BACKEND_API_URL=https://<your-render-service>.onrender.com`

Frontend API route handlers will proxy requests to this backend URL.

## 4) GitHub Repository Secrets

Add these repository secrets in GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `RENDER_API_KEY`
- `RENDER_SERVICE_ID`

These are required by `.github/workflows/deploy.yml`.

## 5) Deployment Flow

1. Open a PR: `ci.yml` validates frontend/backend.
2. Merge to `main`: `deploy.yml` runs automatically.
3. Frontend deploys to Vercel.
4. Backend deploy is triggered on Render.
5. Render backend starts and runs EF migrations on startup.

## Notes

- Backend already calls EF Core `MigrateAsync()` at startup.
- Ensure Supabase credentials have rights to run migrations.
- If migrations should be controlled separately, change startup migration behavior before production rollout.
