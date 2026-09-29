import Link from "next/link";
import {
  highlightCode,
  inferLang,
  type CodeLang,
} from "@/lib/highlight";
import { CopyIcon } from "@/components/icons";
import { Tree, Folder, File } from "@/components/file-tree";

export function H3({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      id={id}
      className="mt-10 scroll-mt-24 text-lg font-semibold tracking-tight first:mt-0"
    >
      {children}
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="my-4 leading-7 text-muted-foreground">{children}</p>;
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-medium text-foreground">{children}</strong>;
}

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.875em] text-foreground">
      {children}
    </code>
  );
}

export async function CodeBlock({
  title,
  file,
  lang,
  children,
}: {
  title?: string;
  file?: string;
  lang?: CodeLang;
  children: string;
}) {
  const code = String(children).replace(/^\n/, "").replace(/\s+$/, "");
  const res = await highlightCode(code, lang ?? inferLang(file));
  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-border text-left">
      {(title || file) && (
        <figcaption className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
            <span className="size-2.5 rounded-full bg-muted-foreground/25" />
          </div>
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            {title || file}
          </span>
        </figcaption>
      )}
      <div className="relative">
        <pre className="shiki-block overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed text-foreground">
          <code className="grid">
            {res.lines.map((line, i) => (
              <span key={i} className="line">
                <span className="inline-block w-8 shrink-0 select-none text-right pr-4 text-muted-foreground/50">
                  {i + 1}
                </span>
                {line.tokens.map((token, j) => (
                  <span key={j} style={token.style}>
                    {token.content}
                  </span>
                ))}
                {"\n"}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </figure>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 flex gap-3 rounded-xl border border-border bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
      <span className="mt-0.5 shrink-0 text-muted-foreground">&#9432;</span>
      <div>{children}</div>
    </div>
  );
}

export function Ol({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="my-4 list-decimal space-y-2 pl-5 leading-7 text-muted-foreground marker:font-medium marker:text-foreground/40">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}

export function Checklist({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="my-4 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 leading-7 text-muted-foreground">
          <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Table({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-muted-foreground">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top leading-6">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-medium text-foreground underline underline-offset-4"
    >
      {children}
    </Link>
  );
}

export function SectionContent({ slug }: { slug: string }) {
  return CONTENT[slug] ?? null;
}

const CONTENT: Record<string, React.ReactNode> = {
  introduction: (
    <>
      <P>
        The web runs on TypeScript. Intelligence runs on Python. They do not
        share a runtime, and no amount of glue makes them feel like one thing -
        because the folder says one project while the architecture says two.
      </P>
      <P>
        bionicjs is a fullstack framework that makes the pair native. TypeScript
        owns the web surface: the React client, the routes, the Nitro server.
        Python owns the intelligence layer: AI, agents, RAG, and background
        jobs. One command builds both into a single project:
      </P>
      <CodeBlock>
{`$ npx create-bionicjs-app@latest my-app`}
      </CodeBlock>
      <P>
        The framework wires the two halves together with a typed contract. What
        Python exposes is importable from TypeScript with real types, validated
        on every call - not through untyped JSON you have to trust.
      </P>

      <H3 id="model">One project, both worlds</H3>
      <P>
        A framework is a pair of ecosystems. The web ecosystem
        is TypeScript. The intelligence ecosystem is Python. This framework is
        built on top of both, the way Next.js is built on top of React - it
        does not replace either language; it frames them as one project.
      </P>
      <P>
        The names line up because the framework put them there: one route, one
        directory, two worlds already connected. You think in one feature at a
        time, not in two repositories.
      </P>
      <Callout>
        The runtime stays honest: one public development origin, with Vite and
        Nitro kept as internal subsystems. The implementation can grow toward a
        compiler when the application model proves what needs compiling.
      </Callout>

      <H3 id="boundary">The boundary is the product</H3>
      <P>
        In a glued pair, the boundary is where everything degrades: stubs,
        duplicate types, drifting schemas, untyped JSON. In this framework the
        boundary is the thing being sold - a typed contract generated from one
        definition, checked both ways, no hand-written glue. bionicjs already
        ships this layer.
      </P>

      <H3 id="generators">Generators</H3>
      <P>
        <Code>bionicjs generate</Code> scaffolds a feature end to end: the route,
        the Python behind it, the contract between them. One definition, both
        sides. The generator is the on-ramp that makes the co-located model as
        easy to start as it is to read.
      </P>

      <H3 id="baseline">The honest baseline</H3>
      <P>
        This framework is only worth building if it raises the baseline beyond{" "}
        &ldquo;Next.js plus FastAPI in a monorepo&rdquo;. A meta-framework earns
        its name by owning the boundary the glue only papered over - that is
        the whole project. Reaching for it,{" "}
        <A href="/docs/why-bionicjs">see why bionicjs</A>.
      </P>
    </>
  ),

  "why-bionicjs": (
    <>
      <P>
        A framework is only worth it if it raises the baseline. For bionicjs that
        baseline is explicit: you could already wire React, a Nitro server, and
        a FastAPI service together by hand. This page compares bionicjs against the
        fullstack field - and honestly, against the glued pair - so you can
        decide what the boundary is worth.
      </P>

      <H3 id="the-field">The field at a glance</H3>
      <Table
        head={["", "Web surface", "Intelligence (AI)", "Jobs", "The seam"]}
        rows={[
          [<Strong key="t">bionicjs</Strong>, <Code key="w">React · Vite · Nitro</Code>, <Code key="a">Python, native</Code>, <Code key="j">Python, native</Code>, <Code key="s">typed, generated</Code>],
          [<Strong key="n">Next.js</Strong>, "React · App Router (RSC)", "SDK add-ons", "Vercel cron / platform", "one TS runtime"],
          [<Strong key="r">Remix</Strong>, "React · full-stack loaders", "SDK add-ons", "server functions", "one TS runtime"],
          [<Strong key="nu">Nuxt</Strong>, "Vue · Nitro", "modules", "scheduled tasks", "one TS runtime"],
          [<Strong key="s">SvelteKit</Strong>, "Svelte · Vite", "add-ons", "adapters", "one TS runtime"],
          [<Strong key="w">Astro</Strong>, "Astro · islands", "no built-in", "no built-in", "static-first"],
          [<Strong key="r">Ruby on Rails</Strong>, "Rails · Hotwire / API", "gems", "Active Job + Sidekiq", "one Ruby runtime"],
          [<Strong key="d">Django</Strong>, "Django · templates / DRF", "libraries", "Celery", "one Python runtime"],
          [<Strong key="l">Laravel</Strong>, "Laravel · Blade / Inertia", "packages", "queues", "one PHP runtime"],
          [<Strong key="a">AdonisJS</Strong>, "Adonis · TS fullstack", "packages", "queues (BullMQ)", "one TS runtime"],
          [<Strong key="w2">Wasp</Strong>, "React · Node · Prisma", "add-ons", "built-in jobs", "one TS runtime"],
        ]}
      />
      <P>
        Two observations fall out. First, the field splits into two camps:
        single-runtime fullstack frameworks, and everything else. Second, every
        one of them treats the intelligence layer - AI, agents, workers - as an
        add-on for a single language. bionicjs is the one framework that starts
        from the other world and makes it first class instead of optional.
      </P>

      <H3 id="vs-next-remix">vs Next.js, Remix, Nuxt, SvelteKit</H3>
      <P>
        The four big TS meta-frameworks solved the same problem Next.js solved
        in 2016: they own the web wiring so you can ship without fighting
        config. Next.js leads with React + App Router and server components.
        Remix builds the same idea around data loaders and forms. Nuxt and
        SvelteKit do it for Vue and Svelte.
      </P>
      <P>
        For all of them, the intelligence story is an add-on. Your agent is a
        library call inside a single-language app, and when the job needs to
        run Python, you are back to glue: a service, an HTTP endpoint, untyped
        JSON. bionicjs does not compete on the web wiring - a React + Vite +
        Nitro base is a fair, modern stack - it competes on making{" "}
        <Strong>Python a first-class citizen</Strong> from the first command.
        AI and jobs are not a package you bolt on; they are the reason the
        framework exists.
      </P>
      <P>
        That is also why these compete in a different place than bionicjs. If your
        product is a form and a database, Next.js is genuinely excellent and
        you should use it. If your product is the intelligence - anything an
        agent produces - bionicjs is the one where that is the native model.
      </P>

      <H3 id="vs-wasp">vs Wasp & AdonisJS</H3>
      <P>
        Wasp is the closest sibling: a TypeScript meta-framework that configures
        React + Node + Prisma with auth and jobs built in, driven by a config
        file. It borrows the Rails idea of batteries included - and bionicjs borrows
        it back from them in turn. The difference is the boundary again: Wasp is
        single-runtime, so its jobs are TypeScript jobs. bionicjs&#8217;s jobs and AI
        are Python, with the full Python ecosystem behind them - not a port of a
        few of its ideas.
      </P>
      <P>
        AdonisJS is Node&#8217;s Rails: a batteries-included, opinionated TS
        framework with queues and an excellent CLI. It is a great choice for a
        pure TypeScript product. Neither Wasp nor AdonisJS owns the
        Python/intelligence side, and that is exactly the one bionicjs was built
        for.
      </P>

      <H3 id="vs-django">vs Django & Rails & Laravel</H3>
      <P>
        The batteries-included trio proved the model long before the TS
        frameworks copied it: one command, one project, everything wired. And
        Django is the closest thing to bionicjs&#8217;s history - it is the Python
        framework most AI teams reach for, and it runs jobs with Celery in the
        same language it runs the app in.
      </P>
      <P>
        The difference is the surface. Django&#8217;s web layer is its own
        thing: templates, forms, or DRF for APIs. Modern AI products ship a
        rich, stateful React client and a typed API, and imposing Django&#8217;s
        web model on top of that is why teams end up abstracting it behind a
        JS frontend anyway. bionicjs starts from the web half that already owns the
        client - TypeScript, React, Vite, Nitro - and makes the Python half
        native on the other side, instead of starting in Python and fighting to
        speak TypeScript later.
      </P>
      <P>
        And tasteless as the comparison table looks, it is honest: Rails and
        Laravel are superb when the whole product lives in one language. The
        moment "intelligence" and "web" are both mandatory, the seam they never
        designed for is the whole product - which is exactly what bionicjs makes
        first-class.
      </P>

      <H3 id="vs-glue">vs Next.js + FastAPI (the glued pair)</H3>
      <P>
        This is the real baseline, not the status quo - the field above is the
        context, but the honestly comparable thing is the pair that AI teams
        actually assemble by hand. The pair works, and thousands of products
        run on it. The friction is at the boundary:
      </P>
      <Checklist
        items={[
          <>
            <Strong>Types drift.</Strong> Your Python functions are JSON to the
            frontend. Schemas get hand-copied, get out of date, and nobody
            notices until runtime.
          </>,
          <>
            <Strong>Two dev servers, two deploys.</Strong> Frontend, API, and
            workers each need wiring, ports, proxies, and CI jobs that stay in
            sync by discipline.
          </>,
          <>
            <Strong>Two mental models.</Strong> A &ldquo;feature&rdquo; exists
            in three places across two repos, and the person reading it stitches
            it together by hand.
          </>,
        ]}
      />
      <P>
        bionicjs makes the boundary a typed contract instead of a JSON handshake,
        generates the feature so both sides stay in one folder, and runs one
        dev command and one build. The pair is powerful; bionicjs removes the part
        of it that is paperwork.
      </P>
      <Callout>
        What bionicjs does not claim: it is not a shared runtime. TypeScript and
        Python still run in their own worlds - the framework owns the seam
        between them so you do not have to.
      </Callout>

      <H3 id="bottom-line">The bottom line</H3>
      <P>
        Use a single-runtime framework when the product lives in one language -
        Next.js for a form-heavy React app, Rails for Ruby, Django for Python
        with a lighter web layer. Use the glued pair if you already own the
        wiring and the drift is tolerable.
      </P>
      <P>
        Reach for bionicjs when your product needs both worlds - a rich web surface
        and the intelligence behind it - and you want the boundary to be a
        product, not a liability.
      </P>
    </>
  ),

  "installation": (
    <>
      <H3 id="prerequisites">Prerequisites</H3>
      <P>
        bionicjs needs Node 20+ and, only if you select AI or jobs, Python 3.11+.
        There are no global installs - the CLI runs through{" "}
        <Code>npx</Code>, so node is the only hard requirement.
      </P>
      <H3 id="create">Create a project</H3>
      <P>
        Run the generator. It walks you through each capability with a prompt -
        everything is optional, nothing is installed until the project is
        written:
      </P>
      <CodeBlock>
{`$ npx create-bionicjs-app@latest my-app

? Auth provider -- None
? Database -- None
? AI capabilities (multi-select) -- llm/anthropic
? Jobs system -- None
Created my-app/ using template(s): base`}
      </CodeBlock>
      <H3 id="flags">Choose with flags</H3>
      <P>
        Every prompt has a flag, so the whole stack fits in one CI-friendly
        line - auth, database, toolkit, AI, brokers, everything:
      </P>
      <CodeBlock>
{`$ npx create-bionicjs-app@latest my-app \\
    --auth better-auth \\
    --database sqlite --toolkit drizzle \\
    --ai llm/anthropic --jobs celery --broker redis`}
      </CodeBlock>
      <H3 id="run">Install and run</H3>
      <P>
        <Code>npm install</Code> then <Code>npm run dev</Code>. The dev command
        starts the client, the server, and the Python pieces together - no
        two-terminal dance:
      </P>
      <CodeBlock>
{`$ cd my-app
$ npm install
$ npm run dev

BionicJS dev server
- Local:   http://localhost:3000
✓ Ready in XXXms`}
      </CodeBlock>
    </>
  ),

  "layouts-pages": (
    <>
      <H3 id="routes">Pages - the file system is the router</H3>
      <P>
        Every route is a file. <Code>app/page.tsx</Code> is the index,{" "}
        <Code>app/&lt;name&gt;/page.tsx</Code> is a URL, and nested folders make
        nested paths. No manual registration.
      </P>
      <H3 id="layouts">Layouts wrap every route</H3>
      <P>
        A <Code>app/layout.tsx</Code> at any level wraps all the routes below it
        - shared chrome, nav, providers. Nesting layouts is just nesting
        folders.
      </P>
      <H3 id="react-router">Under the hood - react-router</H3>
      <P>
        The file system compiles to React Router&rsquo;s route tree. You keep the
        typed <Code>Link</Code> and <Code>useNavigate</Code>, and route segments
        are lazy-loaded on navigation.
      </P>
    </>
  ),

  "linking-navigating": (
    <>
      <H3 id="link">Link</H3>
      <P>
        Use <Code>&lt;Link to="/docs/..."&gt;Link&lt;/Link&gt;</Code> for
        client-side navigation - no page reloads, prefetched on hover, lazy
        segments.
      </P>
      <H3 id="navigate">Navigate</H3>
      <P>
        For imperative navigation after an action, use <Code>useNavigate()</Code>.
        It is react-router&rsquo;s API, so anything you know carries over.
      </P>
    </>
  ),

  "server-client-components": (
    <>
      <H3 id="the-split">The split</H3>
      <P>
        The boundary is a folder split, not a per-file directive:{" "}
        <Code>app/</Code> is the client, <Code>server/</Code> is the Nitro
        backend, and <Code>ai/</Code> and <Code>jobs/</Code> are Python.
      </P>
      <H3 id="client">The client - React, CSR first</H3>
      <P>
        Today bionicjs is client-side rendered: the browser fetches the bundle and
        React renders. SSR is planned - the architecture keeps the render
        boundary movable without a rewrite.
      </P>
      <H3 id="server">The server - Nitro</H3>
      <P>
        <Code>server/</Code> owns the typed API. Handlers are{" "}
        <Code>defineEventHandler</Code>, routes are files, and everything is
        TypeScript.
      </P>
      <H3 id="python">The Python side</H3>
      <P>
        Python runs AI and jobs. It is reached through the generated typed RPC
        boundary - never an untyped JSON handshake.
      </P>
    </>
  ),

  "fetching-data": (
    <>
      <H3 id="from-client">From the client</H3>
      <P>
        Client code fetches over <Code>/api</Code> with generated typed stubs.
        In development Vite proxies to Nitro; in production Nitro serves it
        directly.
      </P>
      <H3 id="from-server">From the server</H3>
      <P>
        Nitro handlers read and return typed data. They can call Python through
        the RPC boundary when the answer needs the intelligence layer.
      </P>
      <H3 id="from-python">From Python</H3>
      <P>
        Python functions are exposed through generated RPC stubs, so fetching
        happens over the same typed contract from either side.
      </P>
    </>
  ),

  "mutating-data": (
    <>
      <H3 id="forms">Forms</H3>
      <P>
        Submit to <Code>/api</Code> endpoints. Input is validated before it
        reaches the database or Python.
      </P>
      <H3 id="validation">Validation</H3>
      <P>
        Validation is Zod, at the server boundary. The schema is typed, so what
        the client sends is what the server checked.
      </P>
      <H3 id="to-python">To Python</H3>
      <P>
        When the mutation needs intelligence, it crosses to Python through the
        typed RPC boundary - same file shape as a database write.
      </P>
    </>
  ),

  "caching": (
    <>
      <H3 id="honest">The honest baseline</H3>
      <P>
        bionicjs does not invent a cache layer. Caching lives where the ecosystem
        puts it - HTTP caching in Nitro, client caching in React Query - until
        the framework earns one of its own.
      </P>
      <H3 id="http">HTTP caching</H3>
      <P>
        HTTP caching is Nitro handling cache headers: revalidation, stale-while-
        revalidate, and route-level rules where you opt in.
      </P>
      <H3 id="client">Client caching</H3>
      <P>
        On the client, React Query owns caching - stale times, refetch on
        focus, and cache keys per feature.
      </P>
    </>
  ),

  auth: (
    <>
      <H3 id="providers">Providers</H3>
      <P>
        Every auth provider is a small plugin package that composes itself into{" "}
        <Code>bionicjs.config.ts</Code> under the <Code>auth</Code> key. Pick one:
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { betterAuth } from "@bionicjs/better-auth";

export default defineConfig({
  auth: betterAuth({
    emailAndPassword: { enabled: true },
    socialProviders: {
      google: { clientId: "...", clientSecret: "..." },
    },
  }),
});`}
      </CodeBlock>
      <Table
        head={["Package", "Provider", "Notes"]}
        rows={[
          [<Code key="p">@bionicjs/better-auth</Code>, <Code key="n">Better Auth</Code>, "Self-hosted, mounts at /api/auth/[...auth]"],
          [<Code key="p">@bionicjs/clerk</Code>, <Code key="n">Clerk</Code>, "Managed, wires the client"],
          [<Code key="p">@bionicjs/firebase</Code>, <Code key="n">Firebase</Code>, "Google account stack"],
          [<Code key="p">@bionicjs/supabase</Code>, <Code key="n">Supabase</Code>, "URL + anon key"],
          [<Code key="p">@bionicjs/workos</Code>, <Code key="n">WorkOS</Code>, "SSO / directory sync"],
        ]}
      />
      <P>
        The generated project also carries the matching <Code>server/auth/</Code>{" "}
        handler, so the same choice is scaffolded end-to-end. Whichever provider
        you compose becomes the <Code>auth</Code> export on{" "}
        <Code>@bionicjs/core/server</Code>.
      </P>

      <H3 id="server-side">Server-side verification</H3>
      <P>
        The handler in <Code>server/auth/</Code> is where tokens are verified.
        The scaffolded pattern reads credentials from the environment and
        exposes an <Code>auth</Code> object on <Code>@bionicjs/core/server</Code>:
      </P>
      <CodeBlock file="server/auth/better-auth.ts" title="A self-hosted handler">
{`import { betterAuth } from "better-auth";

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;

if (!secret) throw new Error("BETTER_AUTH_SECRET is not set");
if (!baseURL) throw new Error("BETTER_AUTH_URL is not set");

export const auth = betterAuth({
  secret,
  baseURL,
  emailAndPassword: { enabled: true },
});`}
      </CodeBlock>
      <P>
        Environment variables are the contract — each provider template writes
        its expected keys into <Code>.env.example</Code> so a fresh clone can be
        filled in without guessing names.
      </P>

      <H3 id="protecting-routes">Protecting routes</H3>
      <P>
        Middleware runs before the route handlers and before the Python RPC
        boundary. A protected API route never performs work without a verified
        session:
      </P>
      <CodeBlock file="server/api/me.ts">
{`import { auth } from "@bionicjs/core/server";

export default defineEventHandler(async (event) => {
  const session = await auth.getSession(event);
  if (!session) throw createError({ statusCode: 401 });
  return session.user;
});`}
      </CodeBlock>
      <Checklist
        items={[
          <>The websocket, /api, and server actions all go through the same session verification.</>,
          <>Unverified requests fail in middleware — they never reach a handler or Python.</>,
          <>Client-side, the frontend renders based on session state from the same <Code>auth</Code> boundary.</>,
        ]}
      />

      <H3 id="clerk">Clerk wires the client</H3>
      <P>
        Clerk is the one provider that spans the client side: a publishable key
        frontend mounts its session wrappers around the app, while the secret key
        stays server-side. Compose <Code>@bionicjs/clerk</Code> and the handler under{" "}
        <Code>server/auth/</Code> verifies sessions before protected routes run.
      </P>

      <H3 id="credentials">Credentials</H3>
      <P>
        Keys arrive through the environment. Each provider template writes its
        expected variables into <Code>.env.example</Code> —{" "}
        <Code>BETTER_AUTH_SECRET</Code>, <Code>CLERK_SECRET_KEY</Code>,{" "}
        <Code>FIREBASE_PRIVATE_KEY</Code>, <Code>SUPABASE_ANON_KEY</Code>,{" "}
        <Code>WORKOS_API_KEY</Code> — so a repo clone can be filled in without
        guessing names.
      </P>
      <Callout>
        BionicJS does not define its own auth protocol. It wires the provider you
        chose — the JWT format, session store, and verification rules belong to
        Better Auth, Clerk, Firebase, or Supabase. BionicJS makes the wiring
        automatic and typed.
      </Callout>

      <H3 id="better-auth">Better Auth</H3>
      <P>
        Open-source, self-hosted auth. Better Auth runs on your server with no
        external dependencies. Supports email/password, magic links, and social
        providers (GitHub, Google, etc.). Sessions are stored in your database.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { betterAuth } from "@bionicjs/better-auth";

export default defineConfig({
  auth: betterAuth({
    emailAndPassword: { enabled: true },
    socialProviders: {
      github: { clientId: "...", clientSecret: "..." },
    },
  }),
});`}
      </CodeBlock>
      <P>
        Env vars: <Code>BETTER_AUTH_SECRET</Code>,{" "}
        <Code>BETTER_AUTH_URL</Code>. The handler mounts at{" "}
        <Code>/api/auth/[...auth]</Code>.
      </P>

      <H3 id="clerk-provider">Clerk</H3>
      <P>
        Managed auth service. Clerk handles user management, sessions, and
        multi-factor authentication. The publishable key goes to the client
        (wraps the app), the secret key stays server-side.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { clerk } from "@bionicjs/clerk";

export default defineConfig({
  auth: clerk({
    publishableKey: "...",
    secretKey: "...",
  }),
});`}
      </CodeBlock>
      <P>
        Env vars: <Code>CLERK_PUBLISHABLE_KEY</Code>,{" "}
        <Code>CLERK_SECRET_KEY</Code>.
      </P>

      <H3 id="firebase-provider">Firebase</H3>
      <P>
        Google Firebase Authentication. Uses your Firebase project credentials
        (service account) to verify tokens. Supports email/password, Google
        Sign-In, phone auth, and anonymous auth.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { firebase } from "@bionicjs/firebase";

export default defineConfig({
  auth: firebase({
    projectId: "...",
    clientEmail: "...",
    privateKey: "...",
  }),
});`}
      </CodeBlock>
      <P>
        Env vars: <Code>FIREBASE_PROJECT_ID</Code>,{" "}
        <Code>FIREBASE_CLIENT_EMAIL</Code>,{" "}
        <Code>FIREBASE_PRIVATE_KEY</Code>.
      </P>

      <H3 id="supabase-provider">Supabase</H3>
      <P>
        Supabase auth with your Supabase project. Uses the project URL and
        anon key. Sessions are managed by Supabase; your server verifies JWTs
        against the Supabase API.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { supabase } from "@bionicjs/supabase";

export default defineConfig({
  auth: supabase({
    url: "https://xxx.supabase.co",
    anonKey: "...",
  }),
});`}
      </CodeBlock>
      <P>
        Env vars: <Code>SUPABASE_URL</Code>, <Code>SUPABASE_ANON_KEY</Code>.
      </P>

      <H3 id="workos-provider">WorkOS</H3>
      <P>
        Enterprise SSO and directory sync. WorkOS supports SAML, OIDC, and
        social logins. Ideal for B2B apps that need to connect to customer
        identity providers.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { workos } from "@bionicjs/workos";

export default defineConfig({
  auth: workos({
    apiKey: "...",
    clientId: "...",
    redirectUri: "...",
  }),
});`}
      </CodeBlock>
      <P>
        Env vars: <Code>WORKOS_API_KEY</Code>, <Code>WORKOS_CLIENT_ID</Code>,{" "}
        <Code>WORKOS_REDIRECT_URI</Code>.
      </P>
    </>
  ),

  database: (
    <>
      <H3 id="matrix">The matrix</H3>
      <P>
        A database client is a plugin package composed in{" "}
        <Code>bionicjs.config.ts</Code> under the <Code>database</Code> key. Engine
        and access layer are chosen independently:
      </P>
      <Table
        head={["", "SQLite", "PostgreSQL"]}
        rows={[
          [<Strong key="prisma">Prisma</Strong>, "schema-driven, TS-safe", "schema-driven, TS-safe"],
          [<Strong key="drizzle">Drizzle</Strong>, "query builder", "query builder"],
          [<Strong key="kysely">Kysely</Strong>, "typed SQL builder", "typed SQL builder"],
          [<Strong key="sql">raw sql</Strong>, "direct driver", "direct driver"],
        ]}
      />
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { drizzle } from "@bionicjs/drizzle";

export default defineConfig({
  database: drizzle({ provider: "sqlite", url: "file:./db.sqlite" }),
});`}
      </CodeBlock>

      <H3 id="client">The client</H3>
      <P>
        The database client is initialized in <Code>server/db/</Code> and is
        exposed at runtime as the <Code>db</Code> export of{" "}
        <Code>@bionicjs/core/server</Code> — injected into Hono&apos;s context, making it
        easily accessible inside any API route handler:
      </P>
      <CodeBlock file="server/db/client.ts" title="A Drizzle + SQLite client">
{`import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const client = createClient({ url });
export const db = drizzle({ client, schema });`}
      </CodeBlock>
      <P>
        The client is constructed on the server and never imported into the
        client bundle. Keeping it under <Code>server/</Code> is what guarantees
        the driver and connection pool stay out of the React app.
      </P>

      <H3 id="rules">Rules</H3>
      <Checklist
        items={[
          <>
            One engine and one access layer per project — no ORM mixing.
          </>,
          <>
            The client is constructed on the server and never imported into the
            client bundle.
          </>,
          <>
            SQLite in development, PostgreSQL in production, no code changes:
            the URL and provider are config, not code.
          </>,
          <>
            <Code>DATABASE_URL</Code> is the single environment variable; the
            scaffolded <Code>.env.example</Code> names it.
          </>,
        ]}
      />

      <H3 id="loading">Connecting at startup</H3>
      <P>
        Server routes can import <Code>db</Code> directly from{" "}
        <Code>@bionicjs/core/server</Code>. The client initializes lazily from the
        environment, so a missing <Code>DATABASE_URL</Code> fails fast at the
        first query with a clear error rather than at process start:
      </P>
      <CodeBlock file="server/api/health.ts">
{`import { db } from "@bionicjs/core/server";

export default defineEventHandler(async () => {
  const row = await db.query.users.findFirst();
  return { ok: true, firstUser: row?.email ?? null };
});`}
      </CodeBlock>
      <Callout>
        The access layer (Prisma, Drizzle, Kysely) only changes the query code.
        The boundary — <Code>db</Code> on <Code>@bionicjs/core/server</Code> — stays the
        same. Swapping Drizzle for Prisma is a config change plus a rewrite of
        the query files, nothing else in the app moves.
      </Callout>

      <H3 id="prisma-provider">Prisma</H3>
      <P>
        Schema-first ORM. Prisma uses a <Code>schema.prisma</Code> file to
        define your data model, then generates a type-safe client. Best for
        teams that want a single source of truth for their database schema.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { prisma } from "@bionicjs/prisma";

export default defineConfig({
  database: prisma({ provider: "postgresql", url: env("DATABASE_URL") }),
});`}
      </CodeBlock>
      <P>
        Generates <Code>db</Code> on <Code>@bionicjs/core/server</Code> with full
        Prisma Client types. Run <Code>npx prisma migrate dev</Code> to manage
        schema migrations.
      </P>

      <H3 id="drizzle-provider">Drizzle</H3>
      <P>
        TypeScript-first ORM with a SQL-like query builder. Drizzle infers
        types from your schema definitions — no code generation step. Lightweight
        and fast, with first-class SQLite and PostgreSQL support.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { drizzle } from "@bionicjs/drizzle";

export default defineConfig({
  database: drizzle({ provider: "sqlite", url: "file:./db.sqlite" }),
});`}
      </CodeBlock>
      <P>
        Generates <Code>db</Code> on <Code>@bionicjs/core/server</Code> with Drizzle's
        query builder. Use <Code>drizzle-kit</Code> for migrations.
      </P>

      <H3 id="kysely-provider">Kysely</H3>
      <P>
        Type-safe SQL query builder. Kysely gives you full SQL power with
        TypeScript autocompletion. No ORM overhead — you write SQL, Kysely
        makes it type-safe.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { kysely } from "@bionicjs/kysely";

export default defineConfig({
  database: kysely({ provider: "postgres", url: env("DATABASE_URL") }),
});`}
      </CodeBlock>
      <P>
        Generates <Code>db</Code> on <Code>@bionicjs/core/server</Code> with Kysely's
        query builder. Write raw SQL with full type inference.
      </P>

      <H3 id="sql-provider">Raw SQL</H3>
      <P>
        No abstraction. Use the database driver directly — pg, better-sqlite3,
        or mysql2. Full control over queries, connections, and pooling.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { sql } from "@bionicjs/sql";

export default defineConfig({
  database: sql({ provider: "sqlite", url: "file:./db.sqlite" }),
});`}
      </CodeBlock>
      <P>
        Generates <Code>db</Code> on <Code>@bionicjs/core/server</Code> as a raw driver
        instance. You write the queries, you manage the connection.
      </P>
    </>
  ),

  ai: (
    <>
      <H3 id="llm">LLM providers</H3>
      <P>
        An AI provider is a plugin package composed in{" "}
        <Code>bionicjs.config.ts</Code> under the <Code>ai</Code> key. The package
        stays thin - it records which model and API key to use and hands you an
        official SDK client as the <Code>ai</Code> export on{" "}
        <Code>@bionicjs/core/server</Code>.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { anthropic } from "@bionicjs/anthropic";

export default defineConfig({
  ai: anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: "claude-sonnet-4-5",
  }),
});`}
      </CodeBlock>
      <Table
        head={["Package", "SDK", "Default model"]}
        rows={[
          [<Code key="p">@bionicjs/anthropic</Code>, <Code key="s">Anthropic SDK</Code>, <Code key="m">claude-sonnet-4-5</Code>],
          [<Code key="p">@bionicjs/openai</Code>, <Code key="s">OpenAI SDK</Code>, <Code key="m">gpt-4o</Code>],
          [<Code key="p">@bionicjs/google</Code>, <Code key="s">Google Gemini SDK</Code>, <Code key="m">gemini-2.5-pro</Code>],
        ]}
      />

      <H3 id="capabilities">Capabilities</H3>
      <P>
        Agents, RAG, tools, prompts, and MCP live under <Code>ai/</Code> as
        thin, composable Python starting points. The model client is the
        foundation; capabilities build on it without baking combinations into
        the scaffold. Enable what the feature needs, in Python, next to the
        route that uses it.
      </P>

      <H3 id="openai-provider">OpenAI</H3>
      <P>
        OpenAI's GPT models. The plugin hands you the official OpenAI Python SDK
        client as <Code>ai</Code> on <Code>@bionicjs/core/server</Code>. Supports
        chat completions, function calling, and vision.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { openai } from "@bionicjs/openai";

export default defineConfig({
  ai: openai({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o",
  }),
});`}
      </CodeBlock>
      <P>
        Env var: <Code>OPENAI_API_KEY</Code>. Default model:{" "}
        <Code>gpt-4o</Code>.
      </P>

      <H3 id="anthropic-provider">Anthropic</H3>
      <P>
        Anthropic's Claude models. The plugin provides the official Anthropic
        Python SDK. Claude excels at long-context reasoning, coding, and
        analysis.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { anthropic } from "@bionicjs/anthropic";

export default defineConfig({
  ai: anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: "claude-sonnet-4-5",
  }),
});`}
      </CodeBlock>
      <P>
        Env var: <Code>ANTHROPIC_API_KEY</Code>. Default model:{" "}
        <Code>claude-sonnet-4-5</Code>.
      </P>

      <H3 id="google-provider">Google Gemini</H3>
      <P>
        Google's Gemini models via the Google AI Python SDK. Gemini supports
        multimodal input (text, images, video) and has a generous free tier.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { google } from "@bionicjs/google";

