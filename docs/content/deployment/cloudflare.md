Deploy your bionicjs project to Cloudflare Workers (now Cloudflare Workers + static assets). The worker preset bundles the Nitro server into a Worker that runs on Cloudflare's edge network, with static assets served from Workers Sites.

## Configure

```bash
wrangler deploy
```

Or set the preset in config:

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";

export default defineConfig({
  nitro: { preset: "cloudflare_module" },
});
```

## What you get

- Your app runs at the edge in 100+ locations — the lowest latency for global users.
- `server/api/**` routes execute as Worker requests with no cold start scaling concerns.
- Static `app/` assets served alongside the Worker.

## Good to know

- Workers have a CPU/runtime budget per request; keep long-running work in the Python `jobs/` workers.
- Set env vars with `wrangler secret put KEY` or via the Cloudflare dashboard.
- Python AI work still requires your `ai/` services — Workers serves the web + API surface.