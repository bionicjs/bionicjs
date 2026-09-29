# @bionicjs/openai

[OpenAI](https://openai.com) integration plugin for BionicJS.

## Install

```sh
npm i @bionicjs/openai
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { openai } from "@bionicjs/openai";

export default defineConfig({
  ai: openai({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o",
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

- `apiKey` — OpenAI API key
- `model` — model id (default `gpt-4o`)
- `rag` — optional RAG setup (`{ enabled, vectorDb, dbUrl, embeddingModel, … }`)