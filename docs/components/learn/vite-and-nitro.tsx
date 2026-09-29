import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function ViteAndNitro() {
  return (
    <>
      <H3 id="why-no-index-html">Why no index.html</H3>
      <P>
        A plain Vite project exposes <Code>index.html</Code> because Vite uses
        it as the application entry point. The developer owns it, edits it,
        and controls the HTML structure from it.
      </P>
      <P>
        BionicJS is a framework, not a Vite template. The difference matters: when
        BionicJS owns the application model, the developer should not need to edit
        an HTML file. They write <Code>app/layout.tsx</Code> and{" "}
        <Code>app/page.tsx</Code>. That is the application root.
      </P>
      <Callout>
        Next.js does not expose an <Code>index.html</Code>. React Router's
        framework mode replaces it with <Code>root.tsx</Code>. BionicJS makes the
        same call: <Code>app/layout.tsx</Code> is the root. The HTML shell is
        generated internally.
      </Callout>
      <P>
        Internally, BionicJS generates an HTML entry point that Vite uses. The
        developer never sees it or edits it. Changes to the{" "}
        <Code>{"<html>"}</Code> element, <Code>{"<head>"}</Code> tags, or
        favicon are handled through <Code>app/layout.tsx</Code> and{" "}
        <Code>bionicjs.config.ts</Code>.
      </P>

      <H3 id="vite-inside-bionicjs">Vite inside BionicJS</H3>
      <P>
        BionicJS uses Vite as its frontend development and build tool. Vite is not
        exposed to the developer as a configuration surface. There is no{" "}
        <Code>vite.config.ts</Code> in a BionicJS project.
      </P>
      <P>
        Internally, BionicJS creates the Vite configuration programmatically when
        the dev server starts. The configuration includes:
      </P>
      <Ol
        items={[
          <><Code>@vitejs/plugin-react</Code> for JSX and Fast Refresh</>,
          <>The BionicJS Vite plugin for route discovery and manifest generation</>,
          <>The proxy rule forwarding <Code>/api</Code> requests to Nitro</>,
          <>The <Code>historyApiFallback</Code> configuration for SPA routing</>,
          <>The <Code>root</Code> and <Code>entry</Code> pointing to internal BionicJS files</>,
        ]}
      />
      <P>
        A developer who needs to extend Vite's configuration does so through{" "}
        <Code>bionicjs.config.ts</Code>, not by writing a Vite config directly.
      </P>

      <H3 id="nitro-inside-bionicjs">Nitro inside BionicJS</H3>
      <P>
        Nitro provides the server runtime. It handles HTTP requests, compiles
        server code, and supports deployment to multiple targets - Node.js,
        Cloudflare Workers, Deno, Bun, and more.
      </P>
      <P>
        There is no <Code>nitro.config.ts</Code> in a BionicJS project. BionicJS creates
        the Nitro configuration internally; API requests run through h3
        handlers.
        Server code lives in <Code>server/</Code> and is auto-discovered by
        Nitro's filesystem convention for server routes.
      </P>
      <Callout>
        Nitro's own server filesystem convention applies only to{" "}
        <Code>server/</Code>. BionicJS's application filesystem convention applies
        to <Code>app/</Code>. These two conventions do not overlap.
      </Callout>
    </>
  );
}
