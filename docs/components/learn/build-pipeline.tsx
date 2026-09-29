import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function BuildPipeline() {
  return (
    <>
      <H3 id="the-build">The Build</H3>
      <P>
        The <Code>bionicjs build</Code> command is a two-step process, mirrored on
        the two engines the framework composes:
      </P>
      <Ol
        items={[
          <>
            <Code>vite build</Code> compiles the React client into static
            assets - the entry bundle, code-split route chunks, CSS, and
            hashed filenames for caching.
          </>,
          <>
            <Code>nitro build</Code> compiles the server routes - the h3
            handlers, the generated Hono RPC router, and the plugin exports - then
            copies the Vite output into Nitro&apos;s public directory.
          </>,
        ]}
      />
      <CodeBlock title="bionicjs build">
{`$ bionicjs build

✓ Build complete in 1.8s`}
      </CodeBlock>
      <P>
        The result is a single deployable server artifact in the{" "}
        <Code>.output/</Code> directory, capable of serving both the API and the
        React SPA fallback. Nothing else needs to be deployed - the client
        bundle is inside the server output.
      </P>

      <H3 id="one-artifact">One artifact</H3>
      <P>
        Because Nitro serves the static files, the build produces a single
        deployable. Deploying the app is deploying the server:
      </P>
      <CodeBlock title=".output/ structure">
{`.output/
|-- server/
|   \`-- index.mjs         # the Nitro server (API + SPA fallback)
|-- public/
|   |-- index.html         # the Vite client entry
|   \`-- assets/            # hashed JS/CSS chunks`}
      </CodeBlock>
      <P>
        There is nothing to configure in a CI pipeline beyond building and
        running <Code>.output/server/index.mjs</Code>. The same artifact runs
        locally, in a container, on a VPS, or on any platform Nitro can target.
      </P>

      <H3 id="generated">What gets generated</H3>
      <P>
        Alongside the client and server bundles, the build writes the generated
        boundary into <Code>.bionicjs/</Code>. These are the same modules the dev
        server serves virtually - on disk during a build, in memory during dev:
      </P>
      <Table
        head={["File", "Contents"]}
        rows={[
          [<Code key="h">.bionicjs/hono.ts</Code>, "The Hono router + AppRouter type built from server/api/*.ts"],
          [<Code key="c">.bionicjs/api-client.ts</Code>, "The typed hc<AppRouter> client exported as api"],
          [<Code key="s">.bionicjs/server.ts</Code>, "The generated auth / db / ai / jobs server exports"],
        ]}
      />

      <H3 id="prerender">Prerendering and targets</H3>
      <P>
        Nitro&apos;s deployment targets carry over unchanged. Because the client
        is static assets and the server is Web-Standards based, BionicJS can emit
        the same build for Node.js, Cloudflare Workers, Deno, or Bun preset.
      </P>
      <Callout>
        The BionicJS build does not compile Python. Python code is deployed
        alongside the server artifact - either in the same container for a
        single-unit deployment, or as a separate service for the microservices
        model.
      </Callout>
    </>
  );
}