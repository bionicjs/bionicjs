Two of our documentation pages said, in different words, that Hono is the
request handler inside Nitro. One of them had a callout explaining that
this was *not* the case. Both were wrong, and the truth is more
interesting than either version.

## What Hono is

Hono is a small web framework built on the Fetch API. Handlers take a
context object and return a response, with no Node types involved:

```ts
app.get("/api/health", (c) => c.json({ status: "ok" }));
```

That design is why it runs unchanged on Node, Bun, Deno, Cloudflare
Workers, and the edge.

The thing to be clear about: **Hono is not built on h3, and h3 is not
built on Hono.** They are separate projects solving overlapping problems.
Nitro happens to use h3 internally. Mounting Hono in a Nitro server means
choosing a different request handler for the same server — not adding a
layer on top of one, and certainly not a second server.

## What we generate, and why

Hono has one trick worth stealing. A router is an ordinary value, so its
own type describes every route it registered:

```ts
const app = new Hono().get("/api/health", (c) => c.json({ status: "ok" }));
export type AppRouter = typeof app;
```

Export that type and the client is typed for free. No `openapi.json`, no
`proto` compiler, no generated client package. This is the best answer
anyone has come up with to the problem every full-stack framework has:
typing across the network boundary.

So `@bionicjs/dev` reads your `server/api` tree and writes two files:

```ts .bionicjs/hono.ts
// AUTO-GENERATED
import { Hono } from "hono";
import route_health from "../server/api/health";

const app = new Hono().basePath("/api");
const routes = app
  .post("/health", async (c) => {
    const args = await c.req.json().catch(() => undefined);
    const result = await route_health(args);
    return c.json(result);
  });

export type AppRouter = typeof routes;
export default app;
```

```ts .bionicjs/api-client.ts
import { hc } from "hono/client";
import type { AppRouter } from "./hono";

const client = hc<AppRouter>("/");
export const api = client.api;
```

`AppRouter` is the load-bearing export. Every method name, argument type,
and return type on the client is inferred from it.

## What actually happens

Nothing mounts that router.

Nitro is never told `.bionicjs/hono.ts` exists. It scans `server/api`,
builds an h3 router, and serves every endpoint through that. `GET
/api/health` returns `200 {"status":"ok"}` — from `server/api/health.ts`,
as an h3 event handler, with no Hono involved at any point.

Meanwhile the generated `api` client points at a router that no server is
running.

There is a second problem, and it is the more interesting one. Even if we
mounted the router tomorrow, it would not work. The bridge calls
`route_health(args)` — a plain function call. But your route file
default-exports `defineEventHandler(() => ...)`, an h3 handler that
expects an `H3Event`. The two layers do not agree on what a handler is.

So: generated, unmounted, and contract-incompatible. We would rather say
that in one paragraph than let you discover it from a `404`.

## What Nitro says about Hono

Hono is the most common server entry in the Nitro ecosystem, with Elysia,
Express, and Fastify. The documented approach is a `server.ts` entry that
handles everything:

```ts server.ts
import { Hono } from "hono";

export default new Hono().get("/api/*", (c) => c.text("Hono handled it"));
```

It is a catch-all, so more specific filesystem routes still win. You
register it with `serverEntry` in `nitro.config.ts`, and on current Nitro
you add `import { nitro } from "nitro/vite"` so one Vite dev server owns
both halves.

A caveat we keep having to restate: we run `nitropack@2.13.4`. `serverEntry`
and `nitro/vite` are Nitro v3 APIs. On 2.13 the equivalents are
`handlers` in the config and starting Nitro yourself — which is what
`@bionicjs/dev` already does. Copying v3 snippets into this codebase
without upgrading will not work.

## The option we should have mentioned first

Nitro already emits per-route types of its own:

```ts .nitro/types/nitro-routes.d.ts
interface NitroRoutes {
  "/api/health": { "get": { "/api/health": { ... } } };
}
```

Those feed the typed `event.$fetch()` helper, so a server handler can call
its own API with full type checking and no generated client at all.

One trap: `NitroApp` in `nitropack@2.13` is the type of the *runtime
instance* — `h3App`, `router`, `hooks`, `localFetch` — not a client-side
route map. It is not the analogue of Hono's `AppRouter`. `nitro-routes.d.ts`
and `$Fetch` are.

## The actual decision

| | Mount Hono as the server entry | Rely on Nitro's native types |
| --- | --- | --- |
| Handler shape | Plain functions taking args, returning data | h3 handlers receiving an `H3Event` |
| Client typing | `hc<AppRouter>` — a real browser client | Server side only; the browser needs its own fetch layer |
| Cost | A second routing layer and a bridge to keep in sync | Nothing extra, but the browser client is ours to write |

The honest tension: `hc` is genuinely good, and the cost is that a request
needing a cookie header, a redirect, or a streamed response is awkward to
express as `(args) => data`. An `H3Event` is not a nuisance — it is where
status codes, cookies, and streaming live.

We have not decided. Two things are true at once: the file-based API works
today and works without Hono, and the typed client we promised does not
yet work at all. The `server/api` convention will not change either way,
because that is the part you touch.

If you have a use case that decides this — streaming responses to the
browser, or a typed client you want today — we would like to hear it.

## Read next

- [Hono](/docs/hono) — the reference version of this post
- [Nitro & h3](/docs/nitro-h3) — the live request path
- [How BionicJS runs](/blog/how-bionicjs-runs)
