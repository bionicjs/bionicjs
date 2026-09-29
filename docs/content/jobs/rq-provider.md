RQ (Redis Queue) is a simple, lightweight Python task queue. Ideal for smaller workloads where you want minimal setup — no broker choice needed because RQ is Redis-only by design.

## Compose the plugin

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { rq } from "@bionicjs/rq";

export default defineConfig({
  jobs: rq({ broker: "redis://localhost:6379" }),
});
```

## Defining a task

Tasks live under `jobs/` in Python:

```python
# jobs/tasks.py
from bionicjs.jobs import task

@task
def send_welcome_email(user_email: str) -> None:
    print(f"Welcome email sent to {user_email}")
```

## Enqueue from the server

The enqueue client is exposed as the `jobs` export on `@bionicjs/core/server`:

```ts
// server/api/signup.ts
import { jobs } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event);
  jobs.enqueue("send_welcome_email", email);
  return { ok: true };
});
```

## Running the worker

```bash
cd my-app
rq worker
```

## Good to know

- RQ is Redis-only — the broker is always Redis, so there is nothing to configure.
- The simplest possible entry point into background jobs; graduate to Celery or Dramatiq when you need routing, retries, and scheduled tasks at scale.