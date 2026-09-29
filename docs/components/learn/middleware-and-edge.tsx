import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function MiddlewareAndEdge() {
  return (
    <>
      <H3 id="middleware">Middleware</H3>
      <P>
        BionicJS middleware runs in the Nitro server using h3&apos;s middleware
        shape. It can intercept requests, check authentication tokens, and
        attach context before the request reaches the specific{" "}
        <Code>server/api/</Code> handler.
      </P>
      <CodeBlock title="Middleware concept">
{`HTTP request
      |
      v
  logging / auth / context   <-- middleware stack
      |
      v
   specific route handler    <-- server/api/health.ts`}
      </CodeBlock>
      <P>
        Middleware runs in the order it is registered, and each layer can short
        circuit the chain - rejecting an unauthenticated request, rate limiting
        a client, or adding request metadata that handlers can read. Because it
        sits in front of the route handlers, it applies to an entire group of
        routes without touching each one.
      </P>
      <Callout>
        The middleware stack is where the auth boundary lives. A token check runs
        once, in front of every protected route, instead of being repeated inside
        each handler - and because it runs before the Python RPC boundary, an
        unauthenticated request never costs you a Python roundtrip.
      </Callout>

      <H3 id="request-lifecycle">Request lifecycle</H3>
      <P>
        A single API request moves through the stack in a fixed order:
      </P>
      <Ol
        items={[
          <>The client fetches <Code>/api/...</Code> on the public origin.</>,
          <>In dev, Vite proxies the request to Nitro; in prod, Nitro receives it directly.</>,
          <>Middleware layers run in order - logging, auth, context, rate limiting.</>,
          <>The matched route handler runs with the context attached.</>,
          <>If the handler needs the intelligence layer, it calls the Python RPC boundary.</>,
          <>The response flows back through the stack to the client.</>,
        ]}
      />

      <H3 id="edge">Edge</H3>
      <P>
        Because both Nitro and h3 are built on standard Web APIs (Request,
        Response, fetch), the entire BionicJS server layer is fully edge-compatible.
        It can be deployed to Cloudflare Workers, Vercel Edge, or Deno Deploy
        without modification.
      </P>
      <Table
        head={["Target", "Runtime", "Changes needed"]}
        rows={[
          ["Node.js (VPS, container)", "Node", "None"],
          ["Cloudflare Workers", "Workers runtime", "Nitro preset only"],
          ["Deno", "Deno runtime", "Nitro preset only"],
          ["Bun", "Bun runtime", "Nitro preset only"],
        ]}
      />
      <P>
        The code you write is identical in every case - route handlers stay{" "}
        <Code>defineEventHandler</Code>, middleware stays h3-flavored, and the
        generated RPC boundary stays a Web-standard <Code>fetch</Code>. Changing
        the deployment target is a build preset, not a rewrite.
      </P>
    </>
  );
}