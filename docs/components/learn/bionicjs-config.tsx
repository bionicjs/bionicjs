import { H3, P, CodeBlock, Callout, Table, Code } from "../section-content";

export function BionicJSConfig() {
  return (
    <>
      <H3 id="the-file">The file</H3>
      <P>
        Every BionicJS project has a <Code>bionicjs.config.ts</Code> at its root. This
        is the single configuration surface for the framework. There is no{" "}
        <Code>vite.config.ts</Code>, no <Code>nitro.config.ts</Code>, and no
        tooling configuration the developer needs to manage.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { betterAuth } from "@bionicjs/better-auth";
import { drizzle } from "@bionicjs/drizzle";
import { anthropic } from "@bionicjs/anthropic";
import { celery } from "@bionicjs/celery";

export default defineConfig({
  auth: betterAuth({ emailAndPassword: { enabled: true } }),
  database: drizzle({ provider: "sqlite", url: "file:./db.sqlite" }),
  ai: anthropic({ model: "claude-sonnet-4-5" }),
  jobs: celery({ broker: "redis://localhost:6379" }),
});`}
      </CodeBlock>
      <P>
        Each top-level key - <Code>auth</Code>, <Code>database</Code>,{" "}
        <Code>ai</Code>, <Code>jobs</Code> - is a plugin. The provider packages
        ({" "}
        <Code>@bionicjs/better-auth</Code>, <Code>@bionicjs/drizzle</Code>,{" "}
        <Code>@bionicjs/anthropic</Code>, <Code>@bionicjs/celery</Code>, and the rest)
        export the factory you call with your options. The framework reads the
        file at startup and wires each plugin into the dev server, the build,
        and the runtime exports.
      </P>

      <H3 id="plugins">Plugins</H3>
      <P>
        Every first-party plugin is a thin add-on package built on one of four
        factories exported from <Code>bionicjs</Code> - one per capability:
      </P>
      <Table
        head={["Capability", "Factory", "Key", "Packages"]}
        rows={[
          [<Code key="c">auth</Code>, <Code key="f">createAuthPlugin</Code>, <Code key="k">auth</Code>, <Code key="p">better-auth · clerk · firebase · supabase · workos</Code>],
          [<Code key="c">database</Code>, <Code key="f">createDatabasePlugin</Code>, <Code key="k">database</Code>, <Code key="p">prisma · drizzle · kysely · sql</Code>],
          [<Code key="c">ai</Code>, <Code key="f">createAiPlugin</Code>, <Code key="k">ai</Code>, <Code key="p">anthropic · openai · google</Code>],
          [<Code key="c">jobs</Code>, <Code key="f">createJobsPlugin</Code>, <Code key="k">jobs</Code>, <Code key="p">celery · rq · dramatiq</Code>],
        ]}
      />
      <P>
        The provider package stays thin and the shared logic lives in the
        factory. The factory takes <Code>options</Code> (the provider, model,
        path, and feature flags) plus optional <Code>setup</Code> and{" "}
        <Code>generateExports</Code> hooks.
      </P>
      <CodeBlock file="packages/bionicjs-better-auth/src/index.ts" title="A thin plugin package">
{`import { createAuthPlugin } from "@bionicjs/core";

export function betterAuth(options: BetterAuthConfig) {
  return createAuthPlugin({
    name: "better-auth",
    options,
    path: "/api/auth/[...auth]",
    generateExports: () =>
      \`export const auth = {
  getSession: async () => null,
  requireAuth: async () => null,
};\`,
  });
}`}
      </CodeBlock>

      <H3 id="defineconfig">defineConfig</H3>
      <P>
        <Code>defineConfig</Code> is a typed helper exported from{" "}
        <Code>bionicjs</Code>. It returns its input unchanged - its value is
        TypeScript autocompletion and type safety, not runtime transformation.
      </P>
      <CodeBlock file="packages/bionicjs/src/config.ts" title="Implementation">
{`export interface BionicJSPlugin<TName extends string = string, TExports = any> {
  name: TName;
  setup: (app: any) => void | Promise<void>;
  generateExports?: () => string | Promise<string>;
}

export type BionicJSConfig = {
  [key: string]: BionicJSPlugin | any;
};

export function defineConfig(config: BionicJSConfig): BionicJSConfig {
  return config;
}`}
      </CodeBlock>
      <P>
        This is the same pattern used by Vite&apos;s own <Code>defineConfig</Code>,
        Nitro&apos;s <Code>defineNitroConfig</Code>, and virtually every modern
        TypeScript tool. The developer gets IDE help; the framework reads the
        file at startup. The config object is deliberately permissive - any
        key may hold a plugin or a plain value (a port, a flag), so additions
        don&apos;t require a config type change.
      </P>

      <H3 id="runtime">Runtime exports</H3>
      <P>
        Plugins exist to make capabilities importable from real code. The
        client-side RPC helper is <Code>api</Code>, exported from{" "}
        <Code>bionicjs</Code>:
      </P>
      <CodeBlock file="app/page.tsx">
{`import { api } from "@bionicjs/core";

const result = await api.users.sayHello({ name: "bionicjs" });`}
      </CodeBlock>
      <P>
        The server-side handles - auth, the database client, the AI connection,
        and the jobs client - come from a single import,{" "}
        <Code>@bionicjs/core/server</Code>. Their implementations are generated at
        dev/build time from the <Code>generateExports</Code> return value of
        whichever plugins you composed:
      </P>
      <CodeBlock file="server/anything.ts">
{`import { auth, db, ai, jobs } from "@bionicjs/core/server";

const session = await auth.getSession();
const row = await db.query.users.findFirst();
const reply = await ai.chat("hello");
await jobs.enqueue("send-email", { to: "you@bionicjs.dev" });`}
      </CodeBlock>
      <Callout>
        <Code>@bionicjs/core/server</Code> is a generated boundary: import it in your
        server-side code, never from the client. Compose only the plugins you
        use, and only those exports exist.
      </Callout>
    </>
  );
}