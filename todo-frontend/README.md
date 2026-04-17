# Todo Frontend

Next.js frontend for the TODO app with full CRUD support:

- List todos
- Add todo
- Update todo (edit title + toggle completion)
- Delete todo

## Environment

Create a `.env.local` file in this folder:

```bash
BACKEND_API_URL=http://localhost:5284
```

`BACKEND_API_URL` points to the .NET backend API base URL.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Architecture

```text
src/
	app/
		api/
			todos/
				route.ts          # GET/POST proxy to backend
				[id]/route.ts     # PUT/DELETE proxy to backend
		page.tsx              # TodoApp entry
	features/
		todos/
			components/         # UI components
			hooks/              # Client state and CRUD actions
			lib/                # API client + types
```

## Notes

- The frontend calls Next.js API routes (`/api/todos`) instead of calling the backend directly.
- This keeps browser requests same-origin and avoids CORS configuration requirements on the backend.
