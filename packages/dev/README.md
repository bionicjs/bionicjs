# @bionicjs/dev

The dev server and build tooling for BionicJS. This package owns the
`bionicjs` CLI, depends on `@bionicjs/core`, and owns every piece of
framework wiring a project never has to see: Vite, Nitro, Tailwind, React,
and the generated `.bionicjs/` modules.

There is no `vite.config.ts` and no `nitro.config.ts` in a BionicJS app.
Both are created programmatically here.

## What `bionicjs dev` starts

Two servers, and one proxy between them:

| Process | Port | Role |
| --- | --- | --- |
| Vite | 3000 | The public app origin: client bundle, HMR, HTML shell, `/api` proxy |
| Nitro | 3001 | The server: scans `server/api/`, serves h3 handlers, `/api` target |

`strictPort` is on, so a port conflict fails loudly instead of silently
relocating the app.

## Startup sequence

```ts
import { createNitro, createDevServer, prepare, build } from "nitropack";
import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

await generateAll(cwd); // bionicjs.config.ts -> .bionicjs/*

const nitro = await createNitro({
  rootDir: cwd,
  srcDir: path.join(cwd, "server"), // required, or /api/* 404s
  dev: true,
  publicAssets: existsSync(publicDir) ? [{ dir: publicDir }] : [],
  alias: { "@bionicjs/core/server": generatedServer },
});

const nitroDevServer = createDevServer(nitro);
await nitroDevServer.listen(3001);
await prepare(nitro); // emits .nitro/types, including nitro-routes.d.ts
build(nitro).catch(/* logged */); // rebuild watcher

const vite = await createViteServer({
  root: cwd,
  resolve: { alias: { "#bionicjs-api": `${cwd}/.bionicjs/api-client.ts` } },
  server: {
    port: 3000,
    strictPort: true,
    proxy: { "/api": "http://localhost:3001" },
  },
  plugins: [bionicjsRoutesPlugin(cwd), react(), tailwindcss()],
});

await vite.listen();
```

### `srcDir` is load-bearing

Nitro scans `<srcDir>/api`, **not** `<srcDir>/server/api`. Left at its
default it looks for `./api` at the project root, registers zero routes,
and serves a 404 for every endpoint with no warning. Setting `srcDir` moves
the scan root, which is also why `public/` (a sibling of `server/`) has to
be passed explicitly as `publicAssets`.

### Two aliases, not one

`@bionicjs/core/server` resolves to the generated `.bionicjs/server.ts`, but
Vite and Nitro need to be told separately: Vite through `resolve.alias`,
Nitro through the `alias` option on `createNitro`. Wiring only the first
leaves server routes importing the empty published stub.

## Features

- Route discovery via `bionicjsRoutesPlugin` (`virtual:bionicjs-routes`), with HMR
  invalidation on `app/` file changes
- React, Tailwind, and the HTML shell wired in — no user config files
- `/api` proxied from Vite (3000) to Nitro (3001)
- Generated `.bionicjs/{server,hono,api-client}.ts` from `bionicjs.config.ts`, loaded
  through jiti
- Nitro's own typed route declarations (`.nitro/types/nitro-routes.d.ts`)

## Generated Hono artifacts

`generateRPC()` also writes `.bionicjs/hono.ts` and
`.bionicjs/api-client.ts` from the `server/api` tree. **These are generated
but not mounted** — Nitro serves `server/api/` through h3, and the generated
bridge calls handlers as plain functions while they are h3 event handlers.
The typed client is therefore inert today. See `/docs/hono`.

## Usage

```sh
npx bionicjs dev
```

Or drive it programmatically:

```ts
import { runDevServer } from "@bionicjs/dev";
await runDevServer({ cwd: process.cwd() });
```

## Development

```sh
pnpm --filter @bionicjs/dev test
```
