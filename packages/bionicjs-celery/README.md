# @bionicjs/celery

[Celery](https://docs.celeryq.dev) background jobs integration plugin for BionicJS.

## Install

```sh
npm i @bionicjs/celery
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { celery } from "@bionicjs/celery";

export default defineConfig({
  jobs: celery({
    broker: "redis://localhost:6379",
  }),
});
```

Compose under the `jobs` key. At runtime the wired client is generated into
`@bionicjs/core/server` and available as `jobs`:

```ts
import { jobs } from "@bionicjs/core/server";
await jobs.enqueue("process_video", { videoId: "abc123" });
```

## Options

- `broker` — broker URL (redis / rabbitmq)