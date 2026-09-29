## Middleware {#middleware}

BionicJS middleware runs in the Nitro server using h3's middleware shape. It
can intercept requests, check authentication tokens, and attach context
before the request reaches the specific `server/api/` handler.

```
HTTP request
      |
      v
  logging / auth / context   <-- middleware stack
      |
      v
   specific route handler    <-- server/api/health.ts
```

Middleware runs in the order it is registered, and each layer can short
circuit the chain — rejecting an unauthenticated request, rate limiting a
client, or adding request metadata that handlers can read. Because it sits
in front of the route handlers, it applies to an entire group of routes
without touching each one.

The middleware stack is where the auth boundary lives. A token check runs
once, in front of every protected route, instead of being repeated inside
each handler — and because it runs before the Python RPC boundary, an
unauthenticated request never costs you a Python roundtrip.

## Request lifecycle {#request-lifecycle}

A single API request moves through the stack in a fixed order:

1. The client fetches `/api/...` on the public origin.
2. In dev, Vite proxies the request to Nitro; in prod, Nitro receives it directly.
3. Middleware layers run in order — logging, auth, context, rate limiting.
4. The matched route handler runs with the context attached.
5. If the handler needs the intelligence layer, it calls the Python RPC boundary.
6. The response flows back through the stack to the client.

## Edge {#edge}

Because both Nitro and h3 are built on standard Web APIs (`Request`,
`Response`, `fetch`), the entire BionicJS server layer is fully
edge-compatible. It can be deployed to Cloudflare Workers, Vercel Edge, or
Deno Deploy without modification.

| Target | Runtime | Changes needed |
|--------|---------|----------------|
| Node.js (VPS, container) | Node | None |
| Cloudflare Workers | Workers runtime | Nitro preset only |
| Deno | Deno runtime | Nitro preset only |
| Bun | Bun runtime | Nitro preset only |

The code you write is identical in every case — route handlers stay
`defineEventHandler`, middleware stays h3-flavored, and the generated RPC
boundary stays a Web-standard `fetch`. Changing the deployment target is a
build preset, not a rewrite.
