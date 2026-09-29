import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Strong, Ol, A } from "../section-content";

export function HmrAndWatchers() {
  return (
    <>
      <H3 id="chokidar">Chokidar</H3>
      <P>
        BionicJS relies on Vite&apos;s internal file watcher (Chokidar) to monitor
        the <Code>app/</Code> directory for structural changes. The watcher is
        not custom - it is the same <Code>server.watcher</Code> that Vite&apos;s
        own plugins and HMR pipeline use.
      </P>
      <CodeBlock file="packages/dev/src/plugins/routes.ts" title="Watcher registration">
{`if (server.watcher) {
  server.watcher.on("add", handleFileChange);
  server.watcher.on("unlink", handleFileChange);
}`}
      </CodeBlock>
      <P>
        BionicJS listens to <Code>add</Code> and <Code>unlink</Code> events - the
        two that matter for route discovery. Creating a{" "}
        <Code>page.tsx</Code> fires <Code>add</Code>; deleting one fires{" "}
        <Code>unlink</Code>. Editing an existing file does not fire either, and
        correctly triggers ordinary HMR instead of a route-tree rebuild.
      </P>
      <Table
        head={["Path", "Change", "Handled by"]}
        rows={[
          [<Code key="1">app/**/page.tsx</Code>, "added or removed", "Route-tree invalidation"],
          [<Code key="2">app/**/layout.tsx</Code>, "added or removed", "Route-tree invalidation"],
          [<Code key="3">app/**</Code>, "content edit", "Ordinary granular HMR"],
          [<Code key="4">server/**/*.ts</Code>, "content edit", "Nitro server reload"],
          [<Code key="5">ai/**/*.py</Code>, "content edit", "Python process restart"],
        ]}
      />

      <H3 id="invalidation">Invalidation</H3>
      <P>
        When a new <Code>page.tsx</Code> or <Code>layout.tsx</Code> is added or
        deleted, the Vite plugin intercepts the event and invalidates the{" "}
        <Code>virtual:bionicjs-routes</Code> module in Vite&apos;s module graph. This
        forces Vite to request the file again, triggering the BionicJS generator to
        re-run and push the new route tree to the browser:
      </P>
      <CodeBlock title="The invalidation handler">
{`const handleFileChange = (filepath: string) => {
  if (
    normalized.includes("/app/") &&
    (normalized.endsWith("/page.tsx") || normalized.endsWith("/layout.tsx"))
  ) {
    const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
    if (mod) {
      server.moduleGraph.invalidateModule(mod);
      server.ws?.send({ type: "full-reload" });
    }
  }
};`}
      </CodeBlock>
      <P>
        The full lifecycle for creating a route:
      </P>
      <Ol
        items={[
          <>Create <Code>app/contact/page.tsx</Code>.</>,
          <>Vite&apos;s watcher fires an <Code>add</Code> event.</>,
          <>The plugin detects the <Code>page.tsx</Code> suffix under <Code>app/</Code>.</>,
          <>The virtual module is invalidated and a <Code>full-reload</Code> is broadcast.</>,
          <>The browser re-fetches <Code>virtual:bionicjs-routes</Code>, regenerating the route tree.</>,
          <>The new <Code>/contact</Code> route is live.</>,
        ]}
      />
      <P>
        This creates a seamless developer experience where routes appear in the
        browser the second the file is created - and disappear just as quickly,
        without restarting anything.
      </P>
      <Callout>
        The watcher only reacts to structural changes (file added or removed).
        BionicJS uses a <Code>full-reload</Code>, not a fine-grained HMR update,
        because the entire route tree is regenerated - the browser needs a fresh
        copy of the module. Page content edits still get Vite&apos;s normal
        granular HMR.
      </Callout>
    </>
  );
}