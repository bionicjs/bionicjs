For a few weeks, every `server/api/*.ts` file in a scaffolded bionicjs
app was dead. Not erroring — dead. `GET /api/health` returned 404, the
route table was empty, and neither bionicjs nor Nitro printed a single
warning.

It took one line of `node -p` to find.

## Two majors, one node_modules

The base template pinned its own copy of h3:

```json package.json
{
  "dependencies": {
    "h3": "^2.0.1-rc.31"
  }
}
```

Meanwhile `nitropack@2.13.4` — the thing that actually runs the server —
depends on h3 v1:

```json node_modules/nitropack/package.json
{
  "dependencies": {
    "h3": "^1.15.11"
  }
}
```

Both satisfied. Both installed. The app had two majors of the same package
side by side:

```bash
$ find node_modules -path '*h3/package.json' | while read f; do
    echo "$(node -p "require('./$f').version")  $f"
  done
1.15.11     node_modules/.pnpm/h3@1.15.11/node_modules/h3/package.json
2.0.1-rc.31 node_modules/.pnpm/h3@2.0.1-rc.31_.../node_modules/h3/package.json
```

## Why it failed silently

Your handler imports `defineEventHandler` from h3 — and gets the v2 copy,
because that is what the app's own `node_modules` resolves to. Nitro builds
its router with the v1 copy.

The two functions are not the same:

```bash
$ node -e '
const app  = require("h3");            // v2, what your route imported
const nitro = require("nitropack/dist/runtime/h3");  // v1, what dispatched
console.log("app   ", app.defineEventHandler.toString().slice(0, 40), app.defineEventHandler.length);
console.log("nitro ", nitro.defineEventHandler.toString().slice(0, 40), nitro.defineEventHandler.length);
'
app    (anonymous)                     0
nitro  defineEventHandler              1
```

v2 returns a plain closure of arity 0. v1 returns a tagged handler of
arity 1. Nitro looks up a route, gets back a v1 handler it recognises,
calls it with an `H3Event` — and the v2 wrapper swallows the event,
returns `{"status":"ok"}`, and the response goes out as if nothing went
wrong.

Except it does go wrong, just somewhere else: the v1 router never matched
the file in the first place, because the two majors do not share a module
instance and therefore do not share the router's handler registry. Hence
the 404, and hence the silence.

> A framework that fails loudly is a gift. This failed quietly, which meant
> the first real diagnosis tool was printing `require('./f').version` for
> every `package.json` in the tree.

## The fix was to align, not to delete

The first instinct is to remove the pin entirely — h3 is Nitro's
dependency, after all. That instinct is wrong, and it is worth explaining
why, because it is the kind of thing that looks like a cleanup and breaks
the build instead.

Your route files import `h3` directly:

```ts server/api/health.ts
import { defineEventHandler } from "h3";

export default defineEventHandler(() => ({ status: "ok" }));
```

That import is resolved from your project, and pnpm gives a project a
strict `node_modules` by default. A *transitive* dependency of a
dependency is not resolvable from your source. No `hoist`, no
`publicHoistPattern`, nothing configured in the root `package.json`. So
`h3` has to be a direct dependency of your app — not because you chose it,
but because your own code imports it.

The only lever left is the version. So the template now pins the same range
Nitro resolves:

```json package.json
{
  "dependencies": {
    "h3": "^1.15.11"
  }
}
```

Identical to `nitropack`'s own range. pnpm dedupes to a single
`h3@1.15.11`, the module instance is shared, and every route matches again.

## The rule we took from it

**Never let a user project pin a different major of a runtime dependency
than the runtime it is written against.**

That is weaker than "no runtime deps in the app", and deliberately so. The
distinction is whether *your* code imports the package:

- **Imported by user code** — `h3`, because `server/api/*.ts` uses
  `defineEventHandler`. Must be a direct dep. Align the range.
- **Imported only by the framework** — `nitropack`, `vite`,
  `@vitejs/plugin-react`, `@tailwindcss/vite`. These we *did* remove from
  the template entirely. `@bionicjs/dev` owns them now, and a user project
  cannot resolve them by accident.

The bug lived precisely in the gap: a package that was both. `h3` was a
framework implementation detail that had accidentally become a user-facing
dependency, and once it was user-facing it was pinnable, and once it was
pinnable it was wrong.

This is also the argument for hiding the config. There is no
`nitro.config.ts` to add a `srcDir` to, and no `package.json` line for
`nitropack`. The failure mode was a version conflict, and version conflicts
come from exposed seams.

## Read next

- [Nitro & h3](/docs/nitro-h3) — where h3 sits and why it is transitive
- [The two copies of h3 in the Learn chapters](/learn/nitro-and-h3#two-copies)
