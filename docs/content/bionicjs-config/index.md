## defineConfig

One config file for the whole framework. `defineConfig` composes auth,
database, AI, and jobs plugins into the project, and BionicJS turns each
into runtime exports.

```ts bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { betterAuth } from "@bionicjs/better-auth";
import { prisma } from "@bionicjs/prisma";
import { anthropic } from "@bionicjs/anthropic";
import { celery } from "@bionicjs/celery";

export default defineConfig({
  auth: betterAuth({
    emailAndPassword: { enabled: true },
    socialProviders: {
      github: { clientId: "...", clientSecret: "..." },
    },
  }),
  database: prisma({ provider: "postgresql", url: env("DATABASE_URL") }),
  ai: anthropic({ model: "claude-sonnet-4-5" }),
  jobs: celery({ broker: "redis://localhost:6379" }),
});
```

## What each key does

| Key | Plugin | Export on `@bionicjs/core/server` |
|-----|--------|-------------------------|
| `auth` | Auth provider | `auth.getSession()`, `auth.requireAuth()` |
| `database` | ORM/driver | `db.query.*` |
| `ai` | LLM provider | `ai.chat()`, model client |
| `jobs` | Task queue | `jobs.enqueue()` |

## env()

Use `env("VAR_NAME")` to read environment variables. It returns the value
at runtime and throws if the variable is missing — fail fast, not at
query time.
