WorkOS provides enterprise SSO and directory sync. It supports SAML, OIDC, and social logins, and is the right choice for B2B apps that need to connect to each customer's identity provider.

## Compose the plugin

Add `@bionicjs/workos` under the `auth` key in `bionicjs.config.ts`.

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { workos } from "@bionicjs/workos";

export default defineConfig({
  auth: workos({
    apiKey: "...",
    clientId: "...",
    redirectUri: "...",
  }),
});
```

## Environment variables

- `WORKOS_API_KEY` — server-only secret.
- `WORKOS_CLIENT_ID` — identifies your WorkOS application.
- `WORKOS_REDIRECT_URI` — where WorkOS sends users back after sign-in.

All three are written into `.env.example` by the plugin template.

## Verifying sessions

The scaffolded handler under `server/auth/` creates a WorkOS client with your API key:

```ts
// server/auth/workos.ts
import { WorkOS } from "@workos-inc/node";

const apiKey = process.env.WORKOS_API_KEY;
if (!apiKey) throw new Error("WORKOS_API_KEY is not set");

export const workos = new WorkOS(apiKey);
```

Protected API routes verify the session through the same `auth` boundary:

```ts
import { auth } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const session = await auth.getSession(event);
  if (!session) throw createError({ statusCode: 401 });
  return session.user;
});
```

## Good to know

- WorkOS specializes in enterprise identity: SAML and OIDC SSO per organization, plus directory sync for automating user provisioning.
- The redirect URI you configure in WorkOS must match the callback route in your app.
- Choose WorkOS when your customers are companies, not consumers.