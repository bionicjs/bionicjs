## Overview {#overview}
Background processing is handled efficiently through the Python layer. Heavy work — emails, webhooks, video processing, scheduled syncs — is enqueued from the server and executed by a Python worker, keeping the request path fast.

## Systems {#systems}
Each job system is a plugin package composed in `bionicjs.config.ts`:

- **Celery**: Distributed task queue with scheduling and chaining.
- **RQ**: Simple Redis-backed queues for lightweight workloads.
- **Dramatiq**: Fast and reliable background task processing.

Enqueuing looks identical across all three — the `jobs` client on `@bionicjs/core/server`:

```ts
// server/api/signup.ts
import { jobs } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event);
  jobs.enqueue("tasks.send_welcome_email", email);
  return { ok: true };
});
```

## Brokers {#brokers}
The broker transports messages between the app and the workers. The choice maps to a URL in your config — not to code.

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { celery } from "@bionicjs/celery";

export default defineConfig({
  jobs: celery({ broker: "redis://localhost:6379" }),
});
```

See the broker pages for each option:

- **Redis** — the default, always available, in-memory and fast.
- **RabbitMQ** — full-featured message routing for workload-heavy pipelines.

## Redis {#redis}
Redis is the default broker for every job system, and the only broker RQ uses. Fast, in-memory, and already running in most stacks.

## RabbitMQ {#rabbitmq}
RabbitMQ adds exchanges, routing keys, and durable delivery — the right pick when queues need to scale and route in production. Celery and Dramatiq both accept the `amqp://` scheme.