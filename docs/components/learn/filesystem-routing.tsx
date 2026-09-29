import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function FilesystemRouting() {
  return (
    <>
      <H3 id="the-convention">The convention</H3>
      <P>
        BionicJS routes map directly from the filesystem. The rule is simple:
      </P>
      <CodeBlock title="Route mapping">
{`app/page.tsx                    → /
app/about/page.tsx              → /about
app/dashboard/settings/page.tsx → /dashboard/settings`}
      </CodeBlock>
      <P>
        Layouts wrap every route below them, so nesting folders is nesting
        layouts:
      </P>
      <CodeBlock title="A small app on disk">
{`app/
|-- page.tsx              -> /
|-- layout.tsx            -> wraps all pages
|-- about/
|   \`-- page.tsx          -> /about
\`-- blog/
    |-- layout.tsx        -> wraps /blog/*
    |-- page.tsx          -> /blog
    \`-- [slug]/
        \`-- page.tsx      -> /blog/:slug`}
      </CodeBlock>
      <P>
        Every route is a file named <Code>page.tsx</Code>. Its path relative to{" "}
        <Code>app/</Code> is the URL. No manual registration, no import list, no
        router config.
      </P>
      <Callout>
        The starter project contains only <Code>app/layout.tsx</Code> and{" "}
        <Code>app/page.tsx</Code>. When you create{" "}
        <Code>app/about/page.tsx</Code>, the route appears automatically. No
        restart required during development.
      </Callout>

      <H3 id="discovery">Build-time discovery</H3>
      <P>
        Filesystem scanning is strictly a build-time and dev-server concern, owned
        by <Code>bionicjsRoutesPlugin</Code>. The browser runtime never scans the
        filesystem or calls <Code>import.meta.glob</Code>.
      </P>
      <CodeBlock file="packages/dev/src/plugins/routes.ts" title="Plugin discovery">
{`const relativeFiles = fg.sync("**/{page,layout}.tsx", { cwd: appDir });
const manifest = parseRoutes(relativeFiles);
return generateRouteModule(manifest);`}
      </CodeBlock>
      <P>
        During development, Vite's file watcher monitors <Code>app/</Code>. When a
        route file is created or deleted, <Code>bionicjsRoutesPlugin</Code> invalidates
        the virtual module graph entry, triggering instant HMR update.
      </P>

      <H3 id="react-router">virtual:bionicjs-routes & React Router</H3>
      <P>
        BionicJS's generator transforms the manifest tree into a virtual module string,{" "}
        <Code>virtual:bionicjs-routes</Code>, exported directly to React Router. Each
        route uses lazy dynamic imports for optimal code splitting.
      </P>
      <CodeBlock title="Generated virtual:bionicjs-routes">
{`import React from "react";
import { BionicJSLayoutAdapter } from "@bionicjs/core/router";

export const routes = [
  {
    lazy: async () => {
      const mod = await import("/app/layout.tsx");
      return {
        Component: () => React.createElement(BionicJSLayoutAdapter, { Layout: mod.default })
      };
    },
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import("/app/page.tsx");
          return { Component: mod.default };
        }
      },
      {
        path: "about",
        lazy: async () => {
          const mod = await import("/app/about/page.tsx");
          return { Component: mod.default };
        }
      }
    ]
  }
];`}
      </CodeBlock>
      <P>
        Layouts use standard React <Code>{"{ children }"}</Code> syntax. The{" "}
        <Code>BionicJSLayoutAdapter</Code> injects React Router's <Code>{"<Outlet />"}</Code>{" "}
        transparently behind the scenes.
      </P>
      <P>
        The developer mounts <Code>{"<BionicJSRouter />"}</Code> at their application root.
        That is the entire router API surface exposed to them. React Router is an internal framework detail.
      </P>
    </>
  );
}
