## Established tools, no abstractions

The stack is deliberately unoriginal: React and Vite for the client,
Nitro for the server, and Python with its mature libraries for AI and
jobs. bionicjs ties them together rather than replacing them.

## Client — React + Vite

React renders the UI; Vite bundles it. Routing is filesystem-based and
compiled ahead of time into React Router routes. You get HMR in dev and
a small, standard production bundle.

## Server — Nitro

Nitro is the server engine: the HTTP server, middleware, the `/api`
proxy target, and the `.output/` build contract. Hono sits inside it as
the request handler, hidden from the developer API.

## Python — AI and jobs

Python is first-class, not bolted on. `ai/` holds LLM providers,
agents, RAG, and MCP; `jobs/` holds Celery, RQ, and Dramatiq with a
Redis or RabbitMQ broker. Both live at the top level, beside the app.

## Why this combination

Each tool is already the best-in-class at one job. The framework's value
isn't a new runtime — it's the config that wires all three together and
the build that deploys them as one.