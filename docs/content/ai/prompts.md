Prompts are managed, reusable prompt templates that live under `ai/`. Keep system prompts, instructions, and few-shot examples in one place instead of scattered across route handlers.

## Defining a prompt

Create a markdown or text template with variables:

```md
# ai/prompts/support.md

You are a support agent for {{product}}.

The user wrote: "{{message}}"

Reply in a helpful, concise tone.
```

## Rendering from the server

```ts
// server/api/support.ts
import { ai } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const { message } = await readBody(event);
  const prompt = ai.prompts.render("support", {
    product: "bionicjs",
    message,
  });
  const response = await ai.messages.create({
    model: ai.model,
    messages: [{ role: "user", content: prompt }],
  });
  return { text: response.content[0].text };
});
```

## Good to know

- Prompts are plain files — reviewable, diffable, and safe to iterate on without touching code.
- Render them next to the route that uses them; keep them as composable starting points rather than a framework feature.
- Combine with agents, RAG, and tools freely — prompts are the thin layer that feeds them context.