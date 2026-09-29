import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function TheHonestBaseline() {
  return (
    <>
      <H3 id="the-status-quo">The status quo</H3>
      <P>
        In the real world today, most full-stack AI teams write React in
        TypeScript, and models/agents in Python. They wire them together using
        REST endpoints, tRPC, or manually typed fetch calls. It works, but
        it&apos;s fragile. The "glue" is the most common source of errors.
      </P>
      <P>
        Some teams try to write everything in Python (Streamlit, Reflex) but hit
        a wall with UI complexity. Others try to write everything in TypeScript
        (LangChain.js) but hit a wall with the AI ecosystem.
      </P>
      <CodeBlock title="The typical setup">
{`nextjs-app/          fastapi-service/
|-- app/            |-- app/
|-- package.json    |-- requirements.txt
\`-- server.ts      \`-- main.py
      |                   |
      \-- untyped JSON ---/     <- the fragile part`}
      </CodeBlock>
      <P>
        The two worlds are connected by hand-written HTTP: service URLs,
        manual <Code>fetch</Code> calls, duplicated types, and a schema that
        drifts the moment someone touches the Python side.
      </P>
      <H3 id="the-bionicjs-bridge">The BionicJS bridge</H3>
      <P>
        BionicJS&apos;s long-term ambition is a true shared runtime, but we are
        starting with an honest baseline: a beautifully orchestrated monorepo
        where TypeScript and Python live side-by-side, sharing a dev server, a
        build pipeline, and a generated RPC boundary.
      </P>
      <CodeBlock title="The same app as one project">
{`one-app/
|-- app/        # React client (TypeScript)
|-- server/     # Nitro API (TypeScript)
|-- ai/         # models & agents (Python)
|-- jobs/       # workers (Python)
\-- bionicjs.config.ts`}
      </CodeBlock>
      <P>
        The boundary stops being glue and becomes a contract: Python functions
        are callable from TypeScript by name, with types on both sides. One dev
        command starts everything, one build produces the deployable, and the
        schema cannot drift because it is generated, not copied.
      </P>
      <P>
        We are building the framework that makes the dual-language reality feel
        like a single, cohesive product.
      </P>
      <Callout>
        This is the reason BionicJS exists. If single-language frameworks (Next.js,
        Rails, Django) solved your problem, you should use them. BionicJS is for the
        product that needs both worlds - the web surface and the intelligence -
        and does not want the seam to be the liability.
      </Callout>
    </>
  );
}