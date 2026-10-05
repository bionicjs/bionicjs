## A file is an endpoint

There is no API router in bionicjs, and no `api` key in
`bionicjs.config.ts`. You add a file:

```ts server/api/health.ts
import { defineEventHandler } from "h3";

export default defineEventHandler(() => ({
  status: "ok",
}));
```

That file is the endpoint `/api/health`. Nitro scans the directory at
startup, compiles the tree into a router, and matches requests against
it. There is nothing to register.

Run `npm run dev` and open `http://localhost:3000/api/health`; you will
get `{"status":"ok"}` from the route above.

## What each layer owns

Three projects solve three different problems. Confusing them is the
main source of confusion in this part of the stack.

| Layer | Owns | Does not own |
| --- | --- | --- |
| **h3** | The handler shape. An event, a return value, middleware composition. | Filesystem routing, building, deployment, HTTP sockets. |
| **Nitro** | The server. Scans `server/api` into a router, builds and bundles it, picks a deploy preset. | Your client, your bundler, your components. |
| **Vite** | The client. Transforms and bundles `app/`, serves modules and HMR, proxies `/api` in dev. | Anything touching the server runtime. |

The relationship is the one thing to remember: **Nitro is built on
h3**. Nitro is the framework; h3 is the HTTP handler library inside it.
When you write `defineEventHandler` you are using h3's API, and Nitro is
what turns your files into a running h3 application.

Hono is a third project, unrelated to both. It has its own page.

## h3: the handler shape

An h3 event handler receives an `H3Event` and returns a value. h3
handles the response plumbing: status codes, headers, cookies, redirects,
streaming, and cookie parsing.

```ts server/api/session.ts
import { defineEventHandler, getCookie, setCookie } from "h3";

export default defineEventHandler((event) => {
  const token = getCookie(event, "session");
  setCookie(event, "seen", "1", { httpOnly: true, sameSite: "lax" });

  return { authenticated: Boolean(token) };
});
```

This shape is portable. It is not Node-specific, which is what lets the
same file run on Node, Bun, Deno, or an edge worker.

## Whose h3 version is it

h3 is a dependency `nitropack` owns:

```json node_modules/nitropack/package.json
{
  "dependencies": {
    "h3": "^1.15.11"
  }
}
```

Your app carries the same range, and the reason is not preference. It is
that your own route files import it:

```ts server/api/health.ts
import { defineEventHandler } from "h3";

export default defineEventHandler(() => ({ status: "ok" }));
```

That import resolves from your project, and pnpm gives a project a strict
`node_modules` by default. A transitive dependency of a dependency is not
resolvable from your source — there is no `hoist` or `publicHoistPattern`
configured anywhere in the workspace. So `h3` must be a direct dependency
of the app, pinned to the same range Nitro resolves, and the two dedupe to
a single copy.

This is not hypothetical. The base template used to pin its own
`h3@2.0.1-rc.31` while Nitro depended on `h3@^1.15.11`, so a scaffolded
app installed two majors of the same package side by side:

```bash
$ find node_modules -path '*h3/package.json' | while read f; do
    echo "$(node -p "require('./$f').version")  $f"
  done
1.15.11     node_modules/.pnpm/h3@1.15.11/node_modules/h3/package.json
2.0.1-rc.31 node_modules/.pnpm/h3@2.0.1-rc.31_.../node_modules/h3/package.json
```

It failed quietly. The two majors do not share a module instance, and
they do not produce the same function, so every route 404'd with no
error from either package.

The fix was to **align**, not to delete. Dropping the pin outright is not
available, because your code imports h3. The rule we took from this is
narrower than "no runtime dependencies in the app", and the distinction
matters:

- **Imported by your code** — `h3`, because `server/api/*.ts` uses
  `defineEventHandler`. Must be a direct dependency. Keep the range aligned
  with the runtime.
- **Imported only by the framework** — `nitropack`, `vite`,
  `@vitejs/plugin-react`, `@tailwindcss/vite`. These are absent from the
  template entirely; `@bionicjs/dev` owns them, so a project cannot resolve
  or pin them by accident.

So: *never pin a different major of a runtime dependency than the runtime
it is written against.* The bug lived in the gap — a package that was both
a framework implementation detail and a user-facing import, which made it
pinnable, which made it wrong.

## Programmatic startup

You never write a `nitro.config.ts` and never run `nitro dev`.
`bionicjs dev` constructs and starts Nitro in-process, from
`@bionicjs/dev`:

