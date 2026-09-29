# @bionicjs/rq

[RQ](https://python-rq.org) background jobs integration plugin for BionicJS.

## Install

```sh
npm i @bionicjs/rq
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { rq } from "@bionicjs/rq";

export default defineConfig({
  jobs: rq({
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

- `broker` — Redis URL