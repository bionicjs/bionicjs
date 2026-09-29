import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function TheParserAndManifest() {
  return (
    <>
      <H3 id="the-parser">The Parser</H3>
      <P>
        The BionicJS routing engine does not rely on the browser to discover routes.
        Instead, a build-time parser reads the <Code>app/</Code> directory and
        constructs a pure data tree called the <Code>RouteManifestNode</Code>.
      </P>
      <P>
        The parser takes a flat list of file paths (the output of{" "}
        <Code>fast-glob</Code>) and converts them into a nested tree that
        mirrors the application's URL structure. Every segment in the filesystem
        becomes a node: directories become intermediate nodes, and{" "}
        <Code>page.tsx</Code> / <Code>layout.tsx</Code> files set the{" "}
        <Code>page</Code> and <Code>layout</Code> properties on the node they
        live in.
      </P>
      <CodeBlock file="packages/bionicjs/src/router/parser.ts" title="parseRoutes input/output">
{`const files = [
  "/app/layout.tsx",
  "/app/page.tsx",
  "/app/about/page.tsx",
  "/app/users/[id]/page.tsx",
];

const manifest = parseRoutes(files);
// manifest.segment = ""          (root)
// manifest.layout = "/app/layout.tsx"
// manifest.children[0].segment = "about"
// manifest.children[0].page = "/app/about/page.tsx"`}
      </CodeBlock>

      <H3 id="the-manifest">The manifest</H3>
      <P>
        The parser produces a <Code>RouteManifestNode</Code> - a pure data
        structure describing the routes. There are no JavaScript strings and no
        code generation at this stage; each node records the file that supplied
        its <Code>page</Code> and <Code>layout</Code>:
      </P>
      <CodeBlock title="RouteManifestNode">
{`interface RouteManifestNode {
  segment: string;   // "users", "[id]", ""
  path?: string;     // "users", ":id", ""
  page?: string;     // absolute file path
  layout?: string;   // absolute file path
  children: RouteManifestNode[];
}`}
      </CodeBlock>
      <P>
        The parser does not generate code. It produces a data structure. This
        separation means the tree can be inspected, validated, and transformed
        independently of any output format - a key principle in the BionicJS
        architecture.
      </P>

      <H3 id="segment-transformations">Segment Transformations</H3>
      <P>
        Directory and file names are translated to route path segments using a
        set of deterministic rules. The conventions module defines these
        transformations:
      </P>
      <Table
        head={["Filesystem", "Node Segment", "Route Path"]}
        rows={[
          [<Code key="1">app/page.tsx</Code>, <Code key="2">""</Code>, <Code key="3">index: true</Code>],
          [<Code key="4">app/about/page.tsx</Code>, <Code key="5">"about"</Code>, <Code key="6">"about"</Code>],
          [<Code key="7">app/users/[id]/page.tsx</Code>, <Code key="8">"[id]"</Code>, <Code key="9">":id"</Code>],
          [<Code key="10">app/docs/[...slug]/page.tsx</Code>, <Code key="11">"[...slug]"</Code>, <Code key="12">"*"</Code>],
        ]}
      />
      <P>
        Dynamic segments (<Code>[param]</Code>) become colon-prefixed parameters
        for React Router. Catch-all segments (<Code>[...slug]</Code>) become
        wildcards that match the rest of the URL. Static segments pass through
        unchanged.
      </P>
      <CodeBlock file="packages/bionicjs/src/router/conventions.ts" title="Segment formatting">
{`export function formatSegmentToRoutePath(segment: string): string {
  if (isCatchAllSegment(segment)) return "*";
  if (isDynamicSegment(segment)) return \`:\${segment.slice(1, -1)}\`;
  return segment;
}`}
      </CodeBlock>

      <H3 id="conflicts">Conflict Detection</H3>
      <P>
        Because parsing happens at build time, BionicJS can detect routing conflicts
        before the code ever reaches the browser. If a developer accidentally
        creates both <Code>app/[id]/page.tsx</Code> and{" "}
        <Code>app/[userId]/page.tsx</Code> in the same directory, the parser
        throws a hard error. React Router would otherwise silently swallow this
        and pick one nondeterministically.
      </P>
      <CodeBlock title="Conflict thrown">
{`BionicJS Route Conflict: Conflicting segments "[id]" and "[userId]"
at the same directory level.`}
      </CodeBlock>
      <P>
        The conflict check runs at two levels: two dynamic segments at the same
        directory level (like <Code>[id]</Code> and <Code>[userId]</Code>), and
        two catch-all segments (like <Code>[...slug]</Code> and{" "}
        <Code>[...path]</Code>). Both are errors because they would produce
        overlapping route matches.
      </P>
      <Callout>
        Static files alongside dynamic segments are always allowed.{" "}
        <Code>app/users/page.tsx</Code> (the index) and{" "}
        <Code>app/users/[id]/page.tsx</Code> (the dynamic route) are fine
        together - they match different URL patterns.
      </Callout>
    </>
  );
}
