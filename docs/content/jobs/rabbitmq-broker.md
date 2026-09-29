RabbitMQ is a full-featured message broker — excellent for workload-heavy pipelines where you need queues, exchanges, routing keys, and durable delivery. Celery and Dramatiq both accept RabbitMQ as their transport.

## Broker URLs

```text
amqp://guest:guest@localhost:5672/    # default guest credentials
amqp://user:pass@rabbitmq.prod:5672/  # named broker host
amqps://user:pass@host:5671/          # TLS
```

## Compose a job system with RabbitMQ

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { dramatiq } from "@bionicjs/dramatiq";

export default defineConfig({
  jobs: dramatiq({ broker: "amqp://guest:guest@localhost:5672" }),
});
```

## Why RabbitMQ

- First-class routing: exchanges, binding keys, and multiple queue consumers.
- Durable and reliable — messages survive broker restarts when you opt in.
- A natural fit for Celery and Dramatiq in production workloads with throughput and routing requirements.

## Good to know

- RQ is Redis-only, so RabbitMQ only applies to Celery and Dramatiq.
- The broker value is configuration only — switching RabbitMQ for Redis later changes a URL, not code.
- See the Redis broker page for the lighter, always-available alternative.