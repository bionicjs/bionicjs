## What Hono is

Hono is a small, fast web framework built on the Fetch API's `Request` and
`Response`. Its handlers receive a context object `c` and return a
response, with no Node-specific types in sight. That is why the same
router runs unchanged on Node, Bun, Deno, Cloudflare Workers, and the edge.

```ts
app.get("/api/health", (c) => c.json({ status: "ok" }));
```

The important correction, because it comes up constantly: **Hono is not
built on h3, and h3 is not built on Hono.** They are independent projects
that solve overlapping problems at different layers. Nitro happens to use
h3 internally. If you mount Hono as a server entry, you are choosing a
different request handler for the same Nitro server — not adding a second
server.

## The idea: types without codegen

Hono has a trick worth stealing. A router is an ordinary value, so the
router's own type describes every route it registered. Expose that type
and the client is typed for free — no `openapi.json`, no `proto`
compiler, no generated client package.

```ts
// server
const app = new Hono()
  .get("/api/health", (c) => c.json({ status: "ok" }));
export type AppRouter = typeof app;   // routes are known at the type level

// client
import { hc } from "hono/client";
const client = hc<AppRouter>("/");
await client.api.health.$get();       // typed, autocomplete, refactor-safe
```

bionicjs generates exactly that pair from your `server/api` tree, so a
file-based endpoint is also an end-to-end typed client method.

## What gets generated

`generateRPC()` in `@bionicjs/dev` globs `server/api/**/*.ts` and emits
two files into `.bionicjs/`. Given a single `health.ts` endpoint, the
output is:

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
// AUTO-GENERATED
import { hc } from "hono/client";
import type { AppRouter } from "./hono";

const client = hc<AppRouter>("/");
export const api = client.api;
```

The `AppRouter` export is the load-bearing one. Everything downstream —
the client's method names, the argument types, the return types — is
inferred from it.

## Current state: not mounted

This is the honest part. The Hono layer is **not currently part of the
request path**. Two things are unfinished, and both are worth naming
rather than implying the typed client works.

1. **Nothing mounts the router.** Nitro is never told
   `.bionicjs/hono.ts` exists. It keeps serving `server/api` through h3,
   which is why `/api/health` genuinely returns `200`. The generated
   `api` client points at a router that no server is running.

2. **The two layers disagree on the handler contract.** The bridge above
   calls `route_health(args)` as a plain function. But
   `server/api/health.ts` default-exports `defineEventHandler(() => ...)`,
   an h3 handler that expects an `H3Event`. Mounting the router as
   written would call the wrong function with the wrong argument.

> The file-based API works today, and it works *without* Hono. The typed
> client is the missing half.

## The Hono integration in Nitro

Hono is the most common server entry in the Nitro ecosystem, alongside
Elysia, Express, and Fastify. Nitro's documented approach is a
`server.ts` entry that handles everything:

```ts server.ts
import { Hono } from "hono";

export default new Hono().get("/api/*", (c) => c.text("Hono handled it"));
// or mount it: app.route("/api", routes), or export `{ fetch }`
```

The entry is a catch-all for unmatched requests, so more specific
filesystem routes still win. You register it with `serverEntry` in
`nitro.config.ts`, and with current Nitro you add the framework's Vite
plugin `import { nitro } from "nitro/vite"` so one Vite dev server owns
both halves.

> **Version caveat.** bionicjs currently runs `nitropack@2.13.4`. The
> `serverEntry` option and the `nitro/vite` plugin are Nitro v3 APIs. On
> 2.13 the equivalents are `handlers` in `nitro.config.ts` and starting
> Nitro yourself — which is what `@bionicjs/dev` already does. Do not copy
> v3 snippets into this codebase without upgrading.

## Native typing in Nitro

Before adding a second router, it is worth asking what Nitro already
gives you. It emits per-route type declarations at dev time:

```ts .nitro/types/nitro-routes.d.ts
interface NitroRoutes {
  "/api/health": { "get": { "/api/health": { ... } } };
}
```

Those declarations feed the typed `event.$fetch()` helper, so a server
handler can call its own API with full type checking and no generated
client at all:

```ts server/api/report.ts
export default defineEventHandler(async (event) => {
  const { rows } = await event.$fetch("/api/health");  // typed from the route table
  return { rows };
});
```

Note what `NitroApp` is, because it is easy to guess wrong: in
`nitropack@2.13` it is the type of the *runtime instance* — `h3App`,
`router`, `hooks`, `localFetch` — not a client-side route map like Hono's
`AppRouter`. For client-side typing, `nitro-routes.d.ts` and `$Fetch` are
the surfaces.

## The open decision

Two coherent designs, and the framework has not committed yet. Both are
defensible; they differ in what a browser client has to do.

| | Mount Hono as the server entry | Rely on Nitro's native types |
| --- | --- | --- |
| **Handler shape** | Plain functions taking args, returning data. No event object. | h3 handlers receiving an `H3Event`. Status, headers, cookies, streaming. |
| **Client typing** | `hc<AppRouter>` gives a real client for the browser. | Route table types the server side; the browser needs a hand-written or generated fetch layer. |
| **Cost** | A second routing layer plus a bridge that has to keep two contracts in sync. | Nothing extra — but the browser client is on us. |

The honest summary: `hc` is genuinely nice, and the cost is that a
request needing a cookie header, a redirect, or a streamed response
becomes awkward to express through a plain `(args) => data` function.
Whichever way this goes, the `server/api` file convention should not
change — that is the part users touch.

- Either way, the fix for the contract mismatch is the same: pick one
  handler shape and make the generator emit a bridge that matches it.
- If Hono is mounted, it also needs a server entry — generating the
  router is not enough.
- The h3/Nitro path must keep working as a fallback. It is what currently
  serves every endpoint.
