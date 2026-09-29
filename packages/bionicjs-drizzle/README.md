# @bionicjs/drizzle

[Drizzle ORM](https://orm.drizzle.team) database integration plugin for BionicJS.

## Install

```sh
npm i @bionicjs/drizzle
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { drizzle } from "@bionicjs/drizzle";

export default defineConfig({
  database: drizzle({
    provider: "sqlite",
    url: "file:./dev.db",
  }),
});
```

Compose under the `database` key. At runtime the wired client is generated
into `@bionicjs/core/server` and available as `db`:

```ts
import { db } from "@bionicjs/core/server";
const users = await db.query.users.findMany();
```

## Options

- `provider` — `"postgres"` | `"sqlite"` | `"mysql"`
- `url` — database connection string