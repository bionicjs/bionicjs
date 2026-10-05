export const GITHUB_URL = "https://github.com/bionicjs/bionicjs";

export type TocItem = { id: string; title: string; isChild?: boolean; children?: TocItem[] };

export type SidebarChild = { slug: string; title: string; children?: SidebarChild[] };

export type SectionDef = {
  slug: string;
  title: string;
  group: string;
  intro: string;
  subsections: TocItem[];
  children?: SidebarChild[];
  subcategory?: string;
};

export const DOCS_GROUPS = [
  { title: "Get Started", intro: "What bionicjs is, how to install it, and your first project built in one command." },
  { title: "Concepts", intro: "The core ideas: routing, rendering, data flow, and the stack." },
  { title: "Integrations", intro: "Auth, database, and the composable provider packages." },
  { title: "Runtime", intro: "Cache, observability, cron, and deployment output." },
  { title: "Deployment", intro: "Ship your project to any platform." },
  { title: "CI/CD", intro: "Continuous integration and delivery pipelines." },
  { title: "Agentic Integration", intro: "AI agents, tool calling, and autonomous workflows." },
  { title: "Reference", intro: "Testing, CLI, examples, and package map." },
];

export const DOCS_SECTION_DEFS: SectionDef[] = [
  // ── Get Started ──
  {
    slug: "why-bionicjs",
    title: "Why?",
    group: "Get Started",
    intro:
      "The honest baseline is the glued pair - Next.js plus FastAPI in a monorepo. This page compares bionicjs against the field of fullstack frameworks so you can decide what the boundary is worth.",
    subsections: [
      { id: "the-field", title: "The field at a glance" },
      { id: "vs-next-remix", title: "vs Next.js, Remix, Nuxt, SvelteKit" },
      { id: "vs-wasp", title: "vs Wasp & AdonisJS" },
      { id: "vs-django", title: "vs Django & Rails & Laravel" },
      { id: "vs-glue", title: "vs Next.js + FastAPI" },
      { id: "bottom-line", title: "The bottom line" },
    ],
  },
  {
    slug: "installation",
    title: "Getting Started",
    group: "Get Started",
    intro:
      "Prerequisites, the one-command generator, and what you get on disk. No global installs, no config to write by hand - the CLI composes your project from templates.",
    subsections: [
      { id: "prerequisites", title: "Prerequisites" },
      { id: "create", title: "Create a project" },
      { id: "flags", title: "Choose with flags" },
      { id: "run", title: "Install and run" },
    ],
  },
  {
    slug: "structure",
    title: "Project Structure",
    group: "Get Started",
    intro:
      "A project has three top-level zones, split by runtime rather than by audience: app/ and server/ are yours to edit, ai/ and jobs/ are yours but run in Python, and .bionicjs/ is generated on every dev run. The layout is the contract, so here is why each directory is named the way it is.",
    subsections: [
      { id: "the-three-zones", title: "The three zones" },
      { id: "why-ai-and-jobs-are-at-the-root", title: "Why ai/ and jobs/ are at the root" },
      { id: "why-server-is-named-server", title: "Why server/ is named server/" },
      {
        id: "server-is-yours-and-server-auth-is-a-sibling-of-server-db",
        title: "server/ is yours, and server/auth/ is a sibling of server/db/",
      },
      { id: "bionicjs-generated-and-yours-to-delete", title: ".bionicjs/ is generated, and yours to delete" },
      { id: "bionicjs-config-ts-the-single-config", title: "bionicjs.config.ts is the single config" },
    ],
  },

  // ── Concepts ──
  {
    slug: "layouts-pages",
    title: "Layouts and Pages",
    group: "Concepts",
    subcategory: "Core",
    intro:
      "Every route is a file. app/page.tsx is the index, any app/<name>/page.tsx is a URL, and app/layout.tsx wraps every route. The file system is the router - no manual registration.",
    subsections: [
      { id: "routes", title: "Pages" },
      { id: "layouts", title: "Layouts" },
      { id: "react-router", title: "Under the hood" },
    ],
  },
  {
    slug: "filesystem-routing",
    title: "Filesystem routing",
    group: "Concepts",
    subcategory: "Core",
    intro:
      "Routes are files. bionicjs scans app/ at build time, builds a route tree, and compiles it into a virtual module that React Router consumes. No manual registration.",
    subsections: [
      { id: "the-convention", title: "The convention" },
      { id: "discovery", title: "Build-time discovery" },
      { id: "react-router", title: "virtual:bionicjs-routes & React Router" },
    ],
  },
  {
    slug: "linking-navigating",
    title: "Linking and Navigating",
    group: "Concepts",
    subcategory: "Core",
    intro:
      "Navigation is react-router underneath, with file-based routing on top. Use its Link and useNavigate - client-side, no page reloads, lazy-loaded route segments.",
    subsections: [
      { id: "link", title: "Link" },
      { id: "navigate", title: "Navigate" },
    ],
  },
  {
    slug: "server-client-components",
    title: "Server and Client Components",
    group: "Concepts",
    subcategory: "Core",
    intro:
      "app/ is the client (React, CSR first, SSR planned) and server/ is the backend (Nitro + h3). The boundary is a fixed folder split, not a per-file directive.",
    subsections: [
      { id: "the-split", title: "The split" },
      { id: "client", title: "The client" },
      { id: "server", title: "The server" },
      { id: "python", title: "The Python side" },
    ],
  },
  {
    slug: "the-rpc-boundary",
    title: "The RPC Boundary",
    group: "Concepts",
    subcategory: "Core",
    intro:
      "The typed contract between TypeScript and Python. Call a Python function like a local one - serialization, transport, and types are generated for you.",
    subsections: [
      { id: "communication", title: "Communication" },
      { id: "generation", title: "Generation" },
      { id: "the-contract", title: "The contract" },
    ],
  },
  {
    slug: "fetching-data",
    title: "Fetching Data",
    group: "Concepts",
    subcategory: "Data & APIs",
    intro:
      "Data travels over /api. In development Vite proxies it to Nitro; in production Nitro serves it directly. Python functions are exposed through the generated typed RPC boundary.",
    subsections: [
      { id: "from-client", title: "From the client" },
      { id: "from-server", title: "From the server" },
      { id: "from-python", title: "From Python" },
    ],
  },
  {
    slug: "mutating-data",
    title: "Mutating Data",
    group: "Concepts",
    subcategory: "Data & APIs",
    intro:
      "Forms submit to server/api endpoints where input is validated with Zod before it reaches the database or Python layer. The RPC boundary types the call both ways.",
    subsections: [
      { id: "forms", title: "Forms" },
      { id: "validation", title: "Validation" },
      { id: "to-python", title: "To Python" },
    ],
  },
  {
    slug: "caching",
    title: "Caching",
    group: "Concepts",
    subcategory: "Data & APIs",
    intro:
      "The honest baseline: caching lives where the ecosystem puts it - HTTP caching in Nitro, client caching in React Query - until the framework earns a layer of its own.",
    subsections: [
      { id: "honest", title: "The honest baseline" },
      { id: "http", title: "HTTP caching" },
      { id: "client", title: "Client caching" },
    ],
  },
  {
    slug: "ai-capabilities",
    title: "AI Capabilities",
    group: "Concepts",
    subcategory: "Integrations",
    intro:
      "The ai/ folder is Python. Each module is callable from TypeScript through the generated RPC boundary, and every provider plugin hands you the official SDK client.",
    subsections: [
      { id: "structure", title: "Structure" },
      { id: "providers", title: "Providers" },
      { id: "calling", title: "Calling from the web" },
    ],
  },
  {
    slug: "background-jobs",
    title: "Background Jobs",
    group: "Concepts",
    subcategory: "Integrations",
    intro:
      "The jobs/ folder is Python. Tasks enqueued from TypeScript are executed by a worker process over Redis or RabbitMQ.",
    subsections: [
      { id: "workers", title: "Workers" },
      { id: "flow", title: "The flow" },
      { id: "why-python", title: "Why Python workers" },
    ],
  },

  {
    slug: "bionicjs-config",
    title: "Configuration",
    group: "Get Started",
    intro: "One config file for the whole framework. This chapter covers the plugin-based config - defineConfig composes auth, database, ai, and jobs plugins into the project, and BionicJS turns each into runtime exports (`api` on the client, `auth`/`db`/`ai`/`jobs` on the server).",
    subsections: [
      { id: "the-file", title: "The file" },
      { id: "plugins", title: "Plugins" },
      { id: "defineconfig", title: "defineConfig" },
      { id: "runtime", title: "Runtime exports" },
    ],
  },

  // ── Integrations ──
  {
    slug: "integrations-overview",
    title: "Overview",
    group: "Integrations",
    intro:
      "Register services once, get typed callers, providers, middleware, and database models. bionicjs integrations are plugin packages composed in bionicjs.config.ts.",
    subsections: [],
  },
  {
    slug: "auth",
    title: "Auth",
    group: "Integrations",
    intro:
      "Authentication is TypeScript, under server/auth/. Each provider is a plugin package (@bionicjs/better-auth, @bionicjs/clerk, @bionicjs/firebase, @bionicjs/supabase, @bionicjs/workos) composed in bionicjs.config.ts - pick one.",
    subsections: [
      { id: "providers", title: "Providers" },
      { id: "server-side", title: "Server-side verification" },
      { id: "protecting-routes", title: "Protecting routes" },
      { id: "clerk", title: "Clerk wires the client" },
      { id: "credentials", title: "Credentials" },
    ],
    children: [
      { slug: "auth/better-auth", title: "Better Auth" },
      { slug: "auth/clerk-provider", title: "Clerk" },
      { slug: "auth/firebase-provider", title: "Firebase" },
      { slug: "auth/supabase-provider", title: "Supabase" },
      { slug: "auth/workos-provider", title: "WorkOS" },
    ],
  },
  {
    slug: "database",
    title: "Database",
    group: "Integrations",
    intro:
      "The database layer is a plugin package composed in bionicjs.config.ts. Engine and access layer are chosen independently — Prisma, Drizzle, Kysely, or raw SQL, with SQLite or PostgreSQL.",
    subsections: [
      { id: "matrix", title: "The matrix" },
      { id: "client", title: "The client" },
      { id: "rules", title: "Rules" },
      { id: "loading", title: "Connecting at startup" },
    ],
    children: [
      { slug: "database/prisma-provider", title: "Prisma" },
      { slug: "database/drizzle-provider", title: "Drizzle" },
      { slug: "database/kysely-provider", title: "Kysely" },
      { slug: "database/sql-provider", title: "Raw SQL" },
    ],
  },
  {
    slug: "ai",
    title: "AI",
    group: "Integrations",
    intro:
      "AI capabilities are Python, under ai/. LLM providers are plugin packages (@bionicjs/anthropic, @bionicjs/openai, @bionicjs/google, @bionicjs/ollama) composed in bionicjs.config.ts; agents, RAG, tools, prompts, and MCP are thin, composable starting points.",
    subsections: [
      { id: "llm", title: "LLM providers" },
      { id: "capabilities", title: "Capabilities" },
    ],
    children: [
      { slug: "ai/agents", title: "Agents" },
      { slug: "ai/llm", title: "LLM" },
      { slug: "ai/mcp", title: "MCP" },
      { slug: "ai/prompts", title: "Prompts" },
      { slug: "ai/rag", title: "RAG" },
    ],
  },
  {
    slug: "jobs",
    title: "Jobs",
    group: "Integrations",
    intro:
      "Background jobs are Python. Each system is a plugin package (@bionicjs/celery, @bionicjs/rq, @bionicjs/dramatiq) composed in bionicjs.config.ts, with a broker: Redis or RabbitMQ.",
    subsections: [
      { id: "systems", title: "Job systems" },
      {
        id: "brokers",
        title: "Brokers",
        children: [
          { id: "redis", title: "Redis" },
          { id: "rabbitmq", title: "RabbitMQ" },
        ],
      },
    ],
    children: [
      { slug: "jobs/celery-provider", title: "Celery" },
      { slug: "jobs/rq-provider", title: "RQ" },
      { slug: "jobs/dramatiq-provider", title: "Dramatiq" },
      {
        slug: "jobs/brokers",
        title: "Brokers",
        children: [
          { slug: "jobs/redis-broker", title: "Redis" },
          { slug: "jobs/rabbitmq-broker", title: "RabbitMQ" },
        ],
      },
    ],
  },

  // ── Runtime ──
  {
    slug: "runtime-overview",
    title: "Overview",
    group: "Runtime",
    intro:
      "Cache, observability, cron, and deployment output — the runtime layer that sits between your code and the platform.",
    subsections: [],
  },
  {
    slug: "nitro-h3",
    title: "Nitro & h3",
    group: "Runtime",
    intro:
      "The server that actually answers your requests. Nitro owns the HTTP server, the build, and the deploy presets; h3 is the handler shape your route files are written in. Neither is a bionicjs API — you write plain files and both stay implementation details.",
    subsections: [
      { id: "a-file-is-an-endpoint", title: "A file is an endpoint" },
      { id: "what-each-layer-owns", title: "What each layer owns" },
      { id: "h3-the-handler-shape", title: "h3: the handler shape" },
      { id: "whose-h3-version-is-it", title: "Whose h3 version is it" },
      { id: "programmatic-startup", title: "Programmatic startup" },
      { id: "srcdir-decides-what-gets-scanned", title: "srcDir decides what gets scanned" },
      { id: "the-request-lifecycle", title: "The request lifecycle" },
      { id: "ports-and-the-api-proxy", title: "Ports and the /api proxy" },
      { id: "the-generated-server-interface", title: "The generated server interface" },
      { id: "related", title: "Related" },
    ],
  },
  {
    slug: "hono",
    title: "Hono",
    group: "Runtime",
    intro:
      "Hono is a standards-based web framework, independent of Nitro and h3. bionicjs generates a Hono router and a typed client from your server/api tree — and today that generated router is not mounted. This page explains the idea, the current state, and the open decision.",
    subsections: [
      { id: "what-hono-is", title: "What Hono is" },
      { id: "the-idea-types-without-codegen", title: "The idea: types without codegen" },
      { id: "what-gets-generated", title: "What gets generated" },
      { id: "current-state-not-mounted", title: "Current state: not mounted" },
      { id: "the-hono-integration-in-nitro", title: "The Hono integration in Nitro" },
      { id: "native-typing-in-nitro", title: "Native typing in Nitro" },
      { id: "the-open-decision", title: "The open decision" },
    ],
  },
  {
    slug: "middleware-and-edge",
    title: "Middleware & Edge",
    group: "Runtime",
    intro:
      "Middleware runs in the Nitro server with h3's middleware shape: intercept requests, check auth, and attach context before the route handler - and deploy the whole server layer to the edge unchanged.",
    subsections: [
      { id: "middleware", title: "Middleware" },
      { id: "request-lifecycle", title: "Request lifecycle" },
      { id: "edge", title: "Edge" },
    ],
  },

  // ── Deployment ──
  {
    slug: "deployment",
    title: "Overview",
    group: "Deployment",
    intro:
      "bionicjs projects build to a standard .output/ directory via Nitro. One build, deploy anywhere — Node.js, Cloudflare Workers, Vercel, Deno, or Bun. Nitro presets carry over unchanged.",
    subsections: [
      { id: "build-output", title: "Build output" },
      { id: "nitro-presets", title: "Nitro presets" },
      { id: "platforms", title: "Supported platforms", children: [
        { id: "platform-vercel", title: "Vercel" },
        { id: "platform-netlify", title: "Netlify" },
        { id: "platform-cloudflare", title: "Cloudflare Workers" },
        { id: "platform-deno", title: "Deno Deploy" },
        { id: "platform-flyio", title: "Fly.io" },
        { id: "platform-railway", title: "Railway" },
        { id: "platform-render", title: "Render" },
        { id: "platform-aws", title: "AWS Lambda" },
        { id: "platform-node", title: "Node.js / Docker" },
      ]},
    ],
    children: [
      { slug: "deployment/vercel", title: "Vercel" },
      { slug: "deployment/netlify", title: "Netlify" },
      { slug: "deployment/cloudflare", title: "Cloudflare" },
      { slug: "deployment/deno-deploy", title: "Deno Deploy" },
      { slug: "deployment/flyio", title: "Fly.io" },
      { slug: "deployment/railway", title: "Railway" },
      { slug: "deployment/render", title: "Render" },
      { slug: "deployment/aws-lambda", title: "AWS Lambda" },
    ],
  },

  // ── CI/CD ──
  {
    slug: "ci-cd",
    title: "Overview",
    group: "CI/CD",
    intro:
      "Set up continuous integration and delivery for your bionicjs project. GitHub Actions, testing, and deployment pipelines.",
    subsections: [],
  },

  // ── Agentic Integration ──
  {
    slug: "agentic-integration",
    title: "Overview",
    group: "Agentic Integration",
    intro:
      "Build AI agents that act autonomously — tool calling, MCP integration, multi-step workflows, and human-in-the-loop patterns.",
    subsections: [],
  },

  // ── Reference ──
  {
    slug: "stack",
    title: "The stack",
    group: "Reference",
    intro:
      "Established tools, no bionicjs abstractions: React and Vite for the client, Nitro for the server, and Python with the mature libraries for AI and jobs.",
    subsections: [
      { id: "established-tools-no-abstractions", title: "Established tools, no abstractions" },
      { id: "client-react-vite", title: "Client - React + Vite" },
      { id: "server-nitro-h3", title: "Server - Nitro + h3" },
      { id: "hono-the-generated-client-not-the-server", title: "Hono - the generated client, not the server" },
      { id: "python-ai-and-jobs", title: "Python - AI and jobs" },
      { id: "why-this-combination", title: "Why this combination" },
      { id: "how-this-compares", title: "How this compares" },
    ],
  },
  {
    slug: "testing",
    title: "Testing",
    group: "Reference",
    intro:
      "Unit tests, integration tests, and end-to-end testing for your bionicjs project.",
    subsections: [],
  },
  {
    slug: "cli",
    title: "CLI",
    group: "Reference",
    intro:
      "The bionicjs CLI commands: dev, build, and more.",
    subsections: [],
  },
  {
    slug: "examples",
    title: "Examples",
    group: "Reference",
    intro:
      "Example projects demonstrating routing, auth, database, AI, and API patterns.",
    subsections: [],
  },
  {
    slug: "reference",
    title: "Package Reference",
    group: "Reference",
    intro:
      "A compact map of the main package exports and where to learn more.",
    subsections: [],
  },
];

