## Quick start

```bash
npx create-bionicjs-app@latest my-app
cd my-app
npm run dev
```

The generator asks a few questions — auth provider, database, AI, jobs —
and scaffolds a complete project. Everything is wired: the config, the
server handlers, the client bindings.

## Manual setup

If you prefer to start from scratch:

```bash
mkdir my-app && cd my-app
npm init -y
npm install @bionicjs/core @bionicjs/dev react react-dom
npm install -D typescript @types/react
```

Create `bionicjs.config.ts`:

```ts bionicjs.config.ts
import { defineConfig } from "@bionicjs/core";

export default defineConfig({
  // Add plugins as needed
});
```

Create `app/page.tsx`:

```tsx app/page.tsx
export default function Home() {
  return <h1>Hello from BionicJS</h1>;
}
```

Run the dev server:

```bash
npx bionicjs dev
```

## What's included

- **Vite** for fast HMR and bundling
- **Nitro** for the server (API routes, middleware)
- **React Router** for client-side navigation
- **File-system routing** — pages are files, layouts wrap routes
- **TypeScript** end-to-end

## Project structure

```
my-app/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── about/
│       └── page.tsx      # /about route
├── server/
│   └── api/              # Nitro API routes
├── bionicjs.config.ts        # Framework config
├── package.json
└── tsconfig.json
```

## Next steps

- Read about [why BionicJS](/docs/why-bionicjs) and the philosophy
- Understand the [project structure](/docs/structure)
- Learn about [layouts and pages](/docs/layouts-pages)
