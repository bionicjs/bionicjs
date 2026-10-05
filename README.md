# BionicJS

The full-stack React framework for the AI era: React UI and Python intelligence in one codebase.

BionicJS is an early-stage full-stack web framework. It owns the `app/` route directory, generates a typed client/server boundary at build time, and composes small plugin packages for AI providers, authentication, databases, and background jobs instead of baking combinations into a scaffold. React runs the UI, Nitro runs the server, and Python runs the intelligence.

> BionicJS is in development. Public APIs may change before 1.0.

## Why BionicJS?

- **Intelligence native.** Co-locate a React route with its Python AI model. Python capabilities live under `ai/` in the same project, and calling a model from a React component is as type-safe as a local function call.
- **Decoupled filesystem routing.** Routes are discovered from `app/` by a build-time AST parser and compiled into a `RouteManifestNode` tree. No runtime filesystem scanning, no central route registry.
- **Fast feedback.** Vite drives instant frontend HMR while Nitro provides the production server runtime, so development stays lightweight and production output stays portable.
- **Type-safe boundaries.** Generated RPC contracts make server handlers, queries, and Python model calls fail at build or type-check time when they drift from the implementation. (The generated typed HTTP client is not wired up yet — see below.)
- **Zero-config ergonomics.** No `index.html`, no `vite.config.ts`, no `nitro.config.ts`. Vite and Nitro are created and configured programmatically by `@bionicjs/dev`; your project has one script, `dev`.
- **Composable capabilities.** Auth, databases, background jobs, and LLM providers are opt-in plugins composed in `bionicjs.config.ts`. Capabilities you do not select add no runtime cost.

## Quick start

Create a new BionicJS application:

```bash
npx create-bionicjs-app my-app
cd my-app
npm run dev
```

`bionicjs dev` starts two servers: Vite on port 3000 for the client, and Nitro on port 3001 for the server. Vite proxies `/api` to Nitro, so the browser only ever talks to a single origin and there is no CORS to configure.

A file in `server/api/` is an endpoint. There is no API router to register:

```ts
// server/api/health.ts
import { defineEventHandler } from "h3";

export default defineEventHandler(() => ({ status: "ok" }));
```

`h3` is a direct dependency of the template, but only because the line above imports it — pnpm will not resolve a transitive dep from your source. Its range is pinned to exactly what Nitro resolves, so there is one copy. See [Nitro & h3](https://bionicjs.dev/docs/nitro-h3) for the full request path and the two-copies failure this prevents.

## Documentation

Guides and API reference live at [bionicjs.dev](https://bionicjs.dev):

- [The stack](https://bionicjs.dev/docs/stack) — what runs where, and why
- [Nitro & h3](https://bionicjs.dev/docs/nitro-h3) — the live request path
- [Hono](https://bionicjs.dev/docs/hono) — the generated client, and its current state
- [Learn](https://bionicjs.dev/learn/why-a-meta-framework) — how the machinery works
- [Blog](https://bionicjs.dev/blog) — notes on the internals
- Filesystem routing and the RPC boundary
- AI capabilities and LLM providers
- Authentication, databases, and background jobs
- Middleware, edge features, and deployment

## Project structure

```text
my-app/
├── app/
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page (/)
├── ai/                     # Python intelligence (present when AI is enabled)
│   └── llm.py
├── server/
│   └── api/
│       └── health.ts       # h3 API route (GET /api/health)
├── public/                 # Static assets
└── package.json
```

## Routing conventions

| File path | URL | Description |
| --- | --- | --- |
| `app/layout.tsx` | - | Root layout wrapping the application |
| `app/page.tsx` | `/` | Index route |
| `app/about/page.tsx` | `/about` | Static route |
| `app/users/[id]/page.tsx` | `/users/:id` | Dynamic route (`params.id`) |
| `app/docs/[...slug]/page.tsx` | `/docs/*` | Catch-all route (`params["*"]`) |
| `app/dashboard/layout.tsx` | `/dashboard` | Nested layout |

### Writing a layout

Layouts are standard React components using children composition:

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      {children}
    </div>
  );
}
```

### Writing a page

```tsx
// app/users/[id]/page.tsx
import { useParams } from "react-router";

export default function UserPage() {
  const { id } = useParams();
  return <h1>User Profile: {id}</h1>;
}
```

## Integrations

Capability plugins ship as separate `@bionicjs/*` packages and are composed under keys in `bionicjs.config.ts`:

| Category | Packages | Docs |
| --- | --- | --- |
| AI providers | `@bionicjs/anthropic`, `@bionicjs/google`, `@bionicjs/ollama`, `@bionicjs/openai` | [bionicjs.dev/docs/ai](https://bionicjs.dev/docs/ai) |
| Authentication | `@bionicjs/better-auth`, `@bionicjs/clerk`, `@bionicjs/firebase`, `@bionicjs/supabase`, `@bionicjs/workos` | [bionicjs.dev/docs/auth](https://bionicjs.dev/docs/auth) |
| Databases | `@bionicjs/drizzle`, `@bionicjs/kysely`, `@bionicjs/prisma`, `@bionicjs/sql` | [bionicjs.dev/docs/database](https://bionicjs.dev/docs/database) |
| Background jobs | `@bionicjs/celery`, `@bionicjs/dramatiq`, `@bionicjs/rq` | [bionicjs.dev/docs/jobs](https://bionicjs.dev/docs/jobs) |

Deployment is handled through Nitro presets for Node.js/Docker, Vercel, Netlify, Cloudflare Workers, Deno Deploy, Fly.io, Railway, Render, and AWS Lambda. See [bionicjs.dev/docs/deployment](https://bionicjs.dev/docs/deployment).

## Architecture

BionicJS isolates framework concerns so application code stays clean and standard. Routes are discovered from `app/` at build time and compiled into a React Router tree, and `server/api` handlers are compiled into an h3 router by Nitro.

```text
app/ filesystem -> route scanner -> RouteManifestNode -> generator -> virtual:bionicjs-routes -> React Router -> React DOM
server/api/*.ts -> Nitro route scan -> h3 router -> endpoint
```

### Known gaps

Stated plainly, because the docs elsewhere have not been:

- **No production build yet.** The scaffolded `package.json` exposes only `dev`. There is no `bionicjs build` or `bionicjs start`, and `@bionicjs/core/server` currently resolves through a dev-time alias rather than for real in a build. Nitro's deploy presets are inherited but not yet exposed.
- **The generated Hono client is not mounted.** `@bionicjs/dev` writes `.bionicjs/hono.ts` and `.bionicjs/api-client.ts`, but nothing mounts the router, and its bridge calls handlers as plain functions while `server/api/*.ts` export h3 event handlers. Endpoints work today through Nitro + h3; the typed client does not. [Hono](https://bionicjs.dev/docs/hono) lays out the open decision.

```text
app/ filesystem -> route scanner -> RouteManifestNode -> generator -> virtual:bionicjs-routes -> React Router -> React DOM
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full package map, request flow, design principles, and key components.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, workflow, and commit conventions. Report security issues via [SECURITY.md](SECURITY.md).

## License

MIT