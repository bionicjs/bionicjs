Supabase Auth runs on top of PostgreSQL inside your Supabase project. Users are stored in Supabase-managed tables, sessions are managed by Supabase, and your server verifies the JWTs against the Supabase API.

## Compose the plugin

Add `@bionicjs/supabase` under the `auth` key in `bionicjs.config.ts`.

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { supabase } from "@bionicjs/supabase";

export default defineConfig({
  auth: supabase({
    url: "https://xxx.supabase.co",
    anonKey: "...",
  }),
});
```

## Environment variables

- `SUPABASE_URL` — your project's endpoint.
- `SUPABASE_ANON_KEY` — the public anon key.

Both are safe to write into `.env.example`. The anon key is public by design; access control happens through Supabase RLS policies on the server.

## Verifying sessions

The scaffolded handler under `server/auth/` creates a Supabase client and verifies the incoming JWT before protected routes run.

```ts
// server/auth/supabase.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!url || !anonKey) throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY is not set");

export const supabase = createClient(url, anonKey);
```

Protected API routes go through the same session boundary:

```ts
import { auth } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const session = await auth.getSession(event);
  if (!session) throw createError({ statusCode: 401 });
  return session.user;
});
```

## Good to know

- Supabase is the open-source Firebase alternative — you get Postgres, auth, and storage in one product.
- Session verification rules belong to Supabase. BionicJS only wires the verification into middleware automatically.