export default defineConfig({
  ai: google({
    apiKey: process.env.GOOGLE_AI_API_KEY!,
    model: "gemini-2.5-pro",
  }),
});`}
      </CodeBlock>
      <P>
        Env var: <Code>GOOGLE_AI_API_KEY</Code>. Default model:{" "}
        <Code>gemini-2.5-pro</Code>.
      </P>

      <H3 id="ollama-provider">Ollama</H3>
      <P>
        Local models via Ollama. No API key needed — Ollama runs models on your
        machine. Great for development, testing, and privacy-sensitive workloads.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { ollama } from "@bionicjs/ollama";

export default defineConfig({
  ai: ollama({
    baseUrl: "http://localhost:11434",
    model: "llama3.2",
  }),
});`}
      </CodeBlock>
      <P>
        No env var needed. Default model: <Code>llama3.2</Code>. Ensure Ollama
        is running locally.
      </P>
    </>
  ),

  jobs: (
    <>
      <H3 id="systems">Job systems</H3>
      <P>
        A background-job system is a plugin package composed in{" "}
        <Code>bionicjs.config.ts</Code> under the <Code>jobs</Code> key. The
        enqueue client becomes the <Code>jobs</Code> export on{" "}
        <Code>@bionicjs/core/server</Code>, and the worker entrypoint is scaffolded under{" "}
        <Code>jobs/</Code>.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { celery } from "@bionicjs/celery";

export default defineConfig({
  jobs: celery({ broker: "redis://localhost:6379" }),
});`}
      </CodeBlock>
      <Table
        head={["Package", "System", "Language"]}
        rows={[
          [<Code key="p">@bionicjs/celery</Code>, <Code key="n">Celery</Code>, "Python"],
          [<Code key="p">@bionicjs/rq</Code>, <Code key="n">RQ</Code>, "Python"],
          [<Code key="p">@bionicjs/dramatiq</Code>, <Code key="n">Dramatiq</Code>, "Python"],
        ]}
      />

      <H3 id="brokers">Brokers</H3>
      <P>
        Celery and Dramatiq accept a broker URL; RQ is Redis-only by design. Use
        Redis or RabbitMQ as the transport - the broker value is configuration,
        so switching it in development versus production changes a URL, not
        code.
      </P>

      <H3 id="celery-provider">Celery</H3>
      <P>
        The most widely used Python task queue. Celery supports Redis and
        RabbitMQ brokers, scheduled tasks, retries, and task chains. The plugin
        scaffolds a worker entrypoint under <Code>jobs/</Code>.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { celery } from "@bionicjs/celery";

export default defineConfig({
  jobs: celery({ broker: "redis://localhost:6379" }),
});`}
      </CodeBlock>
      <P>
        Scaffolded under <Code>jobs/</Code>. Enqueue with{" "}
        <Code>jobs.enqueue("tasks.add", args=[1, 2])</Code> from{" "}
        <Code>@bionicjs/core/server</Code>.
      </P>

      <H3 id="rq-provider">RQ</H3>
      <P>
        Redis Queue. Simple, lightweight, Redis-only. RQ is ideal for smaller
        workloads where you want minimal setup. No broker choice — it's always
        Redis.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { rq } from "@bionicjs/rq";

