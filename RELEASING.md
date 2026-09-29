# Releasing BionicJS

BionicJS is a pnpm workspace that ships independent public packages from `packages/`. The workspace root (`bionicjs-workspace`) is private and is never published.

## Current status

- All packages are at `0.1.0` and have not been published publicly yet.
- There is no release automation in the repository: no `bump.config.ts`, no `pnpm release` script, and no Git tags. Until such tooling lands, the manual flow below is the authority.

## Packages and access

| Package | npm name | Notes |
| --- | --- | --- |
| Core | `@bionicjs/core` | Unscoped, always public |
| Dev server | `@bionicjs/dev` | Scoped, requires public access |
| Generator | `create-bionicjs-app` | Unscoped, always public |
| Integrations | `@bionicjs/anthropic`, `@bionicjs/better-auth`, `@bionicjs/celery`, `@bionicjs/clerk`, `@bionicjs/dramatiq`, `@bionicjs/drizzle`, `@bionicjs/firebase`, `@bionicjs/google`, `@bionicjs/kysely`, `@bionicjs/ollama`, `@bionicjs/openai`, `@bionicjs/prisma`, `@bionicjs/rq`, `@bionicjs/sql`, `@bionicjs/supabase`, `@bionicjs/workos` | Scoped, requires public access |

Scoped `@bionicjs/*` packages publish to npm's restricted scope by default, so they must be published with `--access public`.

## Versioning policy

Until 1.0 all public packages share the same version and are bumped together. This keeps `workspace:*` dependency ranges between packages unambiguous and mirrors how the scaffold rewrites template dependencies.

## Stable release

1. Start from a clean `main`:

   ```sh
   git stash
   git checkout main
   git pull --ff-only
   ```

2. Verify the workspace:

   ```sh
   pnpm install --frozen-lockfile
   pnpm typecheck
   pnpm test
   ```

3. When documentation changed, also build the docs site:

   ```sh
   pnpm --dir docs install
   pnpm --dir docs build
   ```

4. Set the next version in every `packages/*/package.json`. Keep versions aligned across core, dev, the generator, and all integrations. Integration packages depend on the core as `"@bionicjs/core": "workspace:*"`; pnpm rewrites that range to the published version when publishing.

5. Dry-run the publish to catch packaging mistakes. The pack output must contain the entry points, `bin`, and `files` declared by each manifest:

   ```sh
   pnpm -r publish --dry-run --access public
   ```

6. Authenticate and confirm the publishing account can publish these names:

   ```sh
   pnpm login
   pnpm whoami
   npm access ls-packages
   ```

7. Publish. `pnpm -r publish` walks packages in topological order so core publishes before the integrations that depend on it:

   ```sh
   pnpm -r publish --access public
   ```

8. Create and push a tag for the release. BionicJS follows the `v<major>.<minor>.<patch>` convention:

   ```sh
   git tag -a v0.1.0 -m "v0.1.0"
   git push origin main --tags
   ```

9. Verify on the registry:

   ```sh
   npm view bionicjs version
   npm view @bionicjs/anthropic version
   ```

## Beta release

For a pre-stable or pre-1.0 candidate, publish under the `beta` dist-tag so unqualified installs keep receiving the stable line:

```sh
pnpm -r publish --access public --tag beta
```

Keep the prerelease version on semver, for example `0.1.0-beta.0`. When the candidate is promoted to stable, run the stable flow above with the next stable version.

## Canary release

For continuous prerelease builds, use the `next` dist-tag with a canary prerelease version:

```sh
pnpm -r publish --access public --tag next
```

Canaries are meant for integration testing, not for users. Do not promote a canary tag to `latest`.

## Retrying a failed publish

If a publish fails partway through, do not bump versions again. Fix the cause, publish the failing package alone with its unchanged version, then continue the chain from the next package:

```sh
pnpm --filter @bionicjs/<package> publish --access public
```

If publishing completed but the Git tag step failed, create the tag without republishing.

## Provenance

Enable npm provenance once a publish workflow runs in CI. Provenance requires OIDC and a GitHub Actions publish workflow; the manual flow above does not emit provenance. Before adding it, wire `npm publish --provenance` into a release workflow restricted to tagged commits on `main`.

## Release automation (planned)

Land a shared-version bump flow before the stable 1.0 release. The intended setup mirrors the manual steps: a `bump.config.ts` defining the shared release group, a `pnpm release` wrapper that bumps versions, runs `pnpm typecheck` and `pnpm test`, tags `main`, and publishes in topological order, and a separate `--no-test` escape hatch for a pre-verified publish. Independently versioned packages stay out of the shared group and keep their own release cadence.

## Checklist

- [ ] Clean `main`, pulled with `--ff-only`
- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm typecheck` and `pnpm test` pass
- [ ] `pnpm --dir docs build` passes when docs changed
- [ ] Versions aligned across all public packages
- [ ] `--dry-run` pack output reviewed
- [ ] npm authentication confirmed
- [ ] Published with `--access public` where scoped
- [ ] Git tag pushed
- [ ] Registry versions verified