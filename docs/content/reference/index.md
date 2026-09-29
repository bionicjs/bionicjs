## Package layout

The project ships as two packages: a thin `@bionicjs/core` runtime core and an
optional `@bionicjs/dev` tooling package. Everything else is a plugin
package.

## bionicjs core

The core package owns the routing API — the filesystem parser, the
manifest types, and the runtime router adapter. It has no bundled auth,
database, AI, or job implementations; those live in plugins.

## @bionicjs/dev

The dev package owns the tooling: the Vite plugin that scans `app/`,
the Nitro server wiring, and the CLI. It is the only package with a
build-time footprint in your project.

## Plugins

Plugins are thin workspaces that call core factories —
`createAuthPlugin`, `createDatabasePlugin`, `createAiPlugin`,
`createJobsPlugin`. Each one records config and produces generated
exports; none bundles a provider's full implementation into your app.

## Exports map

| Module | Purpose |
|---|---|
| `@bionicjs/core` | Core runtime and routing API |
| `@bionicjs/core/router` | Parser, manifest types, layout adapter |
| `@bionicjs/dev` | Vite plugin, server wiring, CLI |
| `@bionicjs/<provider>` | One plugin per integration |