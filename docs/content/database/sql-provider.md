Raw SQL drops every abstraction. The `@bionicjs/sql` plugin hands you the database driver directly — `pg`, `better-sqlite3`, or `mysql2` — so you get full control over queries, connections, and pooling.

## Compose the plugin

Add `@bionicjs/sql` under the `database` key in `bionicjs.config.ts`.

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { sql } from "@bionicjs/sql";

export default defineConfig({
  database: sql({ provider: "sqlite", url: "file:./db.sqlite" }),
});
```

## Environment variables

- `DATABASE_URL` — the single connection string; the `.env.example` names it.

## Using the client

The plugin exposes a raw driver instance as the `db` export on `@bionicjs/core/server`:

```ts
// server/api/users.ts
import { db } from "@bionicjs/core/server";

export default defineEventHandler(async () => {
  const rows = await db.query("SELECT * FROM users");
  return rows;
});
```

## When to choose raw SQL

- You already write SQL and do not want a query builder or ORM in the way.
- You need driver-specific features or advanced connection pooling.
- Your team values absolute control over generated SQL.

You manage connections and migrations yourself.

## Good to know

- The `db` boundary on `@bionicjs/core/server` stays the same whether you pick raw SQL, Prisma, Drizzle, or Kysely — only the query files and the config change.
- The client is constructed on the server and never imported into the client bundle.