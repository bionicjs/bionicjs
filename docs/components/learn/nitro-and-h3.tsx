import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, A } from "../section-content";

export function NitroAndH3() {
  return (
    <>
      <H3 id="one-idea">One idea: a file in server/api is an endpoint</H3>
      <P>
        BionicJS does not have an API router. You do not register a route, you
        do not write a manifest, and there is no <Code>api</Code> key in{" "}
        <Code>bionicjs.config.ts</Code>. You add a file:
      </P>
      <CodeBlock file="server/api/health.ts">
{`import { defineEventHandler } from "h3";

export default defineEventHandler(() => ({
  status: "ok",
}));`}
      </CodeBlock>
      <P>
        That file is the endpoint <Code>/api/health</Code>. Nothing else is
        needed. This chapter explains the three layers that make that sentence
        true, and - just as importantly - what each layer is <em>not</em>{" "}
        responsible for.
      </P>

      <H3 id="the-three-layers">The three layers</H3>
      <P>
        <Code>h3</Code>, <Code>Nitro</Code>, and <Code>Vite</Code> are three
        different projects that solve three different problems. Confusing them
        is the single most common source of confusion in this part of the
        stack, so it is worth being precise.
      </P>
      <Table
        head={["Layer", "Owns", "Does not own"]}
        rows={[
          [
            <Code key="c">h3</Code>,
            "The handler shape. An H3Event, a return value, middleware composition.",
            "Filesystem routing, building, deployment, HTTP server sockets.",
          ],
          [
            <Code key="c">Nitro</Code>,
            "The server. Scans server/api into a router, builds and bundles it, picks a deployment preset.",
            "Your client, your bundler, your React components.",
          ],
          [
            <Code key="c">Vite</Code>,
            "The client. Transforms and bundles app/, serves modules and HMR, proxies /api in dev.",
            "Anything that touches the server runtime.",
          ],
        ]}
      />
      <P>
        The relationship is: <Strong>Nitro is built on h3</Strong>. Nitro is
        the framework; h3 is the HTTP handler library inside it. When you write{" "}
        <Code>defineEventHandler</Code> you are using h3's API, and Nitro is
        what turns your files into a running h3 application.
      </P>
      <Callout>
        A common misreading: &ldquo;is h3 used on both sides?&rdquo; No. h3 is
        <Strong> server-only</Strong>. The browser never sees it. When people say
        h3 is on &ldquo;both sides&rdquo; of a BionicJS project, they are almost
        always describing <em>two copies of the h3 package inside{" "}
        <Code>node_modules</Code></em> - which is a real bug we hit, and one
        worth understanding. See <A href="/learn/nitro-and-h3#two-copies">Two
        copies of h3</A> below.
      </Callout>

      <H3 id="where-h3-ends-up">Where h3 actually appears</H3>
      <P>
        h3 is a dependency that <Code>nitropack</Code> owns. Your app carries
        the same range, and the reason is not preference - it is that your own
        route files import it:
      </P>
      <CodeBlock file="node_modules/nitropack/package.json" lang="json">
{`{
  "dependencies": {
    "h3": "^1.15.11"
  }
}`}
      </CodeBlock>
      <CodeBlock file="server/api/health.ts" lang="ts">
{`import { defineEventHandler } from "h3";

export default defineEventHandler(() => ({ status: "ok" }));`}
      </CodeBlock>
      <P>
        That import resolves from your project, and pnpm gives a project a
        strict <Code>node_modules</Code> by default. A transitive dependency of
        a dependency is not resolvable from your source - there is no{" "}
        <Code>hoist</Code> or <Code>publicHoistPattern</Code> configured
        anywhere in the workspace. So <Code>h3</Code> has to be a direct
        dependency of the app, pinned to the same range Nitro resolves, and
        the two dedupe to a single copy.
      </P>

      <H3 id="two-copies">Two copies of h3</H3>
      <P>
        For a long time the base template pinned its own{" "}
        <Code>h3@2.0.1-rc.31</Code> while <Code>nitropack@2.13</Code> depended
        on <Code>h3@^1.15.11</Code>. A scaffolded app therefore installed two
        majors of the same package side by side:
      </P>
      <CodeBlock file="terminal" lang="bash">
{`$ find node_modules -path '*h3/package.json' | while read f; do
    echo "$(node -p "require('./$f').version")  $f"
  done
1.15.11    node_modules/.pnpm/h3@1.15.11/node_modules/h3/package.json
2.0.1-rc.31 node_modules/.pnpm/h3@2.0.1-rc.31_.../node_modules/h3/package.json`}
      </CodeBlock>
      <P>
        This fails in a way that is genuinely hard to debug, because the
        handlers are not errors - they are simply invisible to the server. The
        two majors do not share a module instance, and they do not even build
        the same function:
      </P>
      <CodeBlock file="terminal" lang="text">
{`app   h3 v2  defineEventHandler -> (anonymous)  arity 0
nitro h3 v1  defineEventHandler -> defineEventHandler  arity 1
same module instance: false`}
      </CodeBlock>
      <P>
        Your <Code>server/api/*.ts</Code> handlers came from v2. Nitro
        dispatched through v1. Every route 404'd, with no warning from either
        package.
      </P>
      <Callout>
        The fix was to <Strong>align</Strong>, not to delete. Dropping the pin
        is not an option: your own <Code>server/api/*.ts</Code> imports h3, so
        the range has to match the runtime it is written against. The rule is
        narrower than &ldquo;no runtime deps&rdquo; -{" "}
        <em>never pin a different major of a runtime dependency than the
        runtime it is written against.</em> Packages only the framework
        imports (<Code>nitropack</Code>, <Code>vite</Code>,{" "}
        <Code>@vitejs/plugin-react</Code>) we removed from the template
        outright; <Code>@bionicjs/dev</Code> owns those.
      </Callout>

      <H3 id="programmatic-startup">How BionicJS starts Nitro</H3>
      <P>
        You never write a <Code>nitro.config.ts</Code>, and you never run{" "}
        <Code>nitro dev</Code>. <Code>bionicjs dev</Code> constructs and starts
        Nitro in-process, from <Code>@bionicjs/dev</Code>. This is the whole
        startup sequence:
      </P>
      <CodeBlock file="packages/dev/src/index.ts" title="runDevServer">
{`// 1. Generate the framework-owned modules from bionicjs.config.ts
await generateAll(cwd);

// 2. Create Nitro. srcDir is what makes server/api/ visible.
const nitro = await createNitro({
  rootDir: cwd,
  srcDir: path.join(cwd, "server"),
  dev: true,
  compatibilityDate: "2026-09-14",
  publicAssets: existsSync(publicDir) ? [{ dir: publicDir }] : [],
  alias: existsSync(generatedServer)
    ? { "@bionicjs/core/server": generatedServer }
    : {},
});

// 3. Listen, prepare types, then run the rebuild watcher
const nitroDevServer = createDevServer(nitro);
await nitroDevServer.listen(3001);
await prepare(nitro);
build(nitro).catch(/* logged */);

// 4. Start Vite for the client, proxying /api to Nitro
const vite = await createViteServer({ /* ... */ });
await vite.listen();   // :3000`}
      </CodeBlock>
      <P>
        Two details in that block are load-bearing, and both were bugs before
        they were documented.
      </P>

      <H3 id="srcdir">srcDir is load-bearing</H3>
      <P>
        Nitro scans <Code>&lt;srcDir&gt;/api</Code>,{" "}
        <Code>&lt;srcDir&gt;/routes</Code>, <Code>&lt;srcDir&gt;/middleware</Code>{" "}
        and <Code>&lt;srcDir&gt;/plugins</Code>. It does <em>not</em> scan{" "}
        <Code>&lt;srcDir&gt;/server/api</Code>.
      </P>
      <P>
        Left at its default, <Code>srcDir</Code> equals <Code>rootDir</Code>,
        which is the project root - so Nitro looked for <Code>./api</Code> and
        registered <Strong>zero routes</Strong>. The <Code>server/</Code>{" "}
        directory was never opened.
      </P>
      <Callout>
        <Code>srcDir</Code> is correct for the version we run, but it is not
        where Nitro is going. On <Code>nitropack@2.x</Code>,{" "}
        <Code>serverDir</Code> means the <em>build output</em> directory
        (<Code>output.serverDir</Code>), and <Code>srcDir</Code> is the
        documented root for <Code>api/</Code>, <Code>routes/</Code>,{" "}
        <Code>public/</Code> and friends. Nitro v3 flips this:{" "}
        <Code>srcDir</Code> is deprecated in favour of a source-level{" "}
        <Code>serverDir</Code>, and filesystem routing is off until you enable
        it. So this line is expected to change with the upgrade.
      </Callout>
      <P>
        Setting <Code>srcDir</Code> moves the scan root, which has knock-on
        effects. Anything Nitro resolves relative to <Code>srcDir</Code> now
        looks inside <Code>server/</Code> - most visibly <Code>public/</Code>,
        which is a sibling of <Code>server/</Code> and therefore has to be
        passed explicitly as <Code>publicAssets</Code>.
      </P>
      <P>
        That side effect is avoidable, and it is the reason to prefer{" "}
        <Code>scanDirs</Code> when we move to Nitro v3. <Code>scanDirs</Code>{" "}
        adds a route-scanning root without relocating <Code>public/</Code>,{" "}
        <Code>utils/</Code> or <Code>assets/</Code>:
      </P>
      <CodeBlock file="nitro.config.ts" lang="ts" title="Nitro v3">
{`export default defineConfig({
  serverDir: "server",   // replaces srcDir
  // scanDirs: ["./server"] as an alternative when you only want extra scan roots
});`}
      </CodeBlock>
      <Callout>
        This is why Nuxt does not ask you to think about any of it. Nuxt owns
        the Nitro configuration outright - you can pass a <Code>nitro</Code>{" "}
        key in <Code>nuxt.config.ts</Code> for advanced use, but{" "}
        <Code>server/api/</Code> just works. That is the model BionicJS is
        copying.
      </Callout>


      <H3 id="request-lifecycle">The request lifecycle</H3>
      <P>
        In development, a browser request to{" "}
        <Code>http://localhost:3000/api/health</Code> takes this path:
      </P>
      <CodeBlock file="request path" lang="text">
{`browser  ──▶  Vite  :3000
               │  /api/* matches the proxy rule
               ▼
            Nitro  :3001
               1. request hook
               2. route rules (headers, redirects)
               3. global middleware
               4. route matching ──▶ server/api/health.ts  (h3 handler)
               5. server entry        (catch-all /**, if present)
               6. renderer            (the HTML shell, for non-API requests)

response ◀── back through the proxy ◀── browser`}
      </CodeBlock>
      <P>
        Anything that is not <Code>/api</Code> and asks for{" "}
        <Code>text/html</Code> is served by Vite's own middleware, which
        synthesises the HTML shell, runs it through{" "}
        <Code>transformIndexHtml</Code>, and returns it. The shell loads{" "}
        <Code>/@id/@bionicjs/core/entry-client</Code>, which is where React
        takes over.
      </P>
      <Checklist
        items={[
          <>
            <Code>3000</Code> is the app origin. The browser only ever talks to
            Vite.
          </>,
          <>
            <Code>3001</Code> is internal. It is where Nitro actually listens,
            and it is reachable only through the proxy.
          </>,
          <>
            <Code>strictPort</Code> is on, so a port conflict fails loudly
            instead of silently moving the app somewhere you did not ask for.
          </>,
        ]}
      />

      <H3 id="the-bonicjs-alias">The generated server interface</H3>
      <P>
        <Code>bionicjs.config.ts</Code> is turned into a real TypeScript module
        at <Code>.bionicjs/server.ts</Code>, exporting <Code>auth</Code>,{" "}
        <Code>db</Code>, <Code>ai</Code> and <Code>jobs</Code>. The point of
        generating a module rather than injecting globals is that both
        compilers can see it, so the types work in an editor.
      </P>
      <P>
        Because it is a real file at a path Vite and Nitro both understand, it
        needs an alias in each. Vite gets it through{" "}
        <Code>resolve.alias</Code>; Nitro gets it through the{" "}
        <Code>alias</Code> option we pass to <Code>createNitro</Code>. Miss the
        second one and server routes silently import an empty stub instead of
        the real interface.
      </P>
      <CodeBlock file="server/api/me.ts">
{`import { auth } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  return auth.getSession(event);
});`}
      </CodeBlock>
      <Callout>
        The alias only exists at dev time. In production the module has to
        resolve for real. That parity is still an open item - see{" "}
        <A href="/blog/how-bionicjs-runs">How BionicJS runs: dev, build, and
        production</A>.
      </Callout>
    </>
  );
}
