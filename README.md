# Todo App Monorepo

This repository contains:

- `todo-frontend`: Next.js frontend
- `todo-backend`: ASP.NET Core Web API backend

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

Frontend runs on:

- http://localhost:3000

### Optional production run

```powershell
cd todo-frontend
npm install
npm run build
npm run start
```

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
