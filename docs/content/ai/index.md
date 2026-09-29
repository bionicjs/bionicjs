## Overview {#overview}
bionicjs brings intelligent capabilities to your full-stack apps through an integrated Python layer for LLMs and agents.

## LLM providers {#llm}
Pick one provider plugin and get its official SDK client as the `ai` export on `@bionicjs/core/server`:

- **OpenAI** — `@bionicjs/openai`
- **Anthropic** — `@bionicjs/anthropic`
- **Gemini** — `@bionicjs/google`
- **Ollama** — `@bionicjs/ollama` (local, no API key)

## Capabilities {#capabilities}
Composable Python starting points under `ai/`:

- **Agents**: Autonomous AI workflows with tool calling.
- **LLM**: Direct access to the model client.
- **MCP**: Model Context Protocol integrations.
- **Prompts**: Managed prompt templating.
- **RAG**: Retrieval-augmented generation with vector databases.

## Calling from the web {#calling}
```ts
import { ai } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const { prompt } = await readBody(event);
  const response = await ai.messages.create({
    model: ai.model,
    messages: [{ role: "user", content: prompt }],
  });
  return { text: response.content[0].text };
});
```

Capabilities stay in Python, under `ai/`, next to the routes that use them.