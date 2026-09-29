# @bionicjs/kysely

[Kysely](https://kysely.dev) type-safe SQL builder integration plugin for BionicJS.

## Install

```sh
npm i @bionicjs/kysely
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { kysely } from "@bionicjs/kysely";

export default defineConfig({
  database: kysely({
    provider: "sqlite",
    url: "file:./dev.db",
  }),
});
```

Compose under the `database` key. At runtime the wired client is generated
into `@bionicjs/core/server` and available as `db`:

```ts
import { db } from "@bionicjs/core/server";
const users = await db.selectFrom("users").selectAll().execute();
```

## Options

- `provider` — `"postgres"` | `"sqlite"` | `"mysql"` (defaults to postgres)
- `url` — database connection string