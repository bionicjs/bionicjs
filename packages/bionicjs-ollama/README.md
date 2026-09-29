# @bionicjs/ollama

[Ollama](https://ollama.com) integration plugin for BionicJS.

## Install

```sh
npm i @bionicjs/ollama
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { ollama } from "@bionicjs/ollama";

export default defineConfig({
  ai: ollama({
    baseUrl: process.env.OLLAMA_HOST!,
    model: "llama3.2",
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

- `baseUrl` — Ollama server URL (default `http://localhost:11434`)
- `model` — local model id (default `llama3.2`)
- `rag` — optional RAG setup (`{ enabled, vectorDb, dbUrl, embeddingModel, … }`)