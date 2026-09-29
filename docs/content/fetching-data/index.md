## From the client

Client code fetches over `/api` with generated typed stubs. In development
Vite proxies to Nitro; in production Nitro serves it directly.

```tsx app/dashboard/page.tsx
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then((r) => r.json()),
  });

  return <div>{data?.map((u) => <p key={u.id}>{u.name}</p>)}</div>;
}
```

## From the server

Nitro handlers read and return typed data. They can call Python through
the RPC boundary when the answer needs the intelligence layer.

```ts server/api/users.ts
import { db } from "@bionicjs/core/server";

export default defineEventHandler(async () => {
  return await db.query.users.findMany();
});
```

## From Python

Python functions are exposed through generated RPC stubs, so fetching
happens over the same typed contract from either side.

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
