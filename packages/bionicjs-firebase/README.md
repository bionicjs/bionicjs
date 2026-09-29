# @bionicjs/firebase

[Firebase Authentication](https://firebase.google.com/docs/auth) integration
plugin for BionicJS.

## Install

```sh
npm i @bionicjs/firebase
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { firebase } from "@bionicjs/firebase";

export default defineConfig({
  auth: firebase({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!,
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

- `projectId` — Firebase project ID
- `clientEmail` — service account client email
- `privateKey` — service account private key