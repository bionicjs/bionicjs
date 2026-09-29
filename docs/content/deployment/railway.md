Deploy your bionicjs project to Railway. Railway runs your Nitro server on a managed container platform with a dashboard for secrets, scale, and observability — the closest to a modern Heroku experience.

## Configure

Railway uses the standard Node.js server output:

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";

export default defineConfig({
  nitro: { preset: "node_server" },
});
```

```bash
railway init
railway up
```

## What you get

- A real Node.js process with a public domain out of the box.
- Dashboard-managed secrets, metrics, and scale sliders.
- Preview environments on branch pushes.

## Good to know

- Set env vars in the Railway dashboard — `DATABASE_URL`, auth secrets, API keys — not in the repo.
- Railway supports multiple services in one project, so run your Python `ai/` and `jobs/` alongside the bionicjs server.
- A simple, low-friction deployment for small to medium workloads.