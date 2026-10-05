import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function HonoAndRpc() {
  return (
    <>
      <H3 id="what-hono-is">What Hono is</H3>
      <P>
        Hono is a small, fast web framework built on the{" "}
        <A href="https://developer.mozilla.org/en-US/docs/Web/API/Request">
          <Code>Request</Code>
        </A>{" "}
        and <A href="https://developer.mozilla.org/en-US/docs/Web/API/Response">
          <Code>Response</Code>
        </A>{" "}
        interfaces from the Fetch API. Its handlers receive a context object{" "}
        <Code>c</Code> and return a response, with no Node-specific types in
        sight. That is the whole reason it can run unchanged on Node, Bun,
        Deno, Cloudflare Workers, and the edge.
      </P>
      <CodeBlock file="a Hono handler" lang="ts">
{`app.get("/api/health", (c) => c.json({ status: "ok" }));`}
      </CodeBlock>
      <P>
        The important correction, because it comes up constantly:{" "}
        <Strong>Hono is not built on h3, and h3 is not built on Hono</Strong>.
        They are independent projects that solve overlapping problems at
        different layers. Nitro happens to use h3 internally. If you mount
        Hono as a server entry, you are choosing a different request handler
        for the same Nitro server - not adding a second server.
      </P>

      <H3 id="the-idea">The idea: types without codegen</H3>
      <P>
        Hono has a trick worth stealing. A router is an ordinary value, so the
        router's own type describes every route it registered. Expose that type
        and the client is typed for free - no <Code>openapi.json</Code>, no
        <Code>proto</Code> compiler, no generated client package.
      </P>
      <CodeBlock file="the whole contract" lang="ts">
{`// server
const app = new Hono()
  .get("/api/health", (c) => c.json({ status: "ok" }));
export type AppRouter = typeof app;   // routes are known at the type level

// client
import { hc } from "hono/client";
const client = hc<AppRouter>("/");
await client.api.health.$get();       // typed, autocomplete, refactor-safe`}
      </CodeBlock>
      <P>
        BionicJS generates exactly that pair from your{" "}
        <Code>server/api</Code> tree, so a file-based endpoint is also an
        end-to-end typed client method. The design intent is written down in{" "}
        <Code>ARCHITECTURE.md</Code>: client calls are derived from the Hono{" "}
        <Code>AppRouter</Code> type, POST to <Code>/api/&lt;path&gt;</Code>,
        are proxied to Nitro, and reach the matching handler.
      </P>

      <H3 id="what-is-generated">What actually gets generated</H3>
      <P>
        <Code>generateRPC()</Code> in <Code>@bionicjs/dev</Code> globs{" "}
        <Code>server/api/**/*.ts</Code> and emits two files into{" "}
        <Code>.bionicjs/</Code>. Given a single <Code>health.ts</Code> endpoint,
        the output is:
      </P>
      <CodeBlock file=".bionicjs/hono.ts">
{`// AUTO-GENERATED
import { Hono } from "hono";
import route_health from "../server/api/health";

const app = new Hono().basePath("/api");
const routes = app
  .post("/health", async (c) => {
    const args = await c.req.json().catch(() => undefined);
    const result = await route_health(args);
    return c.json(result);
  });

export type AppRouter = typeof routes;
export default app;`}
      </CodeBlock>
      <CodeBlock file=".bionicjs/api-client.ts">
{`// AUTO-GENERATED
import { hc } from "hono/client";
import type { AppRouter } from "./hono";

const client = hc<AppRouter>("/");
export const api = client.api;`}
      </CodeBlock>
      <P>
        The name <Code>AppRouter</Code> is the load-bearing export. Everything
        downstream - the client's method names, the argument types, the return
        types - is inferred from it.
      </P>

      <H3 id="current-state">Current state: generated, not mounted</H3>
      <P>
        This is the honest part. The Hono layer is{" "}
        <Strong>not currently part of the request path</Strong>. Two things are
        unfinished, and it is worth naming both rather than implying the typed
        client works.
      </P>
      <Ol
        items={[
          <>
            <Strong>Nothing mounts the router.</Strong> Nitro is never told
            that <Code>.bionicjs/hono.ts</Code> exists. It keeps serving{" "}
            <Code>server/api</Code> through h3, which is why{" "}
            <Code>/api/health</Code> genuinely returns{" "}
            <Code>200 {"{ status: 'ok' }"}</Code>. The generated{" "}
            <Code>api</Code> client, meanwhile, points at a router that no
            server is running.
          </>,
          <>
            <Strong>The two layers disagree on the handler contract.</Strong>{" "}
            The bridge above calls <Code>route_health(args)</Code> as a plain
            function. But <Code>server/api/health.ts</Code> default-exports{" "}
            <Code>defineEventHandler(() =&gt; ...)</Code>, an h3 handler that
            expects an <Code>H3Event</Code>. So mounting the router as written
            would call the wrong function with the wrong argument.
          </>,
        ]}
      />
      <P>
        In other words: the file-based API works today, and it works{" "}
        <em>without</em> Hono. The typed client is the missing half. See{" "}
        <A href="/learn/the-dev-server">the dev server</A> for the request path
        that is actually live.
      </P>
      <Callout>
        This is why &ldquo;is the API just straight Nitro?&rdquo; has the answer
        it has. Yes - straight Nitro, with h3 handlers, plus a generated Hono
        router that is not connected yet.
      </Callout>

      <H3 id="nitros-own-answer">What Nitro says about Hono</H3>
      <P>
        Hono is the most common server entry in the Nitro ecosystem, alongside
        Elysia, Express, and Fastify. Nitro's documented approach is a{" "}
        <Code>server.ts</Code> entry that handles everything:
      </P>
      <CodeBlock file="server.ts" title="Nitro server entry">
{`import { Hono } from "hono";
export default new Hono().get("/api/*", (c) => c.text("Hono handled it"));
// or mount it: app.route("/api", routes), or export \`{ fetch }\``}
      </CodeBlock>
      <P>
        The entry is a catch-all for unmatched requests, so more specific
        filesystem routes still win. You register it with{" "}
        <Code>serverEntry</Code> in <Code>nitro.config.ts</Code>, and with
        current Nitro you add the framework's Vite plugin{" "}
        <Code>import {"{ nitro }"} from "nitro/vite"</Code> so one Vite dev server
        owns both halves.
      </P>
      <Callout>
        Version caveat. BionicJS currently runs <Code>nitropack@2.13.4</Code>.
        The <Code>serverEntry</Code> option and the <Code>nitro/vite</Code>{" "}
        plugin are Nitro v3 APIs. On 2.13 the equivalents are{" "}
        <Code>handlers</Code> in <Code>nitro.config.ts</Code> and starting
        Nitro yourself - which is what <Code>@bionicjs/dev</Code> already does.
        Do not copy v3 snippets into this codebase without upgrading.
      </Callout>

      <H3 id="the-alternative">The alternative: Nitro's own typing</H3>
      <P>
        Before adding a second router, it is worth asking what Nitro already
        gives you. It emits per-route type declarations at dev time:
      </P>
      <CodeBlock file=".nitro/types/nitro-routes.d.ts" lang="ts">
{`interface NitroRoutes {
  "/api/health": { "get": { "/api/health": { ... } } };
}`}
      </CodeBlock>
      <P>
        Those declarations feed the typed <Code>event.$fetch()</Code> helper, so
        a server handler can call its own API with full type checking and no
        generated client at all:
      </P>
      <CodeBlock file="server/api/report.ts" lang="ts">
{`export default defineEventHandler(async (event) => {
  const { rows } = await event.$fetch("/api/health");  // typed from the route table
  return { rows };
});`}
      </CodeBlock>
      <P>
        Note what <Code>NitroApp</Code> is, because it is easy to guess wrong:
        in <Code>nitropack@2.13</Code> it is the type of the{" "}
        <em>runtime instance</em> - <Code>h3App</Code>, <Code>router</Code>,{" "}
        <Code>hooks</Code>, <Code>localFetch</Code> - not a client-side route
        map like Hono's <Code>AppRouter</Code>. For client-side typing,{" "}
        <Code>nitro-routes.d.ts</Code> and <Code>$Fetch</Code> are the surfaces.
      </P>

      <H3 id="the-decision">The open decision</H3>
      <P>
        Two coherent designs, and the framework has not committed yet. Both are
        defensible; they differ in what a browser client has to do.
      </P>
      <Table
        head={["", "Mount Hono as the server entry", "Rely on Nitro's native types"]}
        rows={[
          [
            <Code key="a">Handler shape</Code>,
            "Plain functions taking args, returning data. No event object.",
            "h3 handlers receiving an H3Event. Status, headers, cookies, streaming.",
          ],
          [
            <Code key="b">Client typing</Code>,
            "hc<AppRouter> gives a real client for the browser.",
            "Route table types the server side; the browser needs a hand-written or generated fetch layer.",
          ],
          [
            <Code key="c">Cost</Code>,
            "A second routing layer plus a bridge that has to keep two contracts in sync.",
            "Nothing extra - but the browser client is on us.",
          ],
        ]}
      />
      <P>
        The honest summary: <Code>hc</Code> is genuinely nice, and the cost is
        that a request which needs a cookie header, a redirect, or a streamed
        response becomes awkward to express through a plain
        <Code>(args) =&gt; data</Code> function. Whichever way this goes, the
        <Code>server/api</Code> file convention should not change - that is the
        part users touch.
      </P>
      <Checklist
        items={[
          <>
            Either way, the fix for the contract mismatch is the same: pick one
            handler shape and make the generator emit a bridge that matches it.
          </>,
          <>
            If Hono is mounted, it also needs a <Code>serverEntry</Code> (or
            Nitro v2 <Code>handlers</Code>) entry - generating the router is not
            enough.
          </>,
          <>
            The h3/Nitro path must keep working as a fallback. It is what
            currently serves every endpoint.
          </>,
        ]}
      />
    </>
  );
}
