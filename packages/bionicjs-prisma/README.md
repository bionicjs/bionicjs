# @bionicjs/prisma

[Prisma](https://www.prisma.io) database integration plugin for BionicJS.

## Install

```sh
npm i @bionicjs/prisma
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { prisma } from "@bionicjs/prisma";

export default defineConfig({
  database: prisma({
    provider: "sqlite",
    url: "file:./dev.db",
  }),
});
```

Compose under the `database` key. At runtime the wired client is generated
into `@bionicjs/core/server` and available as `db`:

```ts
import { db } from "@bionicjs/core/server";
const users = await db.query.user.findMany();
```

## Options

- `provider` — `"postgres"` | `"sqlite"` | `"mysql"` (defaults to postgres)
- `url` — database connection string