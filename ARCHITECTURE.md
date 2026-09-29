# BionicJS Architecture

This document describes how BionicJS is composed and the design decisions behind it. BionicJS is in development, so treat the checked-out source, package manifests, tests, and templates as the authoritative contract rather than any prose here.

## High-level architecture

BionicJS is a monorepo of small packages that together form a full-stack framework: a Vite-powered dev server, a Nitro-powered server runtime, a build-time filesystem router, a generated typed RPC boundary, and composable capability plugins.

```
         create-bionicjs-app (project generator)
                    |
                    v
        bionicjs.config.ts + app/ + server/api/ + ai/
                    |
                    v
                bionicjs dev (@bionicjs/dev)
        +-----------------------------+
        |  Vite  (port 3000)          |
        |   |- bionicjs-routes plugin     |
        |   |    fast-glob -> parser  |
        |   |    -> virtual:routes    |
        |   |- React + HMR            |
        |   '- /api proxy             |
        +-----------------------------+
                    |           \
                    |  /api       \  server pages
                    v             v
        +------------------------------+
        |  Nitro (port 3001)          |
        |   |- Hono router (/api/**)  |
        |   '- plugin server exports  |
        +------------------------------+
```

## Package structure

### Core packages

| Package | Directory | Responsibility |
| --- | --- | --- |
| `@bionicjs/core` | `packages/bionicjs` | Core framework: configuration, route parser and generator, React Router adapter, client entry, RPC client stub, plugin utilities and types |
| `@bionicjs/dev` | `packages/dev` | Programmatic dev server (Vite + Nitro), the `virtual:bionicjs-routes` Vite plugin, and the `.bionicjs/` generators (RPC, server exports, config loading) |
| `create-bionicjs-app` | `packages/create-bionicjs-app` | Interactive project generator and composable templates (`base`, `ai`, `auth`, `database`, `jobs`) |

### Capability plugins

`packages/bionicjs-*` provide the composable integrations, each a `BionicJSPlugin` composed under a key in `bionicjs.config.ts`:

- AI providers: `@bionicjs/anthropic`, `@bionicjs/google`, `@bionicjs/ollama`, `@bionicjs/openai`
- Authentication: `@bionicjs/better-auth`, `@bionicjs/clerk`, `@bionicjs/firebase`, `@bionicjs/supabase`, `@bionicjs/workos`
- Databases: `@bionicjs/drizzle`, `@bionicjs/kysely`, `@bionicjs/prisma`, `@bionicjs/sql`
- Background jobs: `@bionicjs/celery`, `@bionicjs/dramatiq`, `@bionicjs/rq`

### Documentation

`docs/` is the BionicJS documentation site (bionicjs.dev) and the reference for routing, the RPC boundary, AI capabilities, jobs, and deployment.

## Request flow

### Development

1. `bionicjs dev` runs `generateAll` first: it loads `bionicjs.config.ts` with jiti, calls `setup` on every plugin, and writes the generated `.bionicjs/server.ts` (plugin server exports) plus the RPC artifacts `.bionicjs/hono.ts` and `.bionicjs/api-client.ts`.
2. Nitro starts on port 3001 in dev mode; the `/api` prefix is proxied there from Vite.
3. Vite starts on port 3000 with aliases that resolve `#bionicjs-api` to `.bionicjs/api-client.ts` and `@bionicjs/core/server` to `.bionicjs/server.ts` at dev time.
4. The `bionicjs-routes` Vite plugin scans `app/**/{page,layout}.tsx` with fast-glob, hands the paths to `parseRoutes`, and serves the generated route module as `virtual:bionicjs-routes`. File creation, removal, and renames trigger HMR through the plugin's `configureServer` watcher.
5. The `bionicjs-html` middleware injects the HTML shell (a `#root` div and the `entry-client` module), which hydrates the app with `createRoot` + `StrictMode` and a `BionicJSRouter`.
6. Client RPC calls (`api.<path>.<method>(args)`) are generated from the Hono `AppRouter` type, POST to `/api/<path>`, are proxied to Nitro, and hit the compiled Hono router, which invokes the matching handler from `server/api/`.

The ai/auth/db/jobs exports under `@bionicjs/core/server` are provided at dev time by the generated `.bionicjs/server.ts`; the checked-in `server.ts` and `api-client.ts` stubs exist so imports resolve in source and are marked AUTO-GENERATED to signal the dev-time replacement.

