<p align="center">
  <img src="public/bionicjs.svg" alt="bionicjs" width="120" />
</p>

<h1 align="center">{{appName}}</h1>

<p align="center"><em>A BionicJS application.</em></p>

## Development

```sh
npm install
npm run dev
```

## Structure

BionicJS gives you three zones. The first two are yours; the third is
generated and disposable.

- `app/` — the web application (React UI, BionicJS conventions)
  - `app/layout.tsx` — root layout component
  - `app/components/` — React components
  - `app/lib/` — shared TypeScript helpers
  - `main.tsx` — client entry that mounts the app
- `server/` — the Node runtime (Nitro, h3). Yours.
  - `server/api/` — API route handlers
  - `server/auth/` — authentication
  - `server/db/` — database client and schema
- `ai/` — the Python runtime: LLM calls, agents, RAG
- `jobs/` — the Python runtime: background tasks and queue workers
- `.bionicjs/` — **generated on every dev run. Gitignored. Safe to delete.**
  - `.bionicjs/server.ts` — the `auth` / `db` / `ai` / `jobs` exports
  - `.bionicjs/hono.ts` — the Hono router typed from `server/api/*.ts`
  - `.bionicjs/api-client.ts` — the typed client
- `public/` — static assets

`ai/` and `jobs/` are siblings of `server/` rather than children of it because
they run in Python, in a separate process, reached over the RPC boundary.
`server/auth/` and `server/db/` are siblings because auth depends on the
database, not the other way around.

The Vite dev server proxies `/api` to Nitro. Only the directories for the
capabilities you selected are generated.

Import the server interface rather than reaching into `.bionicjs/` by path:

```ts
import { ai, db, auth, jobs } from "@bionicjs/core/server";
```

## Conventions

- `app/layout.tsx` — root layout component, shared by every route
- `app/components/` — React components
- `app/lib/` — shared TypeScript helpers
- `main.tsx` — client entry (the future BionicJS runtime will own this)
- `server/api/` — Nitro API route handlers