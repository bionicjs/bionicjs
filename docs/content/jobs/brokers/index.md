## Overview {#overview}
The broker carries task messages between your app and the Python workers. The choice is a URL in `bionicjs.config.ts` — swapping brokers never touches task code.

| Broker | URL scheme | Celery | RQ | Dramatiq |
| --- | --- | --- | --- | --- |
| Redis | `redis://` | ✓ | ✓ (required) | ✓ |
| RabbitMQ | `amqp://` | ✓ | ✗ | ✓ |

## Redis {#redis}
The default broker — fast, in-memory, and already running in most stacks. RQ is Redis-only by design.

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { rq } from "@bionicjs/rq";

export default defineConfig({
  jobs: rq({ broker: "redis://localhost:6379" }),
});
```

## RabbitMQ {#rabbitmq}
Full-featured message routing with exchanges and routing keys — the right pick for workload-heavy pipelines in production.

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { dramatiq } from "@bionicjs/dramatiq";

export default defineConfig({
  jobs: dramatiq({ broker: "amqp://guest:guest@localhost:5672" }),
});
```

## Where it fits {#where-it-fits}
- Short tasks and simple needs → Redis.
- Throughput, routing, and durability at scale → RabbitMQ.