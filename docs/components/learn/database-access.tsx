import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function DatabaseAccess() {
  return (
    <>
      <H3 id="matrix">Matrix</H3>
      <P>
        BionicJS supports a matrix of database options: PostgreSQL or SQLite,
        combined with ORMs like Prisma, Drizzle, or Kysely. Engine and access
        layer are chosen independently.
      </P>
      <Table
        head={["", "SQLite", "PostgreSQL"]}
        rows={[
          [<Strong key="prisma">Prisma</Strong>, "schema-driven, TS-safe", "schema-driven, TS-safe"],
          [<Strong key="drizzle">Drizzle</Strong>, "query builder", "query builder"],
          [<Strong key="kysely">Kysely</Strong>, "typed SQL builder", "typed SQL builder"],
          [<Strong key="sql">raw sql</Strong>, "direct driver", "direct driver"],
        ]}
      />
      <P>
        The combination becomes a plugin package composed in{" "}
        <Code>bionicjs.config.ts</Code> under the <Code>database</Code> key:
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { drizzle } from "@bionicjs/drizzle";

export default defineConfig({
  database: drizzle({ provider: "sqlite", url: "file:./db.sqlite" }),
});`}
      </CodeBlock>

      <H3 id="client">The client</H3>
      <P>
        The database client is initialized in <Code>server/db/</Code> and is
        exposed at runtime as the <Code>db</Code> export of{" "}
        <Code>@bionicjs/core/server</Code>, making it easily accessible inside any API
        route handler:
      </P>
      <CodeBlock file="server/db/client.ts" title="A Drizzle + SQLite client">
{`import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const client = createClient({ url });
export const db = drizzle({ client, schema });`}
      </CodeBlock>
      <P>
        The client is constructed on the server and never imported into the
        client bundle. Keeping it under <Code>server/</Code> is what guarantees
        the driver and connection pool stay out of the React app.
      </P>

      <H3 id="rules">Rules</H3>
      <Checklist
        items={[
          <>One engine and one access layer per project - no ORM mixing.</>,
          <>The client is constructed on the server and never imported into the client bundle.</>,
          <>SQLite in development, PostgreSQL in production, no code changes: the URL and provider are config, not code.</>,
          <><Code>DATABASE_URL</Code> is the single environment variable; the scaffolded <Code>.env.example</Code> names it.</>,
        ]}
      />

      <H3 id="loading">Connecting at startup</H3>
      <P>
        Server routes can import <Code>db</Code> directly from{" "}
        <Code>@bionicjs/core/server</Code>. The client initializes lazily from the
        environment, so a missing <Code>DATABASE_URL</Code> fails fast at the
        first query with a clear error rather than at process start:
      </P>
      <CodeBlock file="server/api/health.ts">
{`import { db } from "@bionicjs/core/server";

export default defineEventHandler(async () => {
  const row = await db.query.users.findFirst();
  return { ok: true, firstUser: row?.email ?? null };
});`}
      </CodeBlock>
      <Callout>
        The access layer (Prisma, Drizzle, Kysely) only changes the query code.
        The boundary - <Code>db</Code> on <Code>@bionicjs/core/server</Code> - stays the
        same. Swapping Drizzle for Prisma is a config change plus a rewrite of
        the query files, nothing else in the app moves.
      </Callout>
    </>
  );
}