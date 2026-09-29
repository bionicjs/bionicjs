import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function VirtualModules() {
  return (
    <>
      <H3 id="generator">The Generator</H3>
      <P>
        Once the <Code>RouteManifestNode</Code> tree is built, BionicJS&apos;s
        generator steps in. It traverses the AST and produces a JavaScript
        module string - not a binary bundle, not a compiled artifact, but a
        string of source code that Vite consumes as a virtual module.
      </P>
      <P>
        This string is served through a <Strong>virtual module</Strong> called{" "}
        <Code>virtual:bionicjs-routes</Code>. Virtual modules exist only in
        Vite&apos;s module graph - they are never written to disk and never
        appear in the project directory. Vite resolves them through the plugin&apos;s{" "}
        <Code>resolveId</Code> and <Code>load</Code> hooks.
      </P>
      <CodeBlock file="packages/dev/src/plugins/routes.ts" title="Virtual module resolution">
{`resolveId(id) {
  if (id === virtualModuleId) return resolvedVirtualModuleId;
},

load(id) {
  if (id === resolvedVirtualModuleId) {
    const files = getAppFiles();
    const manifest = parseRoutes(files);
    return generateRouteModule(manifest);
  }
}`}
      </CodeBlock>
      <P>
        Every time the virtual module is requested - either on initial load or
        after an invalidation - the generator re-runs from scratch. The manifest
        is computed fresh, and the resulting code string replaces whatever was
        there before. There is no cached state to drift out of sync.
      </P>

      <H3 id="code-generation">Code Generation</H3>
      <P>
        The generator outputs an array of React Router route objects. Each route
        uses the <Code>lazy</Code> property with a dynamic import, returning
        either a page component or a layout wrapped in{" "}
        <Code>BionicJSLayoutAdapter</Code>. The output is clean, readable
        JavaScript that looks hand-written.
      </P>
      <CodeBlock title="Generated route structure">
{`{
  path: "users",
  lazy: async () => {
    const mod = await import("/app/users/layout.tsx");
    return {
      Component: () => React.createElement(BionicJSLayoutAdapter, { Layout: mod.default })
    };
  },
  children: [
    {
      index: true,
      lazy: async () => {
        const mod = await import("/app/users/page.tsx");
        return { Component: mod.default };
      }
    },
    {
      path: ":id",
      lazy: async () => {
        const mod = await import("/app/users/[id]/page.tsx");
        return { Component: mod.default };
      }
    }
  ]
}`}
      </CodeBlock>
      <P>
        Layout nodes use <Code>BionicJSLayoutAdapter</Code> to wrap the
        user&apos;s layout component. Page nodes return the default export
        directly. The generator handles nesting automatically - child routes
        appear in the <Code>children</Code> array of their parent layout.
      </P>

      <H3 id="lazy-loading">Lazy Loading</H3>
      <P>
        Every route in the generated module uses dynamic imports inside React
        Router&apos;s <Code>lazy</Code> property. This guarantees optimal code
        splitting: only the JavaScript needed for the current page is sent to
        the client.
      </P>
      <Callout>
        When a user navigates from <Code>/about</Code> to{" "}
        <Code>/dashboard</Code>, the browser fetches the{" "}
        <Code>dashboard/page.tsx</Code> chunk - not the entire application.
        Layouts are loaded once and cached by the browser; only their child
        pages trigger additional fetches.
      </Callout>
      <P>
        This pattern is identical to what you would write by hand with React
        Router - BionicJS generates it automatically from the filesystem structure.
        The developer gets the same performance characteristics without
        thinking about code splitting at all.
      </P>
    </>
  );
}
