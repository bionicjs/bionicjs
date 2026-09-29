Deploy your bionicjs project to Netlify. bionicjs's Nitro build output maps cleanly onto Netlify's static + functions model: the client ships as static files, and server routes become Netlify Functions.

## Configure

Use the Nitro present, then deploy through Netlify:

```bash
netlify deploy --prod
```

Or set the preset in config:

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";

export default defineConfig({
  nitro: { preset: "netlify" },
});
```

## What you get

- Static `app/` assets served on Netlify's global CDN.
- `server/api/**` routes run as Netlify Functions.
- Preview deployments, form handling, and a generous free tier.

## Good to know

- Add environment variables in the Netlify dashboard (`DATABASE_URL`, auth secrets, API keys).
- Branch-based previews make testing changes against the full stack easy before merging.