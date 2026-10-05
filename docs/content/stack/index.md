## Established tools, no abstractions

The stack is deliberately unoriginal: React and Vite for the client,
Nitro for the server, and Python with its mature libraries for AI and
jobs. bionicjs ties them together rather than replacing them.

## Client — React + Vite

React renders the UI; Vite bundles it. Routing is filesystem-based and
compiled ahead of time into React Router routes. You get HMR in dev and
a small, standard production bundle.

## Server — Nitro + h3

Nitro is the server engine: the HTTP server, middleware, the `/api`
proxy target, and the `.output/` build contract. It is built on **h3**,
which is the handler shape your route files are written in — an event
handler exported with `defineEventHandler`.

A file in `server/api/` is an endpoint. Nothing else is required:

```ts server/api/health.ts
import { defineEventHandler } from "h3";

export default defineEventHandler(() => ({ status: "ok" }));
```

Neither Nitro nor h3 is exposed as a bionicjs API. You write handlers
using their standard shape, and both stay implementation details.

## Hono — the generated client, not the server

Hono is a separate project that bionicjs uses for **type inference**, not
for serving requests. `@bionicjs/dev` reads your `server/api` tree and
generates a Hono router plus a typed `hc<AppRouter>` client into
`.bionicjs/`.

That layer is generated but **not mounted** yet, so the typed client does
not currently work. Every request today goes through Nitro and h3. See
[Hono](/docs/hono) for the details and the open design decision.

## Python — AI and jobs

Python is first-class, not bolted on. `ai/` holds LLM providers,
agents, RAG, and MCP; `jobs/` holds Celery, RQ, and Dramatiq with a
Redis or RabbitMQ broker. Both live at the top level, beside the app.

## Why this combination

Each tool is already the best-in-class at one job. The framework's value
isn't a new runtime — it's the config that wires all three together and
the build that deploys them as one.

## How this compares

This is a well-trodden combination rather than a novel one. **Nuxt** is
the closest architectural sibling: Vite for the client, Nitro and h3 for
the server, the same `server/api` convention, and a framework that owns
the Nitro configuration so you never write one.

**Redwood** is the layout sibling: the flat set of top-level capability
directories (`api`, `auth`, `db`, `jobs`) is Redwood's, not bionicjs's.
bionicjs keeps `ai/` and `jobs/` at the root because both are Python and
both run out-of-process.

For the full map, including Next.js, SvelteKit, React Router, TanStack
Start, and Astro, see
[How meta-frameworks work](/learn/how-meta-frameworks-work).
