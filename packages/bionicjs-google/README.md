# @bionicjs/google

Google AI (Gemini) integration plugin for BionicJS.

## Install

```sh
npm i @bionicjs/google
```

## Usage

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { google } from "@bionicjs/google";

export default defineConfig({
  ai: google({
    apiKey: process.env.GEMINI_API_KEY!,
    model: "gemini-2.5-pro",
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

- `apiKey` — Google AI Studio API key
- `model` — Gemini model id (default `gemini-2.5-pro`)
- `rag` — optional RAG setup (`{ enabled, vectorDb, dbUrl, embeddingModel, … }`)