import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function WhyAMetaFramework() {
  return (
    <>
      <H3 id="what-react-gives-you">What React gives you</H3>
      <P>
        React is a rendering library. It gives you a component model, a
        reconciler, hooks for state and side-effects, and a way to describe UI
        as a tree of function calls. That is everything.
      </P>
      <P>
        React does not give you: a router, a way to load data, a server, a
        build pipeline, conventions for where files live, a way to handle
        direct browser requests, a development server, or a deployment model.
        Every React application has to assemble all of that separately.
      </P>
      <CodeBlock title="A raw React app needs">
{`React          - the rendering library
React DOM      - mounting React to the browser
A router       - React Router, TanStack Router, or custom
A bundler      - Vite, Webpack, Parcel, or rspack
A dev server   - provided by the bundler
A server       - Express, Fastify, Nitro, Bun, Deno...
Conventions    - invented by you`}
      </CodeBlock>
      <P>
        All of those decisions are fine ones individually. But assembling them
        correctly, consistently, and in a way that works together - that is the
        problem a meta-framework solves.
      </P>

      <H3 id="what-is-missing">What is missing</H3>
      <P>
        Without a meta-framework you end up with a folder structure you invented,
        a router you configured by hand, a build pipeline you stitched together,
        a dev server you run in one terminal, a backend you run in another, and
        conventions that live only in your team's memory.
      </P>
      <P>
        The practical cost of that is real. Onboarding is slower. Configuration
        drift compounds. Every project looks different. The framework imposes
        none of the constraints that make a codebase understandable three months
        later.
      </P>
      <Callout>
        The key word is <Strong>conventions</Strong>. A meta-framework does not
        prevent you from doing things your own way. It provides a shared, known
        starting point so you spend zero time on the decisions that do not
        differentiate your application.
      </Callout>

      <H3 id="the-meta-framework-layer">The meta-framework layer</H3>
      <P>
        A meta-framework sits above its underlying tools. It makes choices on
        your behalf about how those tools are configured, combined, and
        presented. The developer interacts with the framework; the framework
        interacts with Vite, React Router, and Nitro.
      </P>
      <CodeBlock title="What BionicJS adds">
{`BionicJS
|-- Filesystem routing          # app/page.tsx becomes /
|-- Internal Vite config        # no vite.config.ts required
|-- Internal Nitro config       # no nitro.config.ts required
|-- BionicJS dev runtime            # one public origin at localhost:3000
|-- bionicjs.config.ts              # one config file
\`-- BionicJSRouter                  # routes wired from filesystem`}
      </CodeBlock>
      <P>
        The developer never configures Vite. They never configure Nitro. They
        write <Code>app/about/page.tsx</Code> and it routes to <Code>/about</Code>{" "}
        automatically. That is the meta-framework contract.
      </P>

      <H3 id="bionicjs-vs-nextjs">BionicJS vs Next.js</H3>
      <P>
        Next.js is the dominant React meta-framework. It is a useful reference
        not because BionicJS copies it, but because it defines what the category
        means.
      </P>
      <Table
        head={["Concern", "Next.js", "BionicJS"]}
        rows={[
          ["Routing", "App Router (RSC, server components)", "Filesystem routing - React Router (client)"],
          ["Rendering", "SSR, SSG, streaming, RSC", "CSR first, SSR planned"],
          ["Server", "Node.js / Edge runtime", "Nitro (cross-platform) on h3"],
          ["Config", "next.config.ts", "bionicjs.config.ts"],
          ["Bundler", "Turbopack / Webpack", "Vite"],
          ["Font/Image", "next/font, next/image", "Standard web APIs (framework primitives planned)"],
          ["Python", "Not supported", "First-class, co-located"],
        ]}
      />
      <P>
        BionicJS's goal is not to out-feature Next.js. Its goal is to make the
        TypeScript + Python pair native in a way that no other framework does -
        and to do it with better DX than bolting FastAPI onto a Next.js app.
      </P>
    </>
  );
}
