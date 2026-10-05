## The three zones

BionicJS gives you three top-level zones. The first two are yours; the third
is disposable.

```
my-app/
├── app/          # yours   — client runtime: React, Vite, the browser
├── server/       # yours   — server runtime: Nitro, h3, Node.js
├── ai/           # yours   — Python runtime: LLM calls, agents, RAG
├── jobs/         # yours   — Python runtime: background tasks, queue workers
├── .bionicjs/    # THEIRS  — generated on every dev run, never edit, gitignored
└── bionicjs.config.ts
```

The dividing line is the **runtime**, not the audience. That single rule
answers every "where does this go?" question in this project.

## Why `ai/` and `jobs/` are at the root

`server/` is the Node runtime. `ai/` and `jobs/` are the Python runtime. They
are not "more server code" — they are code for a different runtime, executing
in a different process, reached over the RPC boundary.

Putting Python inside `server/` would mix two runtimes inside one directory
tree, and the directory name would stop describing what is in it. Celery's own
guidance is the same: the Celery application instance lives in the core
directory of the project, beside your settings, not buried in an app.

`ai/` and `jobs/` are siblings of `server/`, not children of it.

## Why `server/` is named `server/`

It matches the runtime it configures. BionicJS builds on Nitro, and Nitro
calls this directory `server/`. The alternative names are worse:

- `backend/` — RedwoodJS deliberately avoided this. Their docs note the web
  side is called `web` and not `frontend`, for the same reason: the directory
  names should describe the runtime, not a vague process role.
- `api/` — too narrow. `server/` also holds middleware, auth, and database
  code that is not an HTTP endpoint.
- `node/` — describes the implementation rather than the responsibility.

## `server/` is yours, and `server/auth/` is a sibling of `server/db/`

Both are yours, and they sit next to each other:

```
server/
├── api/     → API route handlers
└── auth/    → authentication
    db/      → database client, schema, migrations
```

`auth` is **not** nested inside `db`. Auth depends on the database — it stores
users, sessions, and accounts in tables — so the dependency runs
`auth → db`. Nesting auth inside `db/` would invert that and force the data
layer to know about authentication.

This matches how the tools you already use are organised:

- **Better Auth** puts `auth.ts` at the project root and *imports* the database
  client from it. On PostgreSQL it can place auth tables in their own
  `pgSchema("auth")` namespace — a sibling namespace in the same database, not
  a subfolder.
- **RedwoodJS** keeps `api/src/lib/auth.ts` and `api/src/lib/db.ts` side by
  side.
- **Django** treats `django.contrib.auth` as its own app, a sibling of every
  other app, with its own models.

Sharing a database is not the same as living inside the database module. Use a
separate Postgres schema for isolation if you need it; keep the modules
siblings.

## `.bionicjs/` — generated, and yours to delete

Every `bionicjs dev` run regenerates this directory:

```
.bionicjs/
├── server.ts       → the auth / db / ai / jobs server exports
├── hono.ts         → the Hono router typed from server/api/*.ts
└── api-client.ts   → the typed hc<AppRouter> client
```

It is **gitignored** and safe to delete at any time. BionicJS recreates it on
the next dev run. Never edit it, and never import from it by relative path —
import the public interface instead:

```ts
import { ai, db, auth, jobs } from "@bionicjs/core/server";
```

The dot prefix follows the same convention as every other framework: `.next/`,
`.nuxt/`, `.svelte-kit/`, `.farm/`. The dot is the signal that the framework
owns the directory and will overwrite it.

## `bionicjs.config.ts` — the single config

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
