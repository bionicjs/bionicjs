# @bionicjs/sql

Raw SQL driver integration plugin for BionicJS.

## Install

```sh
npm i @bionicjs/sql
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { sql } from "@bionicjs/sql";

export default defineConfig({
  database: sql({
    provider: "sqlite",
    url: "file:./dev.db",
  }),
});
```

Compose under the `database` key. At runtime the wired client is generated
into `@bionicjs/core/server` and available as `db`:

```ts
import { db } from "@bionicjs/core/server";
const { rows } = await db.query("SELECT * FROM users");
```

## Options

- `provider` — `"postgres"` | `"sqlite"` | `"mysql"` (defaults to postgres)
- `url` — database connection string