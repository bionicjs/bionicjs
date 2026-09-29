Deploy your bionicjs project to Fly.io. Fly runs your Nitro server in a container on their fleet of regions, with a real filesystem, long-lived processes, and opt-in edge routing — the best choice when you want persistent Node.js with a stable public IP.

## Configure

```bash
fly launch
fly deploy
```

bionicjs's default Nitro output is Node.js, so Fly needs no preset:

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";

export default defineConfig({
  nitro: { preset: "node_server" },
});
```

## What you get

- A long-lived Node.js process instead of serverless cold starts.
- Persistent volumes and scale-to-zero (or keep machines warm) depending on your plan.
- Regional placement — deploy next to your users or your database.

## Good to know

- Fly.io is the right fit when your workload wants a real server: websockets, long-running Python workers, and stable connections.
- Set env vars with `fly secrets set KEY=value`.
- Node server output also runs anywhere you run Docker — this preset is the general-purpose deployment.