export default defineConfig({
  jobs: rq({ broker: "redis://localhost:6379" }),
});`}
      </CodeBlock>
      <P>
        Redis-only. Enqueue with{" "}
        <Code>jobs.enqueue("my_func", arg1, arg2)</Code> from{" "}
        <Code>@bionicjs/core/server</Code>.
      </P>

      <H3 id="dramatiq-provider">Dramatiq</H3>
      <P>
        A fast, reliable task processing library. Dramatiq supports Redis and
        RabbitMQ, with built-in retries, rate limiting, and priority queues.
        Simpler API than Celery.
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { dramatiq } from "@bionicjs/dramatiq";

export default defineConfig({
  jobs: dramatiq({ broker: "redis://localhost:6379" }),
});`}
      </CodeBlock>
      <P>
        Enqueue with <Code>jobs.enqueue("my_task", arg1)</Code> from{" "}
        <Code>@bionicjs/core/server</Code>.
      </P>
    </>
  ),

  "quick-start": (
    <>
      <H3 id="interactive">Run it interactively</H3>
      <P>
        Run the generator and answer the prompts. Each question picks a
        template package - nothing is installed until the project is written.
      </P>
      <CodeBlock>
{`$ npx create-bionicjs-app@latest my-app
? Auth provider -- None
? Database -- None
? AI capabilities (multi-select) -- llm/anthropic
? Jobs system -- None
? Broker for jobs -- Redis

Created my-app/ with 2 template(s): base + ai/llm/anthropic
18 files written.`}
      </CodeBlock>
      <P>
        The interactive flow walks through auth, database (plus its toolkit),
        AI capabilities, and jobs - in that order, mirroring the flags below.
      </P>

      <H3 id="flags">Flags for everything up front</H3>
      <P>
        Every prompt has a flag, so the whole choice fits in one line - or in
        CI:
      </P>
      <CodeBlock>
{`$ npx create-bionicjs-app@latest my-app \\
    --auth better-auth \\
    --database sqlite --toolkit drizzle \\
    --ai llm/anthropic,rag,agents \\
    --jobs celery --broker redis`}
      </CodeBlock>
      <Table
        head={["Flag", "Choices", "Default"]}
        rows={[
          ["--auth", "better-auth, clerk, firebase, supabase, workos", "none"],
          ["--database", "sqlite, postgresql, none", "none"],
          ["--toolkit", "prisma, drizzle, kysely, sql", "sql"],
          ["--ai", "llm/openai, llm/anthropic, llm/google, llm/ollama, agents, rag, tools, prompts, mcp", "---"],
          ["--jobs", "celery, rq, dramatiq", "none"],
          ["--broker", "redis, rabbitmq (Redis required for rq)", "redis"],
        ]}
      />
      <Callout>
        <Code>--database sqlite --toolkit drizzle</Code> becomes the package
        <Code>@bionicjs/drizzle</Code> composed in <Code>bionicjs.config.ts</Code>.
        Likewise <Code>--jobs celery</Code> becomes{" "}
        <Code>@bionicjs/celery</Code>, and so on.
      </Callout>

      <H3 id="run">Install and run</H3>
      <P>
        Install dependencies, then start everything with one command:
      </P>
      <CodeBlock>
{`$ cd my-app
$ npm install
$ npm run dev

BionicJS dev server
- Local:   http://localhost:3000
- Network: http://192.168.0.211:3000
✓ Ready in 255ms`}
      </CodeBlock>
      <P>
        <Code>npm run dev</Code> starts the BionicJS development runtime. The browser
        talks to one origin at <Code>localhost:3000</Code>; internally BionicJS keeps
        Vite on client tooling and Nitro on the server runtime. No two-terminal
        dance, no public <Code>localhost:5173</Code>.
      </P>
    </>
  ),

  "structure": (
    <>
      <P>
        A fresh bionicjs project is a single directory with four fixed top-level
        folders. Only the folders you asked for are generated:
      </P>
      <Tree className="my-6 rounded-xl border border-border p-4">
        <Folder name="my-app" defaultOpen>
          <Folder name="app" defaultOpen>
            <File name="globals.css" />
            <File name="layout.tsx" type="root layout" />
            <File name="page.tsx" type="home page" />
          </Folder>
          <Folder name="server" defaultOpen>
            <Folder name="api" defaultOpen>
              <File name="health.ts" type="API route" />
            </Folder>
            <Folder name="auth">
              <File name="..." type="when auth selected" />
            </Folder>
          </Folder>
          <Folder name="ai">
            <File name="..." type="Python, when selected" />
          </Folder>
          <Folder name="jobs">
            <File name="..." type="Python, when selected" />
          </Folder>
          <Folder name="public" />
          <File name="bionicjs.config.ts" type="config" />
          <File name="package.json" />
          <File name="pyproject.toml" type="Python deps" />
        </Folder>
      </Tree>

      <H3 id="app">app - the web application</H3>
      <P>
        The React client. <Code>app/page.tsx</Code> default-exports the page
        component, <Code>app/layout.tsx</Code> wraps every route, and{" "}
        <Code>app/globals.css</Code> holds the Tailwind theme. Routed by the
        file system through <Code>react-router</Code>.
      </P>

      <H3 id="server">server - the Nitro backend</H3>
      <P>
        The Nitro server in TypeScript holds API routes under{" "}
        <Code>server/api/</Code>, with auth and database layers appearing under
        <Code>server/auth/</Code> and <Code>server/db/</Code> when those
        templates are selected. Every handler under <Code>server/api/**</Code>{" "}
        becomes a <Code>POST /api/...</Code> endpoint — the routing and type
        generation are handled internally by the framework.
      </P>
      <CodeBlock file="server/api/health.ts">
{`import { defineEventHandler } from "h3";

export default defineEventHandler(() => ({
  status: "ok",
}));`}
      </CodeBlock>

      <H3 id="ai-jobs">ai and jobs - Python</H3>
      <P>
        Python code that would otherwise be buried in the server lives at the
        top level. <Code>ai/</Code> holds the LLM provider client and the
        capabilities you enabled (agents, RAG, tools, prompts, MCP);{" "}
        <Code>jobs/</Code> holds workers and tasks. The two folders only exist
        when their templates are selected.
      </P>

      <H3 id="config">Config files</H3>
      <P>
        <Code>bionicjs.config.ts</Code> is the single place the framework reads. It
        composes the plugin packages - auth, database, AI, jobs - into the
        project:
      </P>
      <CodeBlock file="bionicjs.config.ts">
{`import { defineConfig } from "@bionicjs/core";
import { betterAuth } from "@bionicjs/better-auth";
import { drizzle } from "@bionicjs/drizzle";
import { anthropic } from "@bionicjs/anthropic";
import { celery } from "@bionicjs/celery";

export default defineConfig({
  auth: betterAuth({ emailAndPassword: { enabled: true } }),
  database: drizzle({ provider: "sqlite", url: "file:./db.sqlite" }),
  ai: anthropic({ model: "claude-sonnet-4-5" }),
  jobs: celery({ broker: "redis://localhost:6379" }),
});`}
      </CodeBlock>

      <H3 id="conventions">Conventions</H3>
      <P>
        The folder structure is the contract. Read a generated project and the
        layout tells you where the web stops and the intelligence begins.{" "}
        <Code>app/</Code> is always the client. <Code>server/</Code> is always
        the backend. <Code>ai/</Code> and <Code>jobs/</Code> are first-class
        Python dimensions, not afterthoughts buried under the server.
      </P>
      <P>
        Provider packages stay independent - each integration (auth, database,
        AI, jobs) is a plugin composed in <Code>bionicjs.config.ts</Code>, not a
        framework abstraction you're locked into.
      </P>
    </>
  ),

  "stack": (
    <>
      <P>
        bionicjs deliberately owns no implementations. Every piece of the stack is
        the real, mature library you would already use - bionicjs composes them, it
        does not reimplement them.
      </P>
      <Table
        head={["Layer", "Technology", "Owned by"]}
        rows={[
          ["Web client", "React 19 + Vite", "TypeScript"],
          ["Routing", "react-router (file-based)", "TypeScript"],
          ["API server", "Nitro + h3", "TypeScript"],
          ["Auth", "Better Auth, Clerk, Firebase, Supabase, WorkOS", "TypeScript"],
          ["Database", "Prisma, Drizzle, Kysely, or raw drivers", "TypeScript"],
          ["AI", "OpenAI, Anthropic, Google, Ollama SDKs", "Python"],
          ["Jobs", "Celery, RQ, or Dramatiq", "Python"],
        ]}
      />

      <H3 id="client">Client - React + Vite</H3>
      <P>
        The client is a standard Vite + React application with Tailwind CSS
        wired in. There is no hidden magic: the generated{" "}
        <Code>vite.config.ts</Code> loads the Tailwind plugin, and the app is
        routed by folder, the way the App Router works in Next.js.
      </P>
      <CodeBlock file="vite.config.ts">
{`import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss()],
});`}
      </CodeBlock>

      <H3 id="server">Server - Nitro</H3>
      <P>
        Nitro runs the API. Routes follow the standard <Code>serve/api/**</Code>{" "}
        convention and are exposed under <Code>/api</Code>, so the client and
        server split cleanly with a thin proxy between them in development.
      </P>

      <H3 id="python">Python - AI and jobs</H3>
      <P>
        Python is a first-class citizen with its own <Code>pyproject.toml</Code>.
        The AI provider hands you the official SDK client, and jobs run under
        the worker you chose. The boundary between TypeScript and Python is
        a typed contract - not a process you have to babysit.
      </P>
    </>
  ),

  "conventions": (
    <>
      <P>
        The folder structure is the contract. Read a generated project and the
        layout tells you where the web stops and the intelligence begins.
      </P>

      <H3 id="app">app/ is the web application</H3>
      <P>
        Everything under <Code>app/</Code> is the client. Routes are folders; a
        <Code>page.tsx</Code> default-exports the component rendered at that
        path. No route table to edit, no config file to keep in sync.
      </P>

      <H3 id="server">server/ is the Nitro server</H3>
      <P>
        Everything under <Code>server/</Code> is the backend - API routes under{" "}
        <Code>server/api/</Code>, plus <Code>auth/</Code> and{" "}
        <Code>db/</Code> when selected. Server-only code never leaks into the
        client bundle.
      </P>

      <H3 id="capabilities">ai/ and jobs/ are first-class</H3>
      <P>
        AI and jobs live at the top level, not buried under{" "}
        <Code>server/</Code>. They are not an afterthought of the web
        framework; they are a dimension the framework is built around. The{" "}
        <Code>pyproject.toml</Code> at the root is their dependency manifest.
      </P>

      <H3 id="independence">Providers stay independent</H3>
      <P>
        Every provider is its own package (<Code>@bionicjs/better-auth</Code>,{" "}
        <Code>@bionicjs/drizzle</Code>, ...). Swap one for another by changing a
        line in <Code>bionicjs.config.ts</Code> - nothing else in your app moves.
      </P>
    </>
  ),

  deployment: (
    <>
      <H3 id="build-output">Build output</H3>
      <P>
        Running <Code>npm run build</Code> produces a single{" "}
        <Code>.output/</Code> directory. Inside it,{" "}
        <Code>server/index.mjs</Code> is the Nitro server (API + SPA
        fallback), and <Code>public/</Code> holds the Vite client assets with
        hashed filenames.
      </P>
      <H3 id="nitro-presets">Nitro presets</H3>
      <P>
        Nitro&apos;s deployment presets carry over unchanged. Set{" "}
        <Code>nitro.preset</Code> in your Nitro config to target any supported
        platform. No bionicjs abstraction needed — it&apos;s standard Nitro.
      </P>
      <H3 id="platforms">Supported platforms</H3>
      <P>
        One build, deploy anywhere. BionicJS uses Nitro under the hood, which means
        you get first-class support for every major deployment target. Set the
        preset in your config and deploy.
      </P>

      <H3 id="platform-vercel">Vercel</H3>
      <P>
        Deploy to Vercel with zero config. Nitro&apos;s Vercel preset handles
        serverless functions, edge middleware, and static asset serving
        automatically. Push to git and Vercel builds and deploys your app.
      </P>
      <CodeBlock>{`// bionicjs.config.ts or nitro.config.ts
export default defineNitroConfig({
  preset: "vercel"
});`}</CodeBlock>

      <H3 id="platform-netlify">Netlify</H3>
      <P>
        Netlify deploys with the <Code>netlify</Code> preset. Edge functions,
        server-side rendering, and form handling all work out of the box. Connect
        your git repo for continuous deployment.
      </P>
      <CodeBlock>{`export default defineNitroConfig({
  preset: "netlify"
});`}</CodeBlock>

      <H3 id="platform-cloudflare">Cloudflare Workers</H3>
      <P>
        Run on Cloudflare&apos;s edge network with the{" "}
        <Code>cloudflare</Code> preset. Your API handlers run as Workers,
        assets go to R2 or KV, and you get sub-millisecond cold starts worldwide.
      </P>
      <CodeBlock>{`export default defineNitroConfig({
  preset: "cloudflare"
});`}</CodeBlock>

      <H3 id="platform-aws">AWS</H3>
      <P>
        Deploy to AWS Lambda, API Gateway, or ECS with the{" "}
        <Code>aws-lambda</Code> or <Code>node-server</Code> preset. BionicJS
        generates a standard Node.js server that runs anywhere — containerize it
        with Docker for ECS or Fargate.
      </P>
      <CodeBlock>{`// For Lambda
export default defineNitroConfig({
  preset: "aws-lambda"
});

// For Docker / ECS
export default defineNitroConfig({
  preset: "node-server"
});`}</CodeBlock>

      <H3 id="platform-deno">Deno Deploy</H3>
      <P>
        Deploy to Deno Deploy with the <Code>deno</Code> preset. Your BionicJS
        server runs on Deno&apos;s edge runtime with native TypeScript support,
        no transpilation step needed.
      </P>
      <CodeBlock>{`export default defineNitroConfig({
  preset: "deno"
});`}</CodeBlock>

      <H3 id="platform-node">Node.js / Docker</H3>
      <P>
        The <Code>node-server</Code> preset builds a standard Node.js server.
        Wrap it in a Dockerfile and deploy to any container platform — Railway,
        Fly.io, Render, your own VPS, or Kubernetes.
      </P>
      <CodeBlock>{`export default defineNitroConfig({
  preset: "node-server"
});`}</CodeBlock>
      <CodeBlock file="Dockerfile">{`FROM node:20-alpine
WORKDIR /app
COPY .output/ ./
EXPOSE 3000
CMD ["node", "server/index.mjs"]`}</CodeBlock>
    </>
  ),

  "ci-cd": (
    <>
      <P>
        Set up continuous integration and delivery for your bionicjs project. GitHub
        Actions, testing, and deployment pipelines.
      </P>
      <Callout>
        This section is coming soon. We&apos;ll cover GitHub Actions workflows,
        testing strategies, and automated deployment pipelines.
      </Callout>
    </>
  ),

  "agentic-integration": (
    <>
      <P>
        Build AI agents that act autonomously — tool calling, MCP integration,
        multi-step workflows, and human-in-the-loop patterns.
      </P>
      <Callout>
        This section is coming soon. We&apos;ll cover agent architectures, tool
        definitions, and how to wire Python agents into your bionicjs app.
      </Callout>
    </>
  ),

  "integrations-overview": (
    <>
      <P>
        Register services once, get typed callers, providers, middleware, and
        database models. bionicjs integrations are plugin packages composed in{" "}
        <Code>bionicjs.config.ts</Code>.
      </P>
      <Callout>
        This section is a work in progress. Full integration guides are coming
        soon.
      </Callout>
    </>
  ),

  "runtime-overview": (
    <>
      <P>
        Cache, observability, cron, and deployment output — the runtime layer
        that sits between your code and the platform.
      </P>
      <Callout>
        This section is coming soon. We&apos;ll cover caching strategies,
        observability, cron jobs, and runtime configuration.
      </Callout>
    </>
  ),

  testing: (
    <>
      <P>
        Unit tests, integration tests, and end-to-end testing for your bionicjs
        project.
      </P>
      <Callout>
        This section is coming soon. We&apos;ll cover testing strategies,
        Vitest setup, and testing auth/database/AI integrations.
      </Callout>
    </>
  ),

  cli: (
    <>
      <P>
        The bionicjs CLI commands: <Code>dev</Code>, <Code>build</Code>, and more.
      </P>
      <Callout>
        This section is coming soon. We&apos;ll document every CLI command and
        flag.
      </Callout>
    </>
  ),

  examples: (
    <>
      <P>
        Example projects demonstrating routing, auth, database, AI, and API
        patterns.
      </P>
      <Callout>
        This section is coming soon. We&apos;ll link to example projects and
        walkthroughs.
      </Callout>
    </>
  ),

  reference: (
    <>
      <P>
        A compact map of the main package exports and where to learn more.
      </P>
      <Callout>
        This section is coming soon. We&apos;ll document every package export
        and API surface.
      </Callout>
    </>
  ),
};
