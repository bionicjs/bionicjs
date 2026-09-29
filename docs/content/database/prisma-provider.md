Prisma is a schema-first ORM. You define your data model in a single `schema.prisma` file, and Prisma generates a fully type-safe client from it — one source of truth for your database schema.

## Compose the plugin

Add `@bionicjs/prisma` under the `database` key in `bionicjs.config.ts`. Engine (SQLite or PostgreSQL) and access layer are independent choices.

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { prisma } from "@bionicjs/prisma";

export default defineConfig({
  database: prisma({ provider: "postgresql", url: env("DATABASE_URL") }),
});
```

## Environment variables

- `DATABASE_URL` — the single environment variable; the `.env.example` names it.

## Generate and migrate

Prisma needs a generate step after you edit your schema:

```bash
npx prisma generate   # regenerate the client from schema.prisma
npx prisma migrate dev  # create and apply migrations
```

## Using the client

The plugin exposes the generated client as the `db` export on `@bionicjs/core/server`. Server routes import it directly:

```ts
// server/api/users.ts
import { db } from "@bionicjs/core/server";

export default defineEventHandler(async () => {
  return await db.user.findMany();
});
```

The client is constructed on the server and never imported into the client bundle, so the driver and connection pool stay out of the React app.

## Good to know

- Prisma is best for teams that want a schema file as the single source of truth.
- Because the boundary is always `db` on `@bionicjs/core/server`, swapping Prisma for Drizzle or Kysely later is a config change plus a rewrite of the query files — nothing else moves.