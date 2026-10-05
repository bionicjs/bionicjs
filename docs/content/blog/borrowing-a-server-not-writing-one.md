A full-stack React framework is not a magic trick. It is four decisions,
made once, that you inherit. Once you can name the four, the frameworks
stop being different brands of the same mystery — and you can see exactly
what bionicjs borrowed from whom.

## The four questions

1. **Who bundles the client?** Your bundler, or one the framework chose
   and never lets you configure?
2. **Who owns the server runtime?** The framework's own, or a
   general-purpose server framework it delegates to?
3. **How does a file become an endpoint?** Convention, explicit config, or
   both?
4. **How do you pick a deploy target?** One command that emits the right
   artifact, or an adapter you install and version-match?

bionicjs answers: Vite for the client, Nitro for the server, filesystem
convention for endpoints, and deploy presets inherited from Nitro. Here is
the field.

| Framework | Client bundler | Server | Endpoints | Deploy target |
| --- | --- | --- | --- | --- |
| **bionicjs** | Vite | Nitro + h3 | `server/api/*.ts` | Nitro presets (not yet exposed) |
| **Nuxt** | Vite | Nitro + h3 | `server/api/*.ts` | Nitro presets |
| **SvelteKit** | Vite | Own, generated | `+server.ts` | Adapter package |
| **React Router 7** | Vite | Own, generated | `routes.ts` config | Adapter package |
| **TanStack Start** | Vite | Own, via plugins | `createServerFn` | Target plugin |
| **Astro** | Vite | Own, minimal | `src/pages/api/*.ts` | Adapter package |
| **Next.js** | Turbopack / webpack | Own runtime | `app/**/route.ts` | Built-in targets |
| **Redwood** | Own (Babel → Vite) | Own, serverless | `api/src/functions` | Deploy targets |

## Nuxt: the closest sibling

This is the one to look at if you want to understand our server. Nuxt runs
Vite for the client and Nitro for the server, scans `server/api/`, writes
h3 event handlers, and owns the Nitro configuration so you never write
one.

```ts nuxt/server/api/hello.ts
// defineEventHandler is auto-imported from h3
export default defineEventHandler(() => ({ hello: "world" }));
```

That is not a coincidence in our favour, it is the design we took. The
differences are ergonomic rather than architectural: Nuxt auto-imports a
large surface and leans on Vue's component model. We keep the imports you
would write by hand, in plain React, and add capabilities Nuxt has no
equivalent of.

The practical proof that the model works is that Nuxt users never think
about `srcDir` or `publicAssets`. They cannot get them wrong because they
cannot see them. We spent a week getting that wrong, and the lesson was
not "be careful with Nitro config" — it was "own the config, expose
nothing." [That postmortem is here](/blog/the-two-copies-of-h3).

## Next.js: owning everything

Next ships its own bundler, its own server runtime, and its own
deployment story. No Vite, no Nitro. The trade is paid for in surface area
and a long history of breaking changes.

Its endpoint convention is a route file exporting standard Web handlers,
which is closer to Hono's shape than to h3's:

```ts app/api/hello/route.ts
export async function GET(request: Request) {
  return Response.json({ hello: "world" });
}
```

The genuinely interesting divergence is runtime selection. Next has both
a Node runtime and an opt-in edge runtime, chosen *per route*:

```ts
export const runtime = "edge";
```

Nitro makes the equivalent choice per *build* — one preset for the whole
server. Per-route is more flexible; per-build is less to reason about.

## The Vite-based adapters

SvelteKit, React Router 7, TanStack Start, and Astro all took the same
path: use Vite, generate a server, push the runtime choice into an adapter
the user installs.

```js svelte.config.js
import adapter from "@sveltejs/adapter-node";
export default { kit: { adapter: adapter() } };
```

It works, and it has a real cost. The framework does not know how to
deploy, so deployment knowledge moves into a second package that has to be
chosen, version-matched, and sometimes hand-written.

Nitro inverts this. A Nitro *preset* is one option that knows how to emit
for Node, Bun, Deno, Cloudflare, Vercel, Netlify, Lambda and the rest — and
a framework built on Nitro inherits all of them for free.

We are on the right side of that trade. It is also a promise we have not
kept yet: the presets are not exposed, and there is no
`bionicjs build` to use them. We would rather say so than ship a `build`
script we have not run.

## Redwood: the layout sibling

Our directory structure is Redwood's, not ours. Redwood's insight is that
a serious app has distinct top-level concerns, and each deserves a
directory rather than a folder inside `src/`.

| Redwood | bionicjs | Why it is there |
| --- | --- | --- |
| `api/` | `server/` | HTTP endpoints and the Node runtime |
| `auth/` | `server/auth/` | Auth provider, in the runtime that verifies it |
| `db/` | `server/db/` | Schema, migrations, and the client |
| `jobs/` | `jobs/` | Background workers, as their own process |
| `web/` | `app/` | The React client |

One deliberate difference: we keep `ai/` and `jobs/` at the project root
rather than under `server/`, because both are Python and both run
out-of-process. Nothing that runs in a different runtime has any business
nested inside the directory owned by the Node one.

## What is worth taking, and from whom

- **From Nuxt:** own the Nitro configuration; let people write ordinary
  files; inherit deployment targets for free.
- **From Redwood:** a flat set of capability directories, so a project's
  shape is visible at a glance.
- **From Next:** the standard `Request`/`Response` signature, which is
  portable and what makes edge runtimes realistic.
- **From SvelteKit and React Router:** generate the route tree instead of
  asking for a config file, and make the dev server feel like one process.

And the thing nobody has solved: typing across the network boundary.
Every framework here either generates a client or hands you `fetch`.
Hono's `hc<AppRouter>` is the most promising idea of the lot, which is why
we generate it at all — and why [it is currently not mounted](/blog/hono-is-not-our-server).
