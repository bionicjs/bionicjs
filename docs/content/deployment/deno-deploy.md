Deploy your bionicjs project to Deno Deploy. The Deno preset compiles the Nitro server to run on Deno, hosting both the static client and the API on Deno Deploy's global edge network.

## Configure

```bash
deployctl deploy
```

Or set the preset in config:

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";

export default defineConfig({
  nitro: { preset: "deno_deploy" },
});
```

## What you get

- The web client served statically and the API running on Deno at the edge.
- Native Web standards (fetch, Request/Response) — the same runtime bionicjs already targets.
- No container to manage; deployctl takes care of versioning.

## Good to know

- Set environment variables in the Deno Deploy dashboard or with `--env-file` during deploy.
- Deno's isolated runtime is a natural fit for the h3/Nitro server of a bionicjs project.
- Keep CPU-heavy Python work in `jobs/` rather than in edge functions.