export type NavItem = { title: string; href: string; isChild?: boolean; children?: NavItem[] };
export type NavGroup = { title: string; items: NavItem[] };

export function buildNav(groups: { title: string; intro: string }[], defs: SectionDef[]): NavGroup[] {
  // Collect all slugs that appear as children of any section
  const childSlugs = new Set<string>();
  function collectChildSlugs(children?: SidebarChild[]) {
    for (const c of children ?? []) {
      childSlugs.add(c.slug);
      collectChildSlugs(c.children);
    }
  }
  for (const s of defs) {
    collectChildSlugs(s.children);
  }

  return groups.map((group) => {
    const groupDefs = defs
      .filter((s) => s.group === group.title && !childSlugs.has(s.slug));

    // Check if any section in this group has subcategories
    const hasSubcategories = groupDefs.some((s) => s.subcategory);

    if (!hasSubcategories) {
      // No subcategories — flat list (original behavior)
      return {
        title: group.title,
        items: groupDefs.flatMap((s) => {
          const main = { title: s.title, href: `/docs/${s.slug}` };
          const kids = (s.children ?? []).map((c) => {
            const item: NavItem = {
              title: c.title,
              href: `/docs/${c.slug}`,
              isChild: true as const,
            };
            if (c.children && c.children.length > 0) {
              item.children = c.children.map((gc) => ({
                title: gc.title,
                href: `/docs/${gc.slug}`,
                isChild: true as const,
              }));
            }
            return item;
          });
          return [main, ...kids];
        }),
      };
    }

    // Group by subcategory
    const subcategoryMap = new Map<string, SectionDef[]>();
    for (const s of groupDefs) {
      const sub = s.subcategory ?? "Other";
      if (!subcategoryMap.has(sub)) {
        subcategoryMap.set(sub, []);
      }
      subcategoryMap.get(sub)!.push(s);
    }

    const items: NavItem[] = [];
    for (const [subcategory, sections] of subcategoryMap) {
      if (subcategory === "Other") {
        for (const s of sections) {
          const item: NavItem = {
            title: s.title,
            href: `/docs/${s.slug}`,
          };
          if (s.children && s.children.length > 0) {
            item.children = s.children.map((c) => {
              const kid: NavItem = {
                title: c.title,
                href: `/docs/${c.slug}`,
                isChild: true as const,
              };
              if (c.children && c.children.length > 0) {
                kid.children = c.children.map((gc) => ({
                  title: gc.title,
                  href: `/docs/${gc.slug}`,
                  isChild: true as const,
                }));
              }
              return kid;
            });
          }
          items.push(item);
        }
      } else {
        const children: NavItem[] = sections.flatMap((s) => {
          const main = { title: s.title, href: `/docs/${s.slug}`, isChild: true as const };
          const kids = (s.children ?? []).map((c) => {
            const item: NavItem = {
              title: c.title,
              href: `/docs/${c.slug}`,
              isChild: true as const,
            };
            if (c.children && c.children.length > 0) {
              item.children = c.children.map((gc) => ({
                title: gc.title,
                href: `/docs/${gc.slug}`,
                isChild: true as const,
              }));
            }
            return item;
          });
          return [main, ...kids];
        });

        items.push({
          title: subcategory,
          href: "",
          children,
        });
      }
    }

    return { title: group.title, items };
  }).filter((group) => group.items.length > 0);
}

