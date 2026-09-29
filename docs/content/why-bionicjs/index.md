## The honest baseline

The reality of TypeScript and Python today: two separate ecosystems, two
runtimes, two deployment targets. Every "fullstack" TypeScript framework
pretends Python doesn't exist. Every Python framework ignores the frontend.

BionicJS is the bridge. One config, one build, one deployment — TypeScript
frontend + Python backend, wired together from day one.

## What React gives you

React is the UI layer. It handles rendering, state, and component
composition. Vite bundles it. The browser runs it. That's the contract.

What React doesn't give you: routing, server-side APIs, database access,
authentication, background jobs, or AI integration. Those are meta-framework
concerns.

## What is missing

Next.js fills some of those gaps — routing, SSR, API routes. But it's
TypeScript-only. If you need Python for AI, data processing, or background
jobs, you're back to wiring two systems together manually.

Nuxt fills similar gaps for Vue. SvelteKit for Svelte. But none of them
address the TypeScript + Python reality that most modern apps face.

## The meta-framework layer

A meta-framework sits between your code and the platform. It handles:

- **Routing**: file-system based, no manual configuration
- **Rendering**: CSR today, SSR planned
- **Server**: API routes, middleware, edge functions
- **Build**: bundling, optimization, deployment

BionicJS adds one more layer: **Python integration**. Not as an afterthought,
but as a first-class concern.

## BionicJS vs Next.js

| | BionicJS | Next.js |
|---|---|---|
| **Frontend** | React + Vite | React + Webpack/Turbopack |
| **Server** | Nitro | Next.js Server |
| **Python** | First-class (ai/, jobs/) | Manual setup |
| **Auth** | Plugin system | Manual / NextAuth |
| **Database** | Plugin system | Manual / Prisma |
| **AI** | Plugin system (OpenAI, Anthropic, Google, Ollama) | Manual SDK |
| **Jobs** | Plugin system (Celery, RQ, Dramatiq) | Manual / BullMQ |
| **Deploy** | Nitro presets (Vercel, Cloudflare, Docker, etc.) | Vercel optimized |
| **Config** | Single bionicjs.config.ts | Multiple files |

Next.js is excellent for TypeScript-only apps. BionicJS is for apps that need
Python alongside TypeScript — AI features, data pipelines, background
processing.
