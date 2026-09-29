import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function TheRpcBoundary() {
  return (
    <>
      <H3 id="communication">Communication</H3>
      <P>
        The boundary between TypeScript and Python in BionicJS is bridged using RPC.
        Instead of manually writing fetch calls, developers define their Python
        functions and BionicJS automatically generates fully-typed TypeScript client
        stubs.
      </P>
      <CodeBlock title="The journey of one call">
{`React component
      |  await generateSummary(text)   // typed stub
      v
Nitro server (server/api handler)
      |  proxied /rpc/* request
      v
Python process (FastAPI RPC surface)
      |  runs the real function
      v
result returns with full types`}
      </CodeBlock>
      <P>
        When you call <Code>await generateSummary(text)</Code> in your React
        component, it calls the Nitro server, which in turn forwards the RPC call
        to the Python process, returning the result with full end-to-end type
        safety.
      </P>

      <H3 id="generation">Generation</H3>
      <P>
        The client stubs are generated, not maintained by hand. The Python
        function signatures are the source of truth, and BionicJS turns them into
        TypeScript types and callable functions:
      </P>
      <CodeBlock title="Python defines">
{`def generate_summary(text: str, max_words: int = 100) -> str:
    """Returns a summary of the text."""
    ...`}
      </CodeBlock>
      <CodeBlock title="TypeScript calls">
{`const summary = await generateSummary({
  text: "a long document",
  maxWords: 80,
});
// summary: string - checked at compile time`}
      </CodeBlock>
      <P>
        Argument and return types are inferred from the Python signature. A
        change on the Python side is reflected in the TypeScript type the moment
        the stubs regenerate - there is no hand-synced schema to drift.
      </P>

      <H3 id="the-contract">The contract</H3>
      <P>
        The RPC boundary is the product BionicJS sells. Where the glued pair (Next.js
        + FastAPI) has untyped JSON, BionicJS has a contract checked both ways:
      </P>
      <Checklist
        items={[
          <>Functions are called by their real names, not URL strings.</>,
          <>Payloads are validated before the Python function runs.</>,
          <>Return values carry Typescript types all the way back to the component.</>,
          <>A wrong argument fails at compile time, not at runtime.</>,
        ]}
      />
      <Callout>
        The boundary applies to AI and jobs as much as to plain Python
        functions. Agents, RAG pipelines, and workers are exported the same way -
        one definition, both sides typed, no glue to write.
      </Callout>
    </>
  );
}