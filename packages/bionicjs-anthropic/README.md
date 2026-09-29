# @bionicjs/anthropic

[Anthropic](https://www.anthropic.com) Claude integration plugin for BionicJS.

## Install

```sh
npm i @bionicjs/anthropic
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { anthropic } from "@bionicjs/anthropic";

export default defineConfig({
  ai: anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: "claude-sonnet-4-5",
  }),
});
```

Compose under the `ai` key. At runtime the wired client is generated into
`@bionicjs/core/server` and available as `ai`:

```ts
import { ai } from "@bionicjs/core/server";
const reply = await ai.chat("Explain BionicJS");
```

## Options

- `apiKey` — Anthropic API key
- `model` — model id (default `claude-sonnet-4-5`)
- `rag` — optional RAG setup (`{ enabled, vectorDb, dbUrl, embeddingModel, … }`)