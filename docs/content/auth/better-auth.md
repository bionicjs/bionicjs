Better Auth is the open-source, self-hosted auth library that powers `@bionicjs/better-auth`. Sessions live in your own database, the whole stack runs on your server, and there are no external dependencies to configure.

## Compose the plugin

Add the plugin under the `auth` key in `bionicjs.config.ts`. Enable the authentication methods you want — email/password, magic links, and social providers are all supported.

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { betterAuth } from "@bionicjs/better-auth";

export default defineConfig({
  auth: betterAuth({
    emailAndPassword: { enabled: true },
    socialProviders: {
      github: { clientId: "...", clientSecret: "..." },
    },
  }),
});
```

## Environment variables

The plugin writes its expected keys into `.env.example` so a fresh clone can be filled in without guessing names:

- `BETTER_AUTH_SECRET` — used to sign session tokens.
- `BETTER_AUTH_URL` — the public base URL of your app.

## Server-side handler

The scaffolded handler lives under `server/auth/`. It reads credentials from the environment, initializes Better Auth, and is exposed as the `auth` export on `@bionicjs/core/server`.

```ts
// server/auth/better-auth.ts
import { betterAuth } from "better-auth";

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;

if (!secret) throw new Error("BETTER_AUTH_SECRET is not set");
if (!baseURL) throw new Error("BETTER_AUTH_URL is not set");

export const auth = betterAuth({
  secret,
  baseURL,
  emailAndPassword: { enabled: true },
});
```

The handler mounts at `/api/auth/[...auth]`.

## Protecting routes

Middleware runs before route handlers and before the Python RPC boundary, so a protected API route never performs work without a verified session.

```ts
// server/api/me.ts
import { auth } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const session = await auth.getSession(event);
  if (!session) throw createError({ statusCode: 401 });
  return session.user;
});
```

## What BionicJS handles

BionicJS does not define its own auth protocol. The JWT format, session store, and verification rules belong to Better Auth — BionicJS makes the wiring automatic and typed, and exposes the same `auth` object everywhere you need it.