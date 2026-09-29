Deploy your bionicjs project to Vercel. Because bionicjs builds a standard Nitro `.output/` directory, the Vercel preset bundles your server into a set of serverless functions — the web client is served as static assets, the API runs on demand.

## Configure

Add the Vercel adapter from the Nitro preset and deploy via Vercel's Git integration or CLI:

```bash
vercel deploy
```

Or use the preset directly in your build:

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";

export default defineConfig({
  nitro: { preset: "vercel" },
});
```

## What you get

- Static `app/` assets served from the Vercel edge network.
- `server/api/**` routes as serverless functions.
- Automatic HTTPS, preview deployments per branch, and environment variable management.

## Good to know

- Set `DATABASE_URL`, auth secrets, and API keys in the Vercel dashboard — zero config files in the repo.
- Serverless functions scale to zero and cold start on demand, so keep cold-start-sensitive tasks (agentic AI) behind the Python worker instead.