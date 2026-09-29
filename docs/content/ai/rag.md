RAG (Retrieval-Augmented Generation) grounds model responses in your own data. A thin, composable starting point under `ai/` that wires a vector store into the generation flow.

## What RAG does

Instead of asking the model to answer from memory, RAG retrieves relevant documents first, injects them into the prompt, and lets the model answer from that context — fewer hallucinations, and the answer is traceable to a source.

## Embedding and indexing

```python
# ai/rag.py
from bionicjs.rag import VectorStore

store = VectorStore()  # backed by your vector database

store.ingest("docs.txt", chunk_size=512)
```

## Querying with context

```ts
// server/api/search.ts
import { ai } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const { question } = await readBody(event);
  const context = await ai.rag.query(question, { topK: 4 });
  return {
    answer: await ai.messages.create({
      model: ai.model,
      messages: [{ role: "user", content: `Answer using:\n${context}\n\nQuestion: ${question}` }],
    }),
    sources: context.sources,
  };
});
```

## Good to know

- RAG composes with prompts and agents: retrieved context becomes the prompt, and the agent decides how to use it.
- The vector store is configuration, not framework magic — point the plugin at the store you already use.