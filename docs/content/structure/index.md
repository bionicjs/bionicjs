## The two worlds

BionicJS splits your project into two clear halves:

```
my-app/
├── app/          # Client — React, Vite, the browser
├── server/       # Server — Nitro, h3, Node.js
├── ai/           # Python — AI, LLM calls, agents
├── jobs/         # Python — background tasks, queues
└── bionicjs.config.ts
```

This isn't arbitrary. Each folder maps to a runtime boundary:

- **app/** → runs in the browser (Vite bundle)
- **server/** → runs on the server (Nitro)
- **ai/** → runs in Python (your AI models)
- **jobs/** → runs in Python (your workers)

## app/ — the client

Every file in `app/` is a React component. The file system is the router:

- `app/page.tsx` → `/`
- `app/about/page.tsx` → `/about`
- `app/dashboard/settings/page.tsx` → `/dashboard/settings`

Layouts wrap their children:

- `app/layout.tsx` → wraps all pages
- `app/dashboard/layout.tsx` → wraps everything under `/dashboard`

## server/ — the API layer

Nitro handles API routes, middleware, and server-side logic:

- `server/api/` → API endpoints (`/api/...`)
- `server/middleware.ts` → runs before every request
- `server/auth/` → authentication handlers

## ai/ and jobs/ — the Python layer

Python lives at the top level, not buried under `server/`:

- `ai/` → LLM calls, agent orchestration, RAG
- `jobs/` → background tasks, queue workers

These are Python files. They run in a separate process. The RPC boundary
connects them to TypeScript.

## bionicjs.config.ts — the single config

One file configures everything:

```ts bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { betterAuth } from "@bionicjs/better-auth";
import { prisma } from "@bionicjs/prisma";
import { anthropic } from "@bionicjs/anthropic";

export default defineConfig({
  auth: betterAuth({ emailAndPassword: { enabled: true } }),
  database: prisma({ provider: "postgresql", url: env("DATABASE_URL") }),
  ai: anthropic({ model: "claude-sonnet-4-5" }),
});
```

No separate `vite.config.ts`. No `nitro.config.ts`. No middleware files.
BionicJS manages all of it.
