# @bionicjs/better-auth

[Better Auth](https://better-auth.com) integration plugin for BionicJS.

## Install

```sh
npm i @bionicjs/better-auth
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { betterAuth } from "@bionicjs/better-auth";

export default defineConfig({
  auth: betterAuth({
    emailAndPassword: { enabled: true },
    // socialProviders: { github: { clientId: "", clientSecret: "" } },
  }),
});
```

Compose under the `auth` key. At runtime the wired client is generated into
`@bionicjs/core/server` and available as `auth`:

```ts
import { auth } from "@bionicjs/core/server";
const session = await auth.getSession();
```

## Options

- `emailAndPassword.enabled` — enable email + password sign-in
- `socialProviders` — `{ [provider]: { clientId, clientSecret } }`