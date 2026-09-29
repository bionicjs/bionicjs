import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function LayoutAdaptation() {
  return (
    <>
      <H3 id="the-mismatch">The mismatch</H3>
      <P>
        React Router renders nested routes using the <Code>{"<Outlet />"}</Code>{" "}
        component. A layout component must call <Code>{"<Outlet />"}</Code> where
        its children should appear. But BionicJS developers write standard React
        layouts that accept <Code>children</Code>:
      </P>
      <CodeBlock title="What the developer writes">
{`export default function Layout({ children }) {
  return (
    <div className="layout">
      <nav>...</nav>
      {children}
    </div>
  );
}`}
      </CodeBlock>
      <P>
        This is the idiomatic React pattern - every component library, every
        design system, every documentation page teaches layouts this way. But
        React Router expects <Code>{"<Outlet />"}</Code>, not{" "}
        <Code>children</Code>. If BionicJS required developers to use{" "}
        <Code>{"<Outlet />"}</Code>, it would break the mental model that layouts
        are just regular React components.
      </P>

      <H3 id="adaptation">BionicJSLayoutAdapter</H3>
      <P>
        To bridge this gap, the BionicJS generator wraps every layout in a
        higher-order component called <Code>BionicJSLayoutAdapter</Code>. This
        adapter takes the user&apos;s layout and automatically injects an{" "}
        <Code>{"<Outlet />"}</Code> as its child, completely hiding the React
        Router implementation detail:
      </P>
      <CodeBlock file="packages/bionicjs/src/router/adapter.tsx" title="The adapter">
{`export function BionicJSLayoutAdapter({ Layout }) {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}`}
      </CodeBlock>
      <P>
        When the generator encounters a layout file, it wraps the import in this
        adapter. The developer&apos;s layout component receives{" "}
        <Code>{"<Outlet />"}</Code> as the <Code>children</Code> prop, so it
        renders nested routes exactly where it placed{" "}
        <Code>{"{children}"}</Code>.
      </P>
      <CodeBlock title="Generated route with adapter">
{`lazy: async () => {
  const mod = await import("/app/dashboard/layout.tsx");
  return {
    Component: () => React.createElement(BionicJSLayoutAdapter, { Layout: mod.default })
  };
}`}
      </CodeBlock>

      <H3 id="why-not-outlet">Why not require Outlet?</H3>
      <P>
        Requiring developers to import <Code>{"<Outlet />"}</Code> from{" "}
        <Code>react-router</Code> would leak the routing implementation into
        every layout. The adapter eliminates this coupling entirely.
      </P>
      <P>
        This is a core principle of the BionicJS design: React Router is an
        internal detail. The developer writes <Code>{"<BionicJSRouter />"}</Code> at
        the root and standard <Code>{"{children}"}</Code> layouts everywhere
        else. The framework adapts between the two conventions so the developer
        never has to think about it.
      </P>
      <Callout>
        The adapter is lightweight - it renders the layout with{" "}
        <Code>{"<Outlet />"}</Code> as its only child. There is no extra
        re-rendering, no context providers, no performance overhead. It exists
        purely to translate between two conventions.
      </Callout>
    </>
  );
}
