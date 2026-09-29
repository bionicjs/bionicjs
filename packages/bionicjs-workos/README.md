# @bionicjs/workos

[WorkOS](https://workos.com) (SSO, directory sync, audit logs) integration
plugin for BionicJS.

## Install

```sh
npm i @bionicjs/workos
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { workos } from "@bionicjs/workos";

export default defineConfig({
  auth: workos({
    apiKey: process.env.WORKOS_API_KEY!,
    clientId: process.env.WORKOS_CLIENT_ID!,
    redirectUri: process.env.WORKOS_REDIRECT_URI!,
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

- `apiKey` — WorkOS API key
- `clientId` — WorkOS client ID
- `redirectUri` — SSO redirect URI