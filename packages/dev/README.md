# @bionicjs/dev

The dev server and build tooling for BionicJS. Used by the `@bionicjs/core` package; the
`bionicjs dev` flow starts Nitro (port 3000) and Vite (port 5173) programmatically.

- Route discovery via `bionicjsRoutesPlugin` (`virtual:bionicjs-routes`), with HMR
  invalidation on `app/` file changes
- React plugin and HTML entry wired in for you — no `vite.config.ts` needed
- `/api` proxied from Vite to Nitro

## Usage

Usually invoked through the `@bionicjs/core` package:

```ts
import { runDevServer } from "@bionicjs/core";
await runDevServer({ cwd: process.cwd() });
```

## Development

```sh
pnpm --filter @bionicjs/dev test
```