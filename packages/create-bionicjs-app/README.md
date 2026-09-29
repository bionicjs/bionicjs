<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="../../docs/public/icon-dark.svg" />
    <img src="../../docs/public/icon-light.svg" alt="bionicjs" width="120" />
  </picture>
</p>

<h1 align="center">create-bionicjs</h1>

<p align="center"><em>One command builds your whole project.</em></p>

Scaffolds a new BionicJS application from composable templates.

A BionicJS application has a web application (`app/`), a Nitro server with
TypeScript capabilities (`server/`), and first-class Python capabilities for
AI (`ai/`) and background jobs (`jobs/`).

## Stack

- Client: React + Vite (`app/`), keeping the framework's own `page.tsx` /
  `layout.tsx` conventions
- Server: Nitro (TypeScript) — API routes, auth, database under `server/`
- Python: AI (`ai/`) and background jobs (`jobs/`) — no BionicJS abstraction,
  templates integrate the established libraries (Prisma, Drizzle, Kysely,
  better-sqlite3, LiteLLM-compatible SDKs, Celery, RQ, Dramatiq)

## Usage

```sh
create-bionicjs my-app
```

Runs interactively, or provide everything up front:

```sh
create-bionicjs my-app \
  --auth clerk \
  --database postgresql \
  --toolkit drizzle \
  --ai openai,agents,mcp \
  --jobs celery \
  --broker redis
```

Run `create-bionicjs --help` for the full option list. Non-interactive shells
skip the prompts and apply only the provided flags.

Interactively, single-choice fields (auth, database, toolkit, jobs, broker)
use arrow-key menus, AI capabilities are a multi-select checklist (space to
toggle, Enter to confirm), and everything can be left as "None".

## Templates

Templates are small and composable. The generator always applies `base`, then
the selected feature templates in order.

```
templates/
├── base/                     the minimal BionicJS application (Vite client + Nitro server)
├── auth/                     TypeScript authentication, under server/auth/
│   ├── better-auth/
│   ├── clerk/                @clerk/backend on the server, @clerk/clerk-react in app/
│   ├── firebase/
│   ├── supabase/
│   └── workos/
├── database/                 database access, under server/db/
│   ├── prisma/
│   │   ├── postgresql/
│   │   └── sqlite/
│   ├── drizzle/
│   │   ├── postgresql/
│   │   └── sqlite/
│   ├── kysely/
│   │   ├── postgresql/
│   │   └── sqlite/
│   └── sql/                  raw driver
│       ├── postgresql/
│       └── sqlite/
├── ai/                       AI capabilities (Python), under ai/
│   ├── llm/                  flat modules per provider (ai/llm/openai.py, …)
│   ├── agents/
│   ├── rag/
│   ├── tools/
│   ├── prompts/
│   └── mcp/
└── jobs/                     background jobs (Python), under jobs/
    ├── celery/
    ├── rq/
    ├── dramatiq/
    └── brokers/
        ├── redis/
        └── rabbitmq/
```

No database at all is a valid choice: `--database none` (the default) leaves
the project without a `server/db/`. The database (postgresql vs sqlite) is
picked first, then the access layer (treated as a first-class flag) that talks
to it. A toolkit without a database is rejected, so every combination is
scaffolded explicitly:

| | postgresql | sqlite |
| --- | --- | --- |
| prisma | `@prisma/adapter-pg` | `@prisma/adapter-better-sqlite3`, `file:./dev.db` |
| drizzle | `pg` + pg-core | `@libsql/client` + sqlite-core |
| kysely | `pg` + `PostgresDialect` | `better-sqlite3` + `SqliteDialect` |
| sql | `postgres` | `better-sqlite3` |

There is one template per selection — no baked-in combinations. A project with
AI and jobs needs only the selected `ai/…` and `jobs/…` templates, never a
whole project copy.

### Composition

```sh
create-bionicjs my-app --auth clerk --database sqlite --toolkit prisma --ai openai --jobs celery --broker redis
```

