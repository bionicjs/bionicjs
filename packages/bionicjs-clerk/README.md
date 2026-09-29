# @bionicjs/clerk

[Clerk](https://clerk.com) integration plugin for BionicJS.

## Install

```sh
npm i @bionicjs/clerk
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { clerk } from "@bionicjs/clerk";

export default defineConfig({
  auth: clerk({
    secretKey: process.env.CLERK_SECRET_KEY!,
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
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

- `secretKey` — Clerk secret key
- `publishableKey` — Clerk publishable key