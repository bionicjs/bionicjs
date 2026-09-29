## Forms

Submit to `/api` endpoints. Input is validated before it reaches the
database or Python.

```tsx app/login/page.tsx
export default function Login() {
  return (
    <form action="/api/auth/login" method="POST">
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Log in</button>
    </form>
  );
}
```

## Validation

Validation is Zod, at the server boundary. The schema is typed, so what
the client sends is what the server checked.

```ts server/api/auth/login.ts
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, schema);
  // body is typed as { email: string; password: string }
  // ... authenticate user
});
```

## To Python

Mutations that need AI or background processing call Python through the
RPC boundary. The same typed contract — no manual serialization.

```ts server/api/chat.ts
import { chat } from "@bionicjs/core/server/ai";

export default defineEventHandler(async (event) => {
  const { message } = await readBody(event);
  const reply = await chat(message);
  return { reply };
});
```
