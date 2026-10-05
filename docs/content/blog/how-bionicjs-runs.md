Run `npm run dev` in a bionicjs project and two servers come up. That is
the whole trick, and it is worth taking apart, because a surprising amount
of the framework's ergonomics comes from how those two servers are wired
together.

We also have to be honest about the last third of this post: production
parity is not finished, and pretending otherwise would make this page
useless.

## One command, two servers

`bionicjs dev` is not a wrapper around `vite`. It is an orchestrator that
starts a Nitro server, starts a Vite server, and connects them.

```ts packages/dev/src/index.ts
await generateAll(cwd);

const nitro = await createNitro({
  rootDir: cwd,
  srcDir: path.join(cwd, "server"),
  dev: true,
  publicAssets: existsSync(publicDir) ? [{ dir: publicDir }] : [],
  alias: { "@bionicjs/core/server": generatedServer },
});

const nitroDevServer = createNitroDevServer(nitro);
await nitroDevServer.listen(3001);
await prepare(nitro);
build(nitro).catch(/* logged */);

const vite = await createViteServer({
  root: cwd,
  server: {
    port: 3000,
    strictPort: true,
    proxy: { "/api": "http://localhost:3001" },
  },
  plugins: [bionicjsRoutesPlugin(cwd), react(), tailwindcss()],
});

await vite.listen();
```

`createNitro` is Nitro's programmatic API. There is no `nitro.config.ts`
in your project, and we never shell out to the Nitro CLI. Same for Vite:
there is no `vite.config.ts`, and Tailwind's Vite plugin is registered
here rather than in a file you own.

That is the design rule. The engines are ours to configure, and your
project is left with source files.

## What the browser actually talks to

Port 3000, always. `strictPort` is on so a conflict fails loudly instead of
silently relocating your app.

| Process | Port | Visibility |
| --- | --- | --- |
| Vite | 3000 | Public — the app origin |
| Nitro | 3001 | Internal — reachable only through the proxy |
| Python (AI and jobs) | internal | Internal — reached over RPC |

Vite decides what to do with an incoming request:

- `/api/*` matches the proxy rule and is forwarded to Nitro.
- Anything else that asks for `text/html` gets a synthesised HTML shell,
  run through `transformIndexHtml`, and returned.
- Everything else is a normal Vite module or asset request.

The HTML shell loads `/@id/@bionicjs/core/entry-client`, which is where
React takes over. There is no `index.html` in your project because BionicJS
is a framework, not a Vite template — `app/layout.tsx` is the root.

## The line that decides whether your API works

```ts
srcDir: path.join(cwd, "server"),
```

Nitro scans `<srcDir>/api`, `<srcDir>/routes`, `<srcDir>/middleware`, and
`<srcDir>/plugins`. It does **not** scan `<srcDir>/server/api`.

Leave `srcDir` at its default and Nitro looks for `./api` at the project
root. It registers zero routes, opens no file in `server/`, and serves a
404 for every endpoint you wrote. There is no error, no warning, no failed
build. The framework appears to work perfectly and your API is simply
absent.

We wrote [a whole post about the aftermath](/blog/the-two-copies-of-h3),
but the short version is that `srcDir` is load-bearing, it moves more than
you would expect, and Nitro v3 is going to rename it.

## The dev-only alias

`bionicjs.config.ts` is compiled into a real module at
`.bionicjs/server.ts`, exporting `auth`, `db`, `ai`, and `jobs`:

```ts server/api/me.ts
import { auth } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  return auth.getSession(event);
});
```

Because it is a real file at a path the tools understand, it needs an
alias in two places: `resolve.alias` in Vite, and the `alias` option on
`createNitro` for the server. We originally wired only the first, which
had the same shape of failure — routes importing an empty stub and
behaving as though nothing were configured.

`.bionicjs/` is disposable. It is regenerated on every `dev`, gitignored,
and safe to delete. If a stale file ever confuses you, delete the
directory and restart.

## What production looks like

One Nitro server serves the static client assets and the API. No Vite, no
proxy, no second port. The application code never branches on environment.

That is the target, and the target is not fully reached yet:

- `@bionicjs/core/server` resolves through a dev alias. In production the
  generated module has to resolve for real, and it does not yet.
- The scaffolded `package.json` exposes only `dev`. There is no
  `bionicjs build` or `bionicjs start` yet, so there is nothing to run a
  production build with.
- Nitro's deploy presets — Node, Bun, Deno, Cloudflare, Vercel, Netlify,
  Lambda — are inherited, but not yet exposed as a supported choice.

We would rather say this plainly than ship a `build` script that produces
something we have not run. When these land, this section gets rewritten.

## Read next

- [Nitro & h3](/docs/nitro-h3) — the full request path and the `srcDir` story
- [Hono](/docs/hono) — the generated client, and why it is not mounted
- [Borrowing a server, not writing one](/blog/borrowing-a-server-not-writing-one)
