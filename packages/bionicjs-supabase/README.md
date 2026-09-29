# @bionicjs/supabase

[Supabase Auth](https://supabase.com/docs/guides/auth) integration plugin for
BionicJS.

## Install

```sh
npm i @bionicjs/supabase
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { supabase } from "@bionicjs/supabase";

export default defineConfig({
  auth: supabase({
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
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

- `url` — Supabase project URL
- `anonKey` — public anon key