import { H3, P, CodeBlock, Callout, Table, Code, Checklist } from "../section-content";

export function ServerAndHono() {
  return (
    <>
      <H3 id="nitro-and-the-http-layer">Nitro and the HTTP layer</H3>
      <P>
        Nitro is BionicJS's server runtime. It owns the HTTP server, the
        server-side build, and the cross-platform deployment target system.
        Nitro is built on <Code>h3</Code>, so every request ultimately runs
        through an h3 event handler.
      </P>
      <P>
        BionicJS does not invent a second handler API on top of that. A route in{" "}
        <Code>server/api/</Code> is an h3 event handler exported with{" "}
        <Code>defineEventHandler</Code>:
      </P>
      <CodeBlock title="server/api/health.ts">
{`import { defineEventHandler } from "h3";

export default defineEventHandler(() => ({
  ok: true,
}));`}
      </CodeBlock>
      <P>
        Neither Nitro nor h3 is exposed as a framework API. You write handlers
        in <Code>server/api/</Code> using their standard shape, and the runtime
        is an implementation detail.
      </P>

      <H3 id="the-typed-rpc-contract">The typed RPC contract</H3>
      <P>
        Hono's role is the client boundary, not the server. BionicJS reads the
        handlers in <Code>server/api/</Code> and generates a typed RPC layer
        into <Code>.bionicjs/</Code>:
      </P>
      <CodeBlock title="Generated artifacts">
{`.bionicjs/hono.ts        Hono router typed from server/api/*
.bionicjs/api-client.ts  hc<AppRouter>() from hono/client`}
      </CodeBlock>
      <P>
        The generated client uses <Code>hono/client</Code>&apos;s{" "}
        <Code>hc</Code> with the router type to give every call site
        end-to-end types. Importing <Code>api</Code> from the generated client
        is the only surface you touch - you never construct a Hono app or
        import from <Code>hono</Code> yourself.
      </P>
      <CodeBlock title="Calling a route from the client">
{`import { api } from "@bionicjs/core";

const res = await api.health();`}
      </CodeBlock>

      <H3 id="who-owns-what">Who owns what</H3>
      <Table
        head={["Layer", "Role", "Visible to you?"]}
        rows={[
          ["Nitro", "Server runtime, build, and deploy targets", "No - implementation detail"],
          ["h3", "Event router and the defineEventHandler shape", "Shape only - standard API"],
          ["Hono", "Generated router type and hc client for RPC", "Via the generated client"],
          ["server/api/*", "Your route handlers", "Yes - this is what you write"],
        ]}
      />
      <Callout>
        Earlier versions of the docs described Hono as the server that runs
        inside Nitro. That is not accurate: requests are handled by Nitro on
        h3, and Hono is the type-safe RPC contract generated for the client.
      </Callout>

      <H3 id="why-this-split">Why this split</H3>
      <P>
        Nitro's value is a portable server output. Keeping handlers on h3 keeps
        that portability intact while Hono supplies the one thing h3 does not:
        a router type that can be shared with the browser for end-to-end
        inference. The two responsibilities stay separate.
      </P>
      <Checklist
        items={[
          "Server code runs on Nitro, on top of h3 handlers.",
          "Hono describes the contract; it does not replace the server.",
          "All Hono output is generated - there is no framework Hono API to learn.",
        ]}
      />
    </>
  );
}