### Production

- The route manifest is computed at build time, so the production server never scans the filesystem for routes.
- Route modules are emitted as `lazy` imports inside React Router route objects, giving per-route code splitting.
- The server runtime is Nitro-backed, so output is portable across the documented deployment presets (Node/Docker, Vercel, Netlify, Cloudflare Workers, Deno Deploy, Fly.io, Railway, Render, AWS Lambda).
- The RPC client uses the same generated Hono client type against the built `/api` router.

## Design principles

- **Build-time routing.** Routes are parsed and validated during the build; nothing is discovered at request time.
- **Predictable full-stack boundaries.** The generated RPC client and the server router are produced from the same source, so the boundary can fail at type-check time instead of at runtime.
- **Composable capabilities.** Features ship as opt-in plugins under `bionicjs.config.ts` keys. Unselected capabilities add no runtime cost.
- **Zero-config ergonomics.** No `index.html` and no `nitro.config.ts`; the framework owns the build environment.
- **Co-located intelligence.** React routes and their Python AI models live in the same project tree (`app/` and `ai/`).
- **Vite for development, Nitro for production.** Development keeps the Vite HMR loop; production output is built for a server runtime.

## Key components

| Component | File | Responsibility |
| --- | --- | --- |
| Route parser | `packages/bionicjs/src/router/parser.ts` | Builds a `RouteManifestNode` tree from `page.tsx`/`layout.tsx` paths; detects conflicts between dynamic and catch-all segments at the same level |
| Route conventions | `packages/bionicjs/src/router/conventions.ts` | `page.tsx`/`layout.tsx` matching, `[id]` dynamic and `[...slug]` catch-all segment helpers |
| Route generator | `packages/bionicjs/src/router/generator.ts` | Emits React Router route objects with `lazy` modules and layout composition |
| Layout adapter | `packages/bionicjs/src/router/adapter.tsx` | Wraps a layout component around the child `<Outlet />` |
| Router | `packages/bionicjs/src/router.tsx` | `BionicJSRouter` builds a `createBrowserRouter` from `virtual:bionicjs-routes` |
| Vite plugin | `packages/dev/src/plugins/routes.ts` | Provides the `virtual:bionicjs-routes` module from a fast-glob scan and sends route changes to Vite HMR |
| Generators | `packages/dev/src/generator.ts` | `generateAll`, `generateRPC` (compiles `server/api` into a Hono router and its client), `generateServerExports`, `loadConfig` |
| Dev server | `packages/dev/src/index.ts` | Boots Vite and Nitro, serves the HTML shell, proxies `/api`, and wires the `#bionicjs-api`/`@bionicjs/core/server` aliases |
| Config and plugins | `packages/bionicjs/src/config.ts`, `packages/bionicjs/src/plugin-utils.ts` | `defineConfig`, `BionicJSPlugin` shape, and the `createAuthPlugin`/`createDatabasePlugin`/`createAiPlugin`/`createJobsPlugin` helpers |
| Client entry | `packages/bionicjs/src/entry-client.tsx` | React root creation, `StrictMode`, and the app's `globals.css` import |

## Generated artifacts are a contract

- `.bionicjs/hono.ts` and `.bionicjs/api-client.ts` are produced from `server/api/` and are the single source for the RPC type boundary.
- `.bionicjs/server.ts` re-exports what each plugin contributes to `@bionicjs/core/server`.
- `virtual:bionicjs-routes` is produced from `app/` and is the single source for the route table.
- The checked-in `server.ts` and `api-client.ts` files are dev stubs and are labeled AUTO-GENERATED; do not implement framework behavior in them.

## Testing strategy

- Package tests: `packages/bionicjs/src/router/router.test.ts` and `integration.test.ts` cover parsing, conflict detection, and route module generation; `packages/bionicjs/src/router/vite-e2e.test.ts` exercises the plugin output end to end.
- Generator tests: `packages/create-bionicjs-app` runs `node --test` over scaffolding behavior.
- Workspace: `pnpm typecheck` and `pnpm test` run all packages recursively.

## Performance considerations

- Route discovery happens once at build time, so runtime has zero scanning overhead.
- Route modules are `lazy`, so each page loads its own chunk.
- Development keeps HMR on the Vite loop; the Nitro server is only exercised for `/api` and server concerns.
- Generated modules are served through a virtual module, so the parser output is not duplicated on disk at runtime.