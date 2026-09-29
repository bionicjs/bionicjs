## Structure of ai/ {#structure}

The `ai/` folder is Python. Each file is a module that can be called from
TypeScript through the RPC boundary.

```
ai/
├── __init__.py
├── chat.py          # LLM chat functions
├── agents/          # Agent orchestration
│   ├── __init__.py
│   └── researcher.py
├── rag/             # Retrieval-augmented generation
│   ├── __init__.py
│   └── ingest.py
└── tools/           # Function calling tools
    ├── __init__.py
    └── search.py
```

## Providers {#providers}

Each AI provider is a plugin package. The plugin hands you the official
SDK client — you don't learn a BionicJS-specific API.

| Plugin | Provider | Default Model |
|--------|----------|---------------|
| `@bionicjs/openai` | OpenAI | gpt-4o |
| `@bionicjs/anthropic` | Anthropic | claude-sonnet-4-5 |
| `@bionicjs/google` | Google Gemini | gemini-2.5-pro |
| `@bionicjs/ollama` | Ollama (local) | llama3.2 |

## Calling from the web {#calling}

Python functions are called from TypeScript through the generated RPC
boundary. The types flow automatically — Python defines them, TypeScript
consumes them.

```ts server/api/chat.ts
import { chat } from "@bionicjs/core/server/ai";

export default defineEventHandler(async (event) => {
  const { message } = await readBody(event);
  const reply = await chat(message);
  return { reply };
});
```

No manual fetch. No serialization. Just a typed function call.
