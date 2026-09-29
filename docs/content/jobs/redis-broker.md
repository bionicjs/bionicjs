Redis is the default broker for all three job systems. Every bionicjs job plugin — Celery, RQ, and Dramatiq — accepts a Redis connection string, and RQ requires it by design.

## Broker URLs

```text
redis://localhost:6379/0          # local, default database
rediss://:password@host:6379/0    # TLS with a password
redis://:password@host:6379/1     # with auth and a database number
```

## Compose a job system with Redis

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { celery } from "@bionicjs/celery";

export default defineConfig({
  jobs: celery({ broker: "redis://localhost:6379" }),
});
```

## Why Redis

- Fast, in-memory transport with low latency for short tasks.
- One service to run — already common in most stacks for caching and session storage.
- RQ uses Redis exclusively, so it is the only broker choice there.

## Good to know

- The broker value is configuration only — switching Redis for RabbitMQ later changes a URL, not code.
- For heavier workflows with routing needs, see the RabbitMQ broker page.