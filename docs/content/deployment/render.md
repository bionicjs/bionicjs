Deploy your bionicjs project to Render. Render runs your Nitro server as a web service out of a Git connection, with automatic deploys on every push, managed SSL, and internal service-to-service networking.

## Configure

Render runs the standard Node.js server output:

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";

export default defineConfig({
  nitro: { preset: "node_server" },
});
```

Create a web service, point it at your repo, and set the start command to `npm run start`.

## What you get

- Auto-deploys from every push to your branch.
- Free managed TLS, custom domains, and a global CDN in front of your service.
- Persistent long-lived Node.js with stable instances — good for websockets and consistent connection state.

## Good to know

- Set env vars (`DATABASE_URL`, auth secrets, API keys) in the Render dashboard before the first deploy.
- Connect a managed Postgres from Render so the database and app live in the same network.
- Scale instance size and concurrency from the dashboard as traffic grows.