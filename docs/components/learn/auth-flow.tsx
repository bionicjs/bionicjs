import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function AuthFlow() {
  return (
    <>
      <H3 id="integration">Integration</H3>
      <P>
        Authentication is handled in the <Code>server/auth/</Code> directory.
        BionicJS templates support both managed providers (Clerk) and self-hosted
        solutions (Better Auth).
      </P>
      <P>
        Each provider is a plugin package composed under the <Code>auth</Code>{" "}
        key in <Code>bionicjs.config.ts</Code>. Choose one:
      </P>
      <Table
        head={["Package", "Provider", "Mount"]}
        rows={[
          [<Code key="1">@bionicjs/better-auth</Code>, "Better Auth (self-hosted)", <Code key="3">/api/auth/[...auth]</Code>],
          [<Code key="2">@bionicjs/clerk</Code>, "Clerk (managed)", "Client wrappers + server verify"],
          [<Code key="3">@bionicjs/firebase</Code>, "Firebase", <Code key="5">server/auth/firebase.ts</Code>],
          [<Code key="4">@bionicjs/supabase</Code>, "Supabase", <Code key="6">server/auth/supabase.ts</Code>],
          [<Code key="5">@bionicjs/workos</Code>, "WorkOS", "SSO / directory sync"],
        ]}
      />
      <P>
        The generated project carries the matching <Code>server/auth/</Code>{" "}
        handler, and the framework automatically wires up the necessary
        middleware to protect API routes and verify JWT tokens before they reach
        your business logic or the Python RPC boundary.
      </P>

      <H3 id="server-side">Server-side verification</H3>
      <P>
        The handler in <Code>server/auth/</Code> is where tokens are verified.
        The scaffolded pattern reads credentials from the environment and
        exposes an <Code>auth</Code> object on <Code>@bionicjs/core/server</Code>:
      </P>
      <CodeBlock file="server/auth/better-auth.ts" title="A self-hosted handler">
{`import { betterAuth } from "better-auth";

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;

if (!secret) throw new Error("BETTER_AUTH_SECRET is not set");
if (!baseURL) throw new Error("BETTER_AUTH_URL is not set");

export const auth = betterAuth({
  secret,
  baseURL,
  emailAndPassword: { enabled: true },
});`}
      </CodeBlock>
      <P>
        Environment variables are the contract - each provider template writes
        its expected keys into <Code>.env.example</Code> so a fresh clone can be
        filled in without guessing names.
      </P>

      <H3 id="protecting-routes">Protecting routes</H3>
      <P>
        Middleware runs before the route handlers and before the Python RPC
        boundary. A protected API route never performs work without a verified
        session:
      </P>
      <CodeBlock file="server/api/me.ts">
{`import { auth } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const session = await auth.getSession(event);
  if (!session) throw createError({ statusCode: 401 });
  return session.user;
});`}
      </CodeBlock>
      <Checklist
        items={[
          <>The websocket, /api, and server actions all go through the same session verification.</>,
          <>Unverified requests fail in middleware - they never reach a handler or Python.</>,
          <>Client-side, the frontend renders based on session state from the same <Code>auth</Code> boundary.</>,
        ]}
      />
      <Callout>
        BionicJS does not define its own auth protocol. It wires the provider you
        chose - the JWT format, session store, and verification rules belong to
        Better Auth, Clerk, Firebase, or Supabase. BionicJS makes the wiring
        automatic and typed.
      </Callout>
    </>
  );
}