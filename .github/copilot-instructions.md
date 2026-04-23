# Copilot Instructions For `todo-app`

Use this file as the default repository context for every prompt. Do **not** begin by re-reading the whole codebase.

## How To Work In This Repo

- Start from this document as source-of-truth context.
- Read only files directly related to the requested change.
- Prefer minimal, focused edits over broad refactors.
- Preserve existing project structure and naming.
- If a request touches auth, data flow, or API contracts, validate impacted backend and frontend contract files only.

## Monorepo Layout

- `todo-backend/`: ASP.NET Core Web API (`net10.0`) with Identity + JWT cookie auth + EF Core/PostgreSQL.
- `todo-frontend/`: Next.js 16 App Router (`react@19`) with MUI 9 and route handlers that proxy to backend.
- Root compose files:
  - `docker-compose.dev.yml`
  - `docker-compose.prod.yml`
  - `docker-compose.yml`

## Backend Architecture (`todo-backend`)

### Entry + DI

- `Program.cs`:
  - `AddControllers()`, `AddOpenApi()`, Swagger in development.
  - Registers `AddApplication()` and `AddInfrastructure(configuration)`.
  - Middleware order: `UseAuthentication()` then `UseAuthorization()`.
  - Calls `InitializeDatabaseAsync()` on startup.

- `Application/DependencyInjection.cs`:
  - Registers `ITodoService -> TodoService` (scoped).

- `Infrastructure/DependencyInjection.cs`:
  - Reads `ConnectionStrings:TodoDatabase`.
  - Configures Npgsql `AppDbContext`.
  - Configures `IdentityCore<ApplicationUser>` + `SignInManager` + EF stores.
  - Configures JWT bearer auth and reads access token from cookie when missing in header.
  - Registers:
    - `IJwtTokenGenerator -> JwtTokenGenerator`
    - `IRefreshTokenService -> RefreshTokenService`
    - `ITodoRepository -> TodoRepository`
    - `TimeProvider.System` (singleton)

### Auth Model

- Identity user: `Domain/Entities/ApplicationUser.cs`.
- Refresh tokens are server-issued and rotated/revoked via `IRefreshTokenService`.
- Auth cookies are HttpOnly and set by `Api/Controllers/AuthController.cs`.
- `AuthController` endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - `GET /api/auth/me` (authorized)

### Todo Model

- Main entity: `Domain/Entities/Todo.cs`.
- Contract DTO/service files under `Application/Todos/`.
- API endpoint surface in `Api/Controllers/TodosController.cs`:
  - `GET /api/todos`
  - `GET /api/todos/{id}`
  - `POST /api/todos`
  - `PUT /api/todos/{id}`
  - `DELETE /api/todos/{id}`
- Todos are user-scoped by claims (`NameIdentifier` or `sub`).

### Backend Conventions

- Keep controllers thin; business logic belongs in application services.
- Keep persistence logic in repositories.
- Maintain async + cancellation token flow through all layers.
- Do not bypass Identity/JWT cookie flow when adding auth features.

## Frontend Architecture (`todo-frontend`)

### Framework + UI

- Next.js 16 App Router.
- React 19.
- MUI 9 with `AppRouterCacheProvider` in `src/app/providers.tsx`.
- Main page `src/app/page.tsx` renders `TodoApp` feature component.

### API Flow

- Frontend does not call backend directly from components.
- Components/hooks use local Next route handlers under `src/app/api/**`.
- Proxy helper in `src/app/api/_lib/backendProxy.ts` forwards requests to backend and preserves cookie-based auth flow.

### Feature Structure

- Auth feature:
  - `src/features/auth/components/`
  - `src/features/auth/hooks/`
  - `src/features/auth/lib/`
- Todos feature:
  - `src/features/todos/components/`
  - `src/features/todos/hooks/`
  - `src/features/todos/lib/`

### Frontend Conventions

- Follow existing feature-first structure.
- Keep network logic in `lib/api.ts` + route handlers, not inside view components.
- Prefer existing MUI + global CSS patterns over introducing another UI framework.
- Respect App Router server/client boundaries.

## Runtime + Environment

### Important Ports

- Frontend (host): `http://localhost:3000`
- Backend (host): `http://localhost:5284`
- Postgres (host): `localhost:5433`

### Key Environment Variables

- Frontend:
  - `BACKEND_API_URL` (container default: `http://backend:8080`)
- Backend:
  - `ConnectionStrings__TodoDatabase`
  - `Jwt__Issuer`
  - `Jwt__Audience`
  - `Jwt__SigningKey` (>= 32 chars)
  - `Jwt__AccessTokenLifetimeMinutes`
  - `Jwt__RefreshTokenLifetimeDays`
  - Cookie name settings under `Jwt__*CookieName`

## Build/Test/Lint Commands

- Backend build:
  - `dotnet build todo-backend/todo-backend.csproj`
- Backend run:
  - `dotnet run --project todo-backend/todo-backend.csproj`
- Frontend install/dev:
  - `npm install` (inside `todo-frontend/`)
  - `npm run dev`
- Frontend lint:
  - `npm run lint`

## High-Value File Index

Read these first when relevant, instead of scanning everything:

- Cross-cutting:
  - `README.md`
- Backend boot/auth/data:
  - `todo-backend/Program.cs`
  - `todo-backend/Infrastructure/DependencyInjection.cs`
  - `todo-backend/Api/Controllers/AuthController.cs`
  - `todo-backend/Api/Controllers/TodosController.cs`
  - `todo-backend/Infrastructure/Persistence/AppDbContext.cs`
- Frontend app/api/features:
  - `todo-frontend/src/app/layout.tsx`
  - `todo-frontend/src/app/providers.tsx`
  - `todo-frontend/src/app/api/_lib/backendProxy.ts`
  - `todo-frontend/src/features/auth/lib/api.ts`
  - `todo-frontend/src/features/todos/lib/api.ts`

## Common Pitfalls To Avoid

- Do not break cookie-based auth by switching to localStorage token patterns.
- Do not add `ssr: false` dynamic imports in Server Components.
- Keep MUI App Router cache provider in place to avoid hydration issues.
- In `IdentityDbContext` model configuration, preserve `base.OnModelCreating(modelBuilder)` behavior.

## Decision Rules For Copilot

When responding to prompts:

- Assume this architecture and naming unless the user asks to change it.
- Do not do broad repository discovery unless requested.
- If uncertain, inspect only the smallest relevant slice (1-3 files) and proceed.
- Provide edits that are consistent with existing layering:
  - API controller -> application service -> repository -> EF Core.
  - UI component -> feature hook/lib -> Next route handler -> backend API.
