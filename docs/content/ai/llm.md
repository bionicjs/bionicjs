The LLM capability gives you direct access to the model client selected in `bionicjs.config.ts` — OpenAI, Anthropic, Google Gemini, or Ollama. The plugin hands you the official SDK client, exposed as the `ai` export on `@bionicjs/core/server`.

## Providers

Each provider is a plugin package composed under the `ai` key:

| Package | SDK | Default model |
| --- | --- | --- |
| `@bionicjs/anthropic` | Anthropic SDK | `claude-sonnet-4-5` |
| `@bionicjs/openai` | OpenAI SDK | `gpt-4o` |
| `@bionicjs/google` | Google Gemini SDK | `gemini-2.5-pro` |
| `@bionicjs/ollama` | Ollama (local) | `llama3.2` |

### OpenAI

OpenAI's GPT models, wired through `@bionicjs/openai`. The plugin hands you the official OpenAI Python SDK client, supporting chat completions, function calling, and vision.

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

- `OPENAI_API_KEY` — server-only secret.
- Default model: `gpt-4o`. Override it per project in `bionicjs.config.ts`.

### Anthropic

Anthropic's Claude models, wired through `@bionicjs/anthropic`. Claude excels at long-context reasoning, coding, and analysis.

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

- `ANTHROPIC_API_KEY` — server-only secret.
- Default model: `claude-sonnet-4-5`. Override it per project in `bionicjs.config.ts`.

### Google Gemini

Google's Gemini models via the Google AI Python SDK, wired through `@bionicjs/google`. Gemini supports multimodal input (text, images, video) and has a generous free tier.

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { google } from "@bionicjs/google";

export default defineConfig({
  ai: google({
    apiKey: process.env.GOOGLE_AI_API_KEY!,
    model: "gemini-2.5-pro",
  }),
});
```

- `GOOGLE_AI_API_KEY` — server-only secret.
- Default model: `gemini-2.5-pro`. Multimodal inputs (images, video) work through the same client.

### Ollama

Ollama runs models locally on your machine — no API key, no cloud dependency. It is the fastest way to develop against a real model and a good fit for privacy-sensitive workloads.

```ts
// bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";
import { ollama } from "@bionicjs/ollama";

export default defineConfig({
  ai: ollama({
    baseUrl: "http://localhost:11434",
    model: "llama3.2",
  }),
});
```

- No API key needed; ensure the Ollama daemon is running before calling the client.
- Default model: `llama3.2`. Pull any model with `ollama pull <name>` and point the plugin at it.

## Calling a model

The chosen provider's SDK client is exposed as `ai` on `@bionicjs/core/server`:

```ts
// server/api/chat.ts
import { ai } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const { prompt } = await readBody(event);
  const response = await ai.messages.create({
    model: ai.model,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  return { text: response.content[0].text };
});
```

On the Python side, the same client is importable directly:

```python
# ai/llm.py
from bionicjs.ai import client

response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}],
)
```

## Good to know

- The package stays thin: it records which model and API key to use and hands you the official SDK client.
- Agents, RAG, tools, prompts, and MCP build on top of this client without baking combinations into the scaffold.