```ts packages/dev/src/index.ts
// 1. Generate the framework-owned modules from bionicjs.config.ts
await generateAll(cwd);

// 2. Create Nitro. srcDir is what makes server/api/ visible.
const nitro = await createNitro({
  rootDir: cwd,
  srcDir: path.join(cwd, "server"),
  dev: true,
  compatibilityDate: "2026-09-14",
  publicAssets: existsSync(publicDir) ? [{ dir: publicDir }] : [],
  alias: existsSync(generatedServer)
    ? { "@bionicjs/core/server": generatedServer }
    : {},
});

// 3. Listen, prepare types, then run the rebuild watcher
const nitroDevServer = createDevServer(nitro);
await nitroDevServer.listen(3001);
await prepare(nitro);
build(nitro).catch(/* logged */);

// 4. Start Vite for the client, proxying /api to Nitro
const vite = await createViteServer({ /* ... */ });
await vite.listen();   // :3000
```

Two details in that block are load-bearing, and both were bugs before
they were documented.

## srcDir decides what gets scanned

Nitro scans `<srcDir>/api`, `<srcDir>/routes`, `<srcDir>/middleware` and
`<srcDir>/plugins`. It does **not** scan `<srcDir>/server/api`.

Left at its default, `srcDir` equals `rootDir`, which is the project
root — so Nitro looked for `./api` and registered **zero routes**. The
`server/` directory was never opened, and every endpoint 404'd.

Setting `srcDir` moves the scan root, which has knock-on effects.
Anything Nitro resolves relative to `srcDir` now looks inside `server/`
— most visibly `public/`, which is a sibling of `server/` and therefore
has to be passed explicitly as `publicAssets`.

> `srcDir` is correct for `nitropack@2.x`, where it is the documented
> root for `api/`, `routes/`, `public/` and friends. Nitro v3 deprecates
> it in favour of a source-level `serverDir`, and `scanDirs` is the
> option that adds a route-scanning root without relocating `public/`.
> Expect this line to change with the upgrade.

This is also why Nuxt asks you to think about none of it. Nuxt owns the
Nitro configuration outright; `server/api/` simply works. That is the
model bionicjs is copying.

## The request lifecycle

A browser request to `http://localhost:3000/api/health` takes this path:

```text
browser  ──▶  Vite  :3000
               │  /api/* matches the proxy rule
               ▼
            Nitro  :3001
               1. request hook
               2. route rules (headers, redirects)
               3. global middleware
               4. route matching ──▶ server/api/health.ts  (h3 handler)
               5. server entry        (catch-all /**, if present)
               6. renderer            (the HTML shell, for non-API requests)

response ◀── back through the proxy ◀── browser
```

Anything that is not `/api` and asks for `text/html` is served by Vite's
own middleware, which synthesises the HTML shell, runs it through
`transformIndexHtml`, and returns it. The shell loads
`/@id/@bionicjs/core/entry-client`, which is where React takes over.

## Ports and the /api proxy

The public origin is `localhost:3000`. `strictPort` is on, so a port
conflict fails loudly instead of silently moving the app somewhere you
did not ask for.

| Process | Port | Visibility |
| --- | --- | --- |
| Vite (React client) | 3000 | Public — the app origin |
| Nitro (h3 handlers) | 3001 | Internal — only via the proxy |
| Python (AI and jobs) | internal | Internal — only via RPC |

## The generated server interface

`bionicjs.config.ts` is turned into a real TypeScript module at
`.bionicjs/server.ts`, exporting `auth`, `db`, `ai` and `jobs`. The point
of generating a module rather than injecting globals is that both
compilers can see it, so the types work in an editor.

Because it is a real file at a path both tools understand, it needs an
alias in each. Vite gets it through `resolve.alias`; Nitro gets it
through the `alias` option passed to `createNitro`. Miss the second one
and server routes silently import an empty stub instead of the real
interface.

```ts server/api/me.ts
import { auth } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  return auth.getSession(event);
});
```

> The alias only exists at dev time. In production the module has to
> resolve for real, and that parity is not finished yet.

## Related

- [Hono](/docs/hono) — the generated typed client, and why it is not mounted
- [Middleware & Edge](/docs/middleware-and-edge)
- [The stack](/docs/stack)
- How other full-stack frameworks answer the same questions:
  [How meta-frameworks work](/learn/how-meta-frameworks-work)
