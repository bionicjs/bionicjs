## The split

The boundary is a folder split, not a per-file directive: `app/` is the
client, `server/` is the Nitro backend, and `ai/` and `jobs/` are Python.

## The client — React, CSR first

Today bionicjs is client-side rendered: the browser fetches the bundle and
React renders. SSR is planned — the architecture keeps the render boundary
movable without a rewrite.

## The server — Nitro

`server/` owns the typed API. Handlers are `defineEventHandler`, routes
are files, and everything is TypeScript.

```ts server/api/health.ts
export default defineEventHandler(() => {
  return { status: "ok" };
});
```

## The Python side

Python runs AI and jobs. It is reached through the generated typed RPC
boundary — never an untyped JSON handshake.

```python # ai/chat.py
from bionicjs import ai

async def chat(message: str) -> str:
    client = ai.client()
    response = await client.chat.completions.create(
        model="claude-sonnet-4-5",
        messages=[{"role": "user", "content": message}],
    )
    return response.choices[0].message.content
```
