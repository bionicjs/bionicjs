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

- `app/` — the web application (React UI, BionicJS conventions)
  - `app/layout.tsx` — root layout component
  - `app/components/` — React components
  - `app/lib/` — shared TypeScript helpers
  - `main.tsx` — client entry that mounts the app
- `server/` — Nitro server (TypeScript): API routes, auth, database
- `ai/` — AI capabilities (Python)
- `jobs/` — background jobs (Python)
- `public/` — static assets

The Vite dev server proxies `/api` to Nitro. Only the directories for the
capabilities you selected are generated.

## Conventions

- `app/layout.tsx` — root layout component, shared by every route
- `app/components/` — React components
- `app/lib/` — shared TypeScript helpers
- `main.tsx` — client entry (the future BionicJS runtime will own this)
- `server/api/` — Nitro API route handlers