produces

```
my-app/
├── app/
│   ├── layout.tsx                 root layout component
│   ├── routes/                    file-based routes (Next.js App Router style)
│   │   ├── page.tsx               `/`
│   │   └── about/page.tsx         `/about`
│   ├── components/                React components
│   └── lib/
│       └── router.ts              route table built from app/routes at build time
├── main.tsx                       client entry (mounts the router)
├── server/
│   ├── api/health.ts             Nitro route handler
│   ├── auth/clerk.ts
│   └── db/client.ts
├── prisma/
│   └── schema.prisma
├── ai/
│   └── llm/openai.py
├── jobs/
│   └── celery/
├── public/
├── index.html
├── package.json
├── pyproject.toml
├── vite.config.ts
├── nitro.config.ts
└── bionicjs.config.ts
```

The Vite dev server proxies `/api` to Nitro. Only the directories for the
selected capabilities are generated. A project without AI has no `ai/`
directory; a project without jobs has no `jobs/`.

### Architecture rules

- `app/` is the web application. `app/layout.tsx` is the root layout and
  `app/routes/` holds file-based routes, like the Next.js App Router — each
  folder is a URL path and its `page.tsx` the route component (`page.tsx` is
  `/`, `about/page.tsx` is `/about`, `blog/[slug]/page.tsx` is
  `/blog/:slug`). `app/lib/router.ts` turns the folder structure into React
  Router routes at build time, so adding a route is adding a folder — no route
  table to edit. `app/components/` and `app/lib/` hold React components and
  shared TypeScript helpers. `main.tsx` at the project root is the client
  entry that mounts the router (the future BionicJS runtime will own this
  composition).
- `server/` is the Nitro server (TypeScript). `server/api/` holds API route
  handlers; `server/auth/` and `server/db/` hold capability code. There is no
  generic `backend/` directory.
- `ai/` and `jobs/` are first-class capabilities — never `server/ai/` or
  `server/jobs/`.
- Python is an implementation language for AI and jobs, not a directory
  everything lives under.
- Auth, database, AI, and jobs providers are independent: selecting an auth
  provider never adds database code, and vice versa.

### Design decisions

- Integrate established tools; do not build BionicJS abstractions. Database
  templates wire real ORMs/drivers, and Nitro's own `db0` layer stays out of
  the templates.
- SQLite is the database chosen by default in the sample scaffolds, matching
  the ecosystem convention of scaffolding tools (create-t3-app defaults to
  SQLite). The template matrix covers both engines explicitly, so nothing is
  hidden behind a default.
- LLM providers are flat modules (`ai/llm/openai.py`) exporting an official
  SDK client. No per-provider package, no hand-rolled LLM abstraction.
  LiteLLM (Python) and the Vercel AI SDK are the mature options if a unified
  interface is ever wanted.
- Clerk targets Vite/Nitro directly: `@clerk/backend` for
  `server/auth/clerk.ts` and `@clerk/clerk-react` for the client; no
  framework middleware.

## Merge strategy

Each template's files are relative to the generated project root. When a
template writes a path that already exists, the strategy is:

| File | Strategy |
| --- | --- |
| `package.json` | JSON deep merge. Base owns metadata and scripts; feature fragments contribute dependency sections and scripts. |
| `pyproject.toml` | Section merge. Keys under a `[project.dependencies]` section (and similar tables) are appended unless already present. |
| `.env.example` | Key merge. Lines whose `KEY=` is already defined are skipped; comments and blank lines are kept once. |
| everything else | Last writer wins. Template files map to distinct capability directories, so conflicts are rare; the clerk template deliberately replaces `main.tsx` to add `ClerkProvider`. |

Dependencies for the selected capability are merged into `package.json` and
`pyproject.toml` automatically. Credentials and configuration live in
`.env.example` as documented placeholder values.

## Development

```sh
npm install
npm test      # node --test
npm run typecheck
```