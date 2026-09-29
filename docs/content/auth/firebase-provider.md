Firebase Authentication uses your Firebase project's service account to verify tokens. It supports email/password, Google Sign-In, phone auth, and anonymous auth — all managed by Google's infrastructure.

## Compose the plugin

Add `@bionicjs/firebase` under the `auth` key in `bionicjs.config.ts`.

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { firebase } from "@bionicjs/firebase";

export default defineConfig({
  auth: firebase({
    projectId: "...",
    clientEmail: "...",
    privateKey: "...",
  }),
});
```

## Environment variables

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

The plugin writes all three into `.env.example`. The `privateKey` is a multiline value — keep it inside quotes in the environment file.

## Verifying sessions

The scaffolded handler under `server/auth/` initializes the Firebase Admin SDK with the service account and verifies incoming ID tokens before protected routes run.

```ts
// server/auth/firebase.ts
import { initializeApp, cert } from "firebase-admin/app";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Firebase service account credentials are not set");
}

export const firebaseApp = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});
```

Protected API routes read the session from the same `auth` boundary:

```ts
import { auth } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const session = await auth.getSession(event);
  if (!session) throw createError({ statusCode: 401 });
  return session.user;
});
```

## Good to know

- Firebase auth is Google's account stack — most useful when your users already have Google accounts or you want the full Firebase ecosystem (Auth UI, Analytics, Firestore).
- Unverified requests fail in middleware and never reach a handler or Python.