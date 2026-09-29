Kysely is a type-safe SQL query builder. You write real SQL with full TypeScript inference — no ORM overhead, no schema magic. Ideal when you want to own the queries and still get autocompletion.

## Compose the plugin

Add `@bionicjs/kysely` under the `database` key in `bionicjs.config.ts`.

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { kysely } from "@bionicjs/kysely";

export default defineConfig({
  database: kysely({ provider: "postgres", url: env("DATABASE_URL") }),
});
```

## Environment variables

- `DATABASE_URL` — the single environment variable; the `.env.example` names it.

## Define the schema interface

With Kysely you describe the table shape in a TypeScript interface to unlock inference:

```ts
// server/db/schema.ts
import { Generated, ColumnType } from "kysely";

export interface Database {
  users: {
    id: Generated<number>;
    email: string;
    name: string | null;
  };
}
```

## Using the client

The plugin exposes the client as the `db` export on `@bionicjs/core/server`:

```ts
// server/api/users.ts
import { db } from "@bionicjs/core/server";

export default defineEventHandler(async () => {
  return await db.selectFrom("users").selectAll().execute();
});
```

## Good to know

- You write SQL; Kysely makes it type-safe and autocompleted.
- Works with both SQLite and PostgreSQL through the driver of your choice.
- No migrations built in — use your plain SQL workflow and version the scripts yourself.