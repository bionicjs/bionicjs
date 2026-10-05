import { H3, P, CodeBlock, Callout, Table, Code, Checklist, A } from "../section-content";

export function ServerAndHono() {
  return (
    <>
      <H3 id="two-halves">The server runtime is two chapters</H3>
      <P>
        &ldquo;The server&rdquo; in BionicJS is not one thing, and the two
        halves have different names, different maturity, and different
        documentation. This chapter is the map. The two chapters it points to
        carry the detail.
      </P>
      <Table
        head={["", "Nitro and h3", "Hono and the RPC contract"]}
        rows={[
          [
            <Code key="a">Question</Code>,
            "What actually serves a request?",
            "How does the browser learn what the endpoints are?",
          ],
          [
            <Code key="b">Status</Code>,
            "Live. Every request goes through it.",
            "Generated, not yet mounted.",
          ],
          [
            <Code key="c">Projects</Code>,
            <Code key="c1">nitropack</Code>,
            <Code key="c2">hono</Code>,
          ],
          [
            <Code key="d">You write</Code>,
            <Code key="d1">server/api/*.ts</Code>,
            "Nothing. It is generated.",
          ],
        ]}
      />
      <Callout>
        If you just want an endpoint, read{" "}
        <A href="/learn/nitro-and-h3">Nitro and h3</A>. If you are deciding
        whether to bet on the typed client, read{" "}
        <A href="/learn/hono-and-rpc">Hono and the RPC contract</A> - including
        the part where it does not work yet.
      </Callout>

      <H3 id="the-short-version">The short version</H3>
      <P>
        A request arrives at <Code>/api/anything</Code>. Vite proxies it to
        Nitro. Nitro matches it against a file in <Code>server/api/</Code> and
        calls that file&rsquo;s h3 handler. There is no Hono in that path, and
        there is no custom router anywhere.
      </P>
      <CodeBlock file="server/api/health.ts">
{`import { defineEventHandler } from "h3";

export default defineEventHandler(() => ({
  status: "ok",
}));`}
      </CodeBlock>
      <P>
        Separately, <Code>@bionicjs/dev</Code> reads the same{" "}
        <Code>server/api</Code> tree and writes a Hono router to{" "}
        <Code>.bionicjs/hono.ts</Code>, plus a typed client in{" "}
        <Code>.bionicjs/api-client.ts</Code>. That client is the missing half of
        the story: nothing mounts the router, so the file-based API is fully
        functional while the generated client is inert.
      </P>

      <H3 id="who-owns-what">Who owns what</H3>
      <Table
        head={["Layer", "Role", "Visible to you?"]}
        rows={[
          ["Nitro", "Server runtime, build, and deploy presets", "No - an implementation detail"],
          ["h3", "The handler shape, via defineEventHandler", "Shape only, as a standard API"],
          ["Hono", "A generated router type and hc client", "Not yet - it is not mounted"],
          ["server/api/*", "Your endpoints", "Yes - this is what you write"],
        ]}
      />
      <Callout>
        Older revisions of these docs described Hono as the server running
        inside Nitro, and then as purely a client-side type contract. Both
        descriptions were wrong in a way that mattered. Hono is a third
        independent project; today it is generated but unconnected, and the
        live server path is Nitro plus h3.
      </Callout>

      <H3 id="why-split">Why it is split this way</H3>
      <P>
        The split exists because the two problems are genuinely different.
        <Code>h3</Code> gives a portable server: an event object, status codes,
        headers, cookies, streaming, and no Node types in the way. Hono
        contributes the one thing h3 has nothing to do with - a router{" "}
        <em>type</em> that can be shared with the browser.
      </P>
      <P>
        Keeping them separate means the server half works on its own, which is
        why <Code>/api/health</Code> returns <Code>200</Code> today even though
        the typed client is incomplete. The open question is whether the
        client half should be built on Hono at all.
      </P>
      <Checklist
        items={[
          <>
            <Code>server/api/*.ts</Code> is the surface you write, and it does
            not change either way.
          </>,
          <>
            The server runtime is Nitro + h3. That is settled.
          </>,
          <>
            Hono&rsquo;s future is genuinely undecided - treat any Hono example
            you find as aspirational until the router is mounted.
          </>,
        ]}
      />
    </>
  );
}
