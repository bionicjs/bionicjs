# bionicjs

The core package of the BionicJS meta-framework: a fullstack framework where
TypeScript owns the web (Vite + React + filesystem routing) and Python owns the
intelligence (AI and background jobs).

## Exports

- `defineConfig` — typed entry for `bionicjs.config.ts`
- `createAuthPlugin`, `createDatabasePlugin`, `createAiPlugin`,
  `createJobsPlugin` — factories the `@bionicjs/*` packages build on
- `api` — client-side RPC helper
- `BionicJSRouter` — mounts the app's filesystem routes
- `@bionicjs/core/server` — generated server exports (`auth`, `db`, `ai`, `jobs`)
- `@bionicjs/core/router` — route parser, generator, and layout adapter
- `runDevServer` — starts Vite + Nitro programmatically

## Config

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { betterAuth } from "@bionicjs/better-auth";
import { drizzle } from "@bionicjs/drizzle";

export default defineConfig({
  auth: betterAuth({ emailAndPassword: { enabled: true } }),
  database: drizzle({ provider: "sqlite", url: "file:./db.sqlite" }),
});
```

## Runtime

```ts
// client
import { api } from "@bionicjs/core";
const result = await api.users.sayHello({ name: "bionicjs" });

// server
import { auth, db, ai, jobs } from "@bionicjs/core/server";
```

## Development

The package has no standalone test suite; its behavior is exercised through the
end-to-end scaffolding tests in <code>create-bionicjs-app</code>.