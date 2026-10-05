import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function HowMetaFrameworksWork() {
  return (
    <>
      <H3 id="the-question">The question this answers</H3>
      <P>
        Every full-stack React framework has to answer the same four
        questions, and the answers are what make frameworks different from
        each other. Once you can answer them for one framework, the others
        stop being mysterious.
      </P>
      <Ol
        items={[
          <>
            <Strong>Who bundles the client?</Strong> Your own bundler, or a
            framework-chosen one you never configure?
          </>,
          <>
            <Strong>Who owns the server runtime?</Strong> The framework&rsquo;s
            own, or a general-purpose server framework it delegates to?
          </>,
          <>
            <Strong>How does a file become an endpoint?</Strong> Convention,
            explicit route config, or both?
          </>,
          <>
            <Strong>How do you pick a deploy target?</Strong> One command that
            emits the right artifact, or an adapter you install?
          </>,
        ]}
      />
      <P>
        BionicJS answers: <Code>Vite</Code> for the client,{" "}
        <Code>Nitro</Code> for the server, filesystem convention for endpoints,
        and deployment targets inherited from Nitro&rsquo;s presets. The rest
        of this chapter is the map of who else does what, so the choice of
        Nitro stops looking arbitrary.
      </P>

      <H3 id="two-families">Two families</H3>
      <P>
        The frameworks split along one line: do they own the server stack, or
        do they borrow one?
      </P>
      <Table
        head={["Framework", "Client bundler", "Server", "Endpoint convention", "Deploy target"]}
        rows={[
          [
            <Code key="b">BionicJS</Code>,
            "Vite",
            "Nitro + h3",
            "server/api/*.ts",
            "Nitro presets (not yet exposed)",
          ],
          [
            <Code key="n">Nuxt</Code>,
            "Vite",
            "Nitro + h3",
            "server/api/*.ts",
            "Nitro presets",
          ],
          [
            <Code key="s">SvelteKit</Code>,
            "Vite",
            "Own, generated",
            "src/routes/**/+server.ts",
            "Adapter package",
          ],
          [
            <Code key="r">React Router 7</Code>,
            "Vite",
            "Own, generated",
            "routes.ts config",
            "Adapter package",
          ],
          [
            <Code key="t">TanStack Start</Code>,
            "Vite",
            "Own, via plugins",
            "createServerFn",
            "Target plugin",
          ],
          [
            <Code key="a">Astro</Code>,
            "Vite",
            "Own, minimal",
            "src/pages/api/*.ts",
            "Adapter package",
          ],
          [
            <Code key="x">Next.js</Code>,
            "Turbopack / webpack",
            "Own runtime",
            "app/**/route.ts",
            "Built-in targets",
          ],
          [
            <Code key="w">Redwood</Code>,
            "Own (Babel, moving to Vite)",
            "Own, serverless",
            "api/src/functions",
            "Deploy targets",
          ],
        ]}
      />
      <P>
        BionicJS is not a unique idea. It is Nuxt&rsquo;s server model with
        React&rsquo;s client, plus Redwood&rsquo;s directory layout. The
        novelty is the combination and the ergonomics, not the existence of any
        one piece.
      </P>

      <H3 id="nuxt">Nuxt: the closest sibling</H3>
      <P>
        Nuxt is the framework BionicJS borrows from most directly, and the
        resemblance is not accidental. It also runs Vite for the client and
        Nitro for the server, it scans <Code>server/api/</Code>, its handlers
        are h3 event handlers, and it owns the Nitro configuration so you never
        write one.
      </P>
      <CodeBlock file="nuxt/server/api/hello.ts" title="a Nuxt endpoint">
{`// defineEventHandler is auto-imported from h3
export default defineEventHandler(() => ({ hello: "world" }));`}
      </CodeBlock>
      <P>
        The differences are about ergonomics rather than architecture. Nuxt
        auto-imports a large surface, and it leans hard on Vue&rsquo;s
        component model. BionicJS instead keeps the imports you would write by
        hand in plain React, and adds capabilities Nuxt has no equivalent of.
      </P>
      <Callout>
        If you want the shortest possible answer to &ldquo;how does this
        compare to Nuxt?&rdquo;: the server half is the same architecture, and
        the client half is React Router instead of Vue.
      </Callout>

      <H3 id="next">Next.js: owning everything</H3>
      <P>
        Next.js is the counter-example: it ships its own bundler, its own
        server runtime, and its own deployment story. There is no Vite and no
        Nitro, and the trade is paid for in a large surface area and a long
        history of breaking changes.
      </P>
      <P>
        Its endpoint convention is a route file exporting standard Web
        handlers, which is closer to Hono&rsquo;s shape than to h3&rsquo;s:
      </P>
      <CodeBlock file="app/api/hello/route.ts" title="a Next.js route handler">
{`export async function GET(request: Request) {
  return Response.json({ hello: "world" });
}`}
      </CodeBlock>
      <P>
        The interesting divergence is that Next has both a Node runtime and an
        opt-in edge runtime, chosen <em>per route</em> with{" "}
        <Code>export const runtime = "edge"</Code>. Nitro makes the equivalent
        choice per build, not per route - one preset for the whole server.
      </P>

      <H3 id="vite-based">The Vite-based adapters</H3>
      <P>
        SvelteKit, React Router 7, TanStack Start, and Astro all took the same
        path: use Vite, generate a server, and push the runtime choice out to
        an adapter the user installs.
      </P>
      <CodeBlock file="svelte.config.js" title="SvelteKit picks its runtime">
{`import adapter from "@sveltejs/adapter-node";
export default { kit: { adapter: adapter() } };`}
      </CodeBlock>
      <P>
        The pattern has a real cost: the framework itself does not know how to
        deploy, so the deployment knowledge moves into a second package that
        has to be chosen, version-matched, and sometimes hand-written.
      </P>
      <P>
        Nitro inverts this. A Nitro preset is a single option that knows how to
        emit for Node, Bun, Deno, Cloudflare, Vercel, Netlify, Lambda and the
        rest, and a framework built on Nitro inherits all of them for free.
        BionicJS is on the right side of that trade - but it is a promise not
        yet kept, because the presets are not exposed yet. See{" "}
        <A href="/blog/how-bionicjs-runs">how BionicJS runs</A>.
      </P>

      <H3 id="redwood">Redwood: the layout sibling</H3>
      <P>
        BionicJS&rsquo;s directory structure comes from Redwood, not from
        Nuxt. Redwood&rsquo;s insight is that a serious app has distinct
        top-level concerns - API functions, auth, database schema, background
        jobs - and that each deserves a directory rather than a directory
        inside <Code>src/</Code>.
      </P>
      <Table
        head={["Redwood", "BionicJS", "Why it is there"]}
        rows={[
          [<Code key="a">api/</Code>, <Code key="b">server/</Code>, "HTTP endpoints and the Node runtime"],
          [<Code key="c">auth/</Code>, <Code key="d">server/auth/</Code>, "Auth provider, in the runtime that verifies it"],
          [<Code key="e">db/</Code>, <Code key="f">server/db/</Code>, "Schema, migrations, and the client"],
          [<Code key="g">jobs/</Code>, <Code key="h">jobs/</Code>, "Background workers, as its own process"],
          [<Code key="i">web/</Code>, <Code key="j">app/</Code>, "The React client"],
        ]}
      />
      <P>
        BionicJS keeps <Code>ai/</Code> and <Code>jobs/</Code> at the root
        rather than under <Code>server/</Code>, because both are Python and
        both run out-of-process. That is a deliberate difference from Redwood,
        not an oversight.
      </P>

      <H3 id="what-to-steal">What is worth taking from each</H3>
      <Checklist
        items={[
          <>
            <Strong>From Nuxt:</Strong> own the Nitro configuration, let the
            user write ordinary files, inherit deployment targets for free.
          </>,
          <>
            <Strong>From Redwood:</Strong> a flat set of capability
            directories, so a project&rsquo;s shape is visible at a glance.
          </>,
          <>
            <Strong>From Next:</Strong> the standard Web{" "}
            <Code>Request</Code>/<Code>Response</Code> signature, which is
            portable and what makes edge runtimes realistic.
          </>,
          <>
            <Strong>From SvelteKit and React Router:</Strong> generating the
            route tree instead of asking users to write a config file, and
            making the dev server feel like one process.
          </>,
        ]}
      />
      <Callout>
        The pattern nobody has solved: typing across the network boundary.
        Every framework here either generates a client or hands you{" "}
        <Code>fetch</Code>. Hono&rsquo;s <Code>hc&lt;AppRouter&gt;</Code> is
        the most promising idea of the lot, which is why BionicJS generates it
        at all - see <A href="/learn/hono-and-rpc">Hono and the RPC contract</A>
        for where that currently stands.
      </Callout>
    </>
  );
}
