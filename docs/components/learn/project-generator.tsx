import { H3, P, CodeBlock, Callout, Table, Code, Checklist, Ol } from "../section-content";

export function ProjectGenerator() {
  return (
    <>
      <H3 id="the-scaffolder">The scaffolder</H3>
      <P>
        <Code>create-bionicjs-app</Code> does not write a fixed project. It composes
        one from templates: a <Code>base</Code> template plus one template per
        capability you selected. The output is a directory tree that only
        contains the folders you asked for.
      </P>
      <CodeBlock file="packages/create-bionicjs-app/src/generate.ts" title="Template order">
{`const templates = [BASE_TEMPLATE, ...options.templates];

for (const template of templates) {
  const templateDir = path.join(TEMPLATES_DIR, template);
  await applyTemplate(templateDir, destDir, appName, report);
}`}
      </CodeBlock>
      <P>
        The base template always runs first. It owns the app skeleton -{" "}
        <Code>app/</Code>, <Code>bionicjs.config.ts</Code>, the style entry - and
        every additional template layers on top of it.
      </P>

      <H3 id="file-resolution">File resolution</H3>
      <P>
        For every path a template wants to write, the generator checks what
        already exists on disk before deciding what to do:
      </P>
      <Table
        head={["Situation", "Result"]}
        rows={[
          ["Nothing exists yet", "The file is written once, untouched"],
          ["The base created it", "The file is merged, not overwritten"],
          ["A later template already wrote it", "The later template wins"],
        ]}
      />
      <P>
        Files that no earlier template claimed are only ever written once, by
        whichever template claims them first. Because templates are applied in
        declaration order, the earlier one wins - so the scaffolder is
        deterministic: the same selections always produce the same project.
      </P>
      <Callout>
        <Code>--force</Code> is the only escape hatch. Without it, the generator
        refuses to write into a non-empty directory rather than silently mixing
        a new project into an old one.
      </Callout>

      <H3 id="the-rule">The merge rule</H3>
      <P>
        When a template writes a path the base already created, the generator
        merges the two sources instead of overwriting. What &ldquo;merge&rdquo;
        means depends on the file type:
      </P>
      <Table
        head={["File", "Strategy"]}
        rows={[
          [
            <Code key="p">package.json</Code>,
            "Dependencies merge deeply; later templates can override individual version ranges but never drop an existing one",
          ],
          [
            <Code key="p">pyproject.toml</Code>,
            "Dependency and tool sections merge per key; the same key from a later template wins",
          ],
          [
            <Code key="e">.env.example</Code>,
            "Keys are unioned; an existing key keeps its first value",
          ],
          ["Everything else", "Last writer wins"],
        ]}
      />
      <P>
        Everything outside those three files is replaced by whichever template
        writes it last. That covers app routes, components, and configuration
        files where two versions cannot be meaningfully combined.
      </P>
      <CodeBlock title="Deep merge for package.json">
{`function mergePackageJson(target, source) {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    result[key] =
      value !== null && typeof value === "object" && !Array.isArray(value)
        ? mergePackageJson(result[key] ?? {}, value)
        : value;
  }
  return result;
}`}
      </CodeBlock>

      <H3 id="config-generation">Config generation</H3>
      <P>
        The scaffolder does not just copy files - afterwards it synthesizes{" "}
        <Code>bionicjs.config.ts</Code> from your selections. Only the plugins you
        chose are imported, and each one contributes its own block:
      </P>
      <CodeBlock file="bionicjs.config.ts" title="Generated from selections">
{`import { defineConfig } from "@bionicjs/core";
import { betterAuth } from "@bionicjs/better-auth";
import { drizzle } from "@bionicjs/drizzle";

export default defineConfig({
  auth: betterAuth({ emailAndPassword: { enabled: true } }),

  database: drizzle({
    provider: "sqlite",
    url: process.env.DATABASE_URL!,
  }),
});`}
      </CodeBlock>
      <P>
        AI capabilities work the same way, with one distinction: the config
        records the provider (and high-level settings such as RAG or agents),
        while the implementation folders - <Code>server/ai/agents</Code>,{" "}
        <Code>server/ai/rag</Code>, and so on - are scaffolded as real code
        stubs you edit.
      </P>

      <H3 id="the-report">The report</H3>
      <P>
        Generation is strictly ordered, so a full selection always composes the
        same way - and the scaffolder reports exactly what it did:
      </P>
      <CodeBlock title="create-bionicjs-app --auth better-auth --database sqlite --toolkit drizzle --ai llm/anthropic --jobs celery">
{`templates applied, in order:
  base
  + auth/better-auth
  + database/drizzle/sqlite
  + ai/llm/anthropic
  + jobs/celery
  + jobs/brokers/redis

Created my-app/ with 6 template(s).
42 files written, 3 files merged.`}
      </CodeBlock>

      <H3 id="why-this-design">Why this design</H3>
      <Checklist
        items={[
          <>
            The base template stays definitive for structure, while feature
            templates layer onto it.
          </>,
          <>
            A job template can update <Code>pyproject.toml</Code> without
            clobbering a database plugin&apos;s dependency.
          </>,
          <>
            A route conflict resolves by explicit order, not by accident.
          </>,
          <>
            Every capability is a plugin composed in one file, so the project
            reads as a list of decisions rather than a pile of merged diffs.
          </>,
        ]}
      />
      <Ol
        items={[
          <>Pick capabilities - the interactive prompt or the flags.</>,
          <>Templates resolve onto the base in declaration order.</>,
          <>Conflicts merge by file type (or last writer wins).</>,
          <>
            <Code>bionicjs.config.ts</Code> is generated from the same selections.
          </>,
        ]}
      />
    </>
  );
}