export const DOCS_NAV: NavGroup[] = buildNav(DOCS_GROUPS, DOCS_SECTION_DEFS);

export const SECTIONS: { id: string; title: string }[] = DOCS_SECTION_DEFS.map(
  (s) => ({ id: s.slug, title: s.title })
);

/** Flat list of all child/grandchild SectionDef-compatible objects. */
function buildChildDefs(defs: SectionDef[]): SectionDef[] {
  const out: SectionDef[] = [];
  function walk(
    children: SidebarChild[],
    group: string,
    parentTitle?: string
  ) {
    for (const c of children) {
      out.push({
        slug: c.slug,
        title: c.title,
        group,
        intro: "",
        subsections: [],
        // Breadcrumb context: only for pages nested deeper than one level.
        ...(parentTitle ? { subcategory: parentTitle } : {}),
      });
      if (c.children) walk(c.children, group, c.title);
    }
  }
  for (const s of defs) {
    // Breadcrumb context only under a real section title; "Overview" index
    // pages don't add a crumb above their children.
    if (s.children) walk(s.children, s.group, s.title === "Overview" ? undefined : s.title);
  }
  return out;
}

export const CHILD_DEFS: SectionDef[] = buildChildDefs(DOCS_SECTION_DEFS);

/** All routable sections (parent + child pages). */
export function sectionsFor(_type: "docs" | "all" = "all"): SectionDef[] {
  return [...DOCS_SECTION_DEFS, ...CHILD_DEFS];
}

export function getSection(slug: string): SectionDef | undefined {
  return DOCS_SECTION_DEFS.find((s) => s.slug === slug)
    ?? CHILD_DEFS.find((s) => s.slug === slug);
}

export function getAdjacent(
  slug: string,
  _type: "docs" | "all" = "all"
): {
  prev?: SectionDef;
  next?: SectionDef;
} {
  const all = [...DOCS_SECTION_DEFS, ...CHILD_DEFS];
  const index = all.findIndex((s) => s.slug === slug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? all[index - 1] : undefined,
    next: index < all.length - 1 ? all[index + 1] : undefined,
  };
}
