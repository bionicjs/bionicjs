## Communication {#communication}

TypeScript and Python communicate through a generated typed RPC boundary.
The TypeScript server calls Python functions as if they were local — the
serialization, transport, and deserialization are automatic.

## Generation {#generation}

The RPC stubs are generated at build time from your Python function
signatures. Types flow from Python to TypeScript — no manual type
definitions needed.

```python # ai/chat.py
from bionicjs import ai

async def chat(message: str) -> str:
    """Send a message to the AI."""
    client = ai.client()
    response = await client.chat.completions.create(
        model="claude-sonnet-4-5",
        messages=[{"role": "user", "content": message}],
    )
    return response.choices[0].message.content
```

This generates a TypeScript client:

```ts
import { chat } from "@bionicjs/core/server/ai";

const reply = await chat("Hello!"); // typed as (message: string) => Promise<string>
```

## The contract {#the-contract}

The contract is the function signature. Python defines the types,
TypeScript consumes them. If the Python signature changes, the TypeScript
types update on the next build. No schema files, no manual sync.
