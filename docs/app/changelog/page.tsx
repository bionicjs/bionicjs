import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { LandingFooter } from "@/components/landing-footer";

export const metadata: Metadata = {
  title: "Changelog · BionicJS",
  description:
    "Release notes for every BionicJS package: what shipped, what broke, and what is still open.",
};

const CURRENT_VERSION = "0.2.0";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** One line of a release, optionally prefixed by the package it belongs to. */
type Entry = { scope?: string; text: string };

type Group = {
  label: string;
  /** Breaking is the only group that gets a warning tone. */
  breaking?: boolean;
  entries: Entry[];
};

type Release = {
  version: string;
  date: string;
  summary: string;
  /** Everything before this tag, for the GitHub compare link. */
  compareFrom?: string;
  groups: Group[];
};

const RELEASES: Release[] = [
  {
    version: "0.2.0",
    date: "2026-10-05",
    compareFrom: "v0.1.0",
    summary:
      "The release where the framework stopped lying about its own shape. Nitro and h3 serve every request, the generated Hono client is marked as unmounted, and the dev server is the package that owns the CLI. Every endpoint 404ing silently is fixed.",
    groups: [
      {
        label: "Breaking",
        breaking: true,
        entries: [
          {
            scope: "@bionicjs/core",
            text: "no longer depends on @bionicjs/dev. The bionicjs CLI and runDevServer moved to @bionicjs/dev, which depends on core. Import runDevServer from @bionicjs/dev.",
          },
          {
            text: "A scaffolded app no longer contains vite.config.ts, nitro.config.ts or index.html, and its package.json exposes one script (dev) and one devDependency (@bionicjs/dev). vite, nitropack, @vitejs/plugin-react and @tailwindcss/vite are no longer listed as app dependencies.",
          },
          {
            text: "The scaffolded package.json no longer carries h3 2.0.1-rc.31. It is pinned to ^1.15.11, the range nitropack resolves, so there is exactly one h3 in the tree.",
          },
        ],
      },
      {
        label: "Fixed",
        entries: [
          {
            scope: "@bionicjs/dev",
            text: "Nitro was created with its default srcDir, which scans ./api at the project root. Every route in server/api/ 404ed, and neither package reported it. srcDir is now the server directory, and public/ is passed as an explicit publicAssets entry.",
          },
          {
            scope: "@bionicjs/dev",
            text: "loadConfig used jiti's synchronous loader, which transpiles the config's import graph to CJS. Any ESM-only dependency reachable from bionicjs.config.ts died on import.meta. The asynchronous loader is used instead.",
          },
          {
            scope: "@bionicjs/dev",
            text: "jiti's interopDefault wrapper was read as a config object, so every plugin was skipped and .bionicjs/server.ts came out empty. A config that throws now fails loudly instead of producing an empty server module.",
          },
          {
            scope: "@bionicjs/dev",
            text: "The generated .bionicjs/hono.ts and server.ts were written with literal backslash-n sequences instead of newlines, and the RPC generator imported modules with a .ts extension.",
          },
          {
            scope: "create-bionicjs-app",
            text: "workspace:* survived into the generated package.json, including @bionicjs/dev in devDependencies, which is invalid outside the monorepo. No scaffolded app could run an install. The protocol is now resolved across every dependency field.",
          },
          {
            scope: "create-bionicjs-app",
            text: "Scaffolded apps shipped no .gitignore. npm strips dotfiles from published tarballs, so the template's .gitignore never arrived; the template file is now gitignore and is renamed on copy.",
          },
          {
            scope: "@bionicjs/core",
            text: "The Vite e2e test resolved its paths through process.cwd(), so it only worked from the repo root.",
          },
        ],
      },
      {
        label: "Added",
        entries: [
          {
            scope: "create-bionicjs-app",
            text: "installs dependencies, pins the package manager through the corepack packageManager field, and initialises a git repository with one commit. --skip-install and --disable-git opt out.",
          },
          {
            scope: "@bionicjs/dev",
            text: "registers the Tailwind Vite plugin, since the base template's globals.css imports it and there is no user-owned Vite config to register it in.",
          },
          {
            scope: "@bionicjs/dev",
            text: "exports resolveNitroConfig, the side-effect-free resolution of the app layout and Nitro options, and runDevServer now accepts ports and returns a handle with close().",
          },
          {
            scope: "tests",
            text: "a Nitro + Vite integration test over a fixture app, and unit tests for package manager detection, the corepack field, and git initialisation.",
          },
        ],
      },
      {
        label: "Docs",
        entries: [
          {
            text: "New reference pages: Nitro & h3 for the live request path, and Hono for the generated client and the open design decision.",
          },
          {
            text: "A blog at /blog, with five posts on the internals, including a postmortem on the two copies of h3.",
          },
          {
            text: "Three new Learn chapters: how meta-frameworks work, Nitro and h3, and Hono and the RPC contract.",
          },
          {
            text: "The structure page is rebuilt around three zones, and the READMEs and ARCHITECTURE.md now say that Nitro and h3 serve requests and that the generated Hono router is not mounted.",
          },
        ],
      },
      {
        label: "Internal",
        entries: [
          {
            text: "pnpm check:cycles, which fails on a circular workspace graph now that ignoreWorkspaceCycles is gone.",
          },
          {
            text: "pnpm check:docs, which checks curated tables of contents against real headings and blog files against the blog registry.",
          },
        ],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-09-29",
    summary:
      "The first publish. The workspace is renamed from tspy to bionicjs, and the core, the generator, the dev server, and all sixteen provider packages ship together.",
    groups: [
      {
        label: "Breaking",
        breaking: true,
        entries: [
          {
            text: "Package names, npm scope, and the CLI command all change. Nothing was published under the old names, so no deprecation window was needed.",
          },
          {
            scope: "@bionicjs/core",
            text: "was published as @tspy/core.",
          },
        ],
      },
      {
        label: "Added",
        entries: [
          {
            text: "19 packages at 0.1.0: @bionicjs/core, @bionicjs/dev, create-bionicjs-app, and the auth, database, AI, and jobs integrations.",
          },
          {
            text: "Filesystem routing from app/, an h3 API surface at server/api/, and a Python runtime for ai/ and jobs/ reached over the RPC boundary.",
          },
        ],
      },
    ],
  },
];

type Pkg = { name: string; role: string; group: string };

const PACKAGES: Pkg[] = [
  { name: "@bionicjs/core", role: "Framework core: config, routing, runtime exports", group: "Core" },
  { name: "@bionicjs/dev", role: "Vite + Nitro development server, codegen, and the bionicjs CLI", group: "Core" },
  { name: "create-bionicjs-app", role: "Project generator and template composer", group: "Core" },
  { name: "@bionicjs/better-auth", role: "Auth provider", group: "Auth" },
  { name: "@bionicjs/clerk", role: "Auth provider", group: "Auth" },
  { name: "@bionicjs/firebase", role: "Auth provider", group: "Auth" },
  { name: "@bionicjs/supabase", role: "Auth provider", group: "Auth" },
  { name: "@bionicjs/workos", role: "Auth provider", group: "Auth" },
  { name: "@bionicjs/prisma", role: "Database client", group: "Database" },
  { name: "@bionicjs/drizzle", role: "Database client", group: "Database" },
  { name: "@bionicjs/kysely", role: "Database client", group: "Database" },
  { name: "@bionicjs/sql", role: "Raw SQL client", group: "Database" },
  { name: "@bionicjs/anthropic", role: "LLM provider", group: "AI" },
  { name: "@bionicjs/openai", role: "LLM provider", group: "AI" },
  { name: "@bionicjs/google", role: "LLM provider", group: "AI" },
  { name: "@bionicjs/ollama", role: "LLM provider, local", group: "AI" },
  { name: "@bionicjs/celery", role: "Job system", group: "Jobs" },
  { name: "@bionicjs/rq", role: "Job system", group: "Jobs" },
  { name: "@bionicjs/dramatiq", role: "Job system", group: "Jobs" },
];

const GROUP_ORDER = ["Core", "Auth", "Database", "AI", "Jobs"];

function GroupBlock({ group }: { group: Group }) {
  return (
    <div className="border-t border-border py-6 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        <h3 className="shrink-0 md:w-32 md:pt-1">
          <span
            className={`font-mono text-label-12-mono uppercase tracking-[0.12em] ${
              group.breaking ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
            }`}
          >
            {group.label}
          </span>
        </h3>
        <ul className="flex min-w-0 flex-col gap-3">
          {group.entries.map((entry, index) => (
            <li key={`${group.label}-${index}`} className="text-copy-16 text-muted-foreground">
              {entry.scope && (
                <>
                  <span className="font-mono text-label-13-mono text-foreground">{entry.scope}</span>{" "}
                </>
              )}
              {entry.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ChangelogPage() {
  const latest = RELEASES[0];

  return (
    <div className="max-w-screen overflow-x-hidden">
      <div className="grid min-h-dvh grid-cols-1 justify-center [--gutter-width:2rem] sm:[--gutter-width:2.5rem] md:grid-cols-[var(--gutter-width)_minmax(0,80rem)_var(--gutter-width)]">
        <div
          aria-hidden
          className="diagonal-stripes col-start-1 row-span-full hidden border-x border-border [--pattern-fg:rgba(10,10,14,0.05)] md:block dark:[--pattern-fg:rgba(233,233,240,0.06)]"
        />
        <div
          aria-hidden
          className="diagonal-stripes col-start-3 row-span-full hidden border-x border-border [--pattern-fg:rgba(10,10,14,0.05)] md:block dark:[--pattern-fg:rgba(233,233,240,0.06)]"
        />
        <div className="col-start-1 md:col-start-2">
          <SiteHeader />

          <main className="w-full flex-1 pb-24">
            <section className="border-b border-border">
              <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <p className="font-mono text-label-12-mono uppercase tracking-[0.12em] text-muted-foreground">
                  Changelog
                </p>
                <h1 className="text-heading-48 mt-4 max-w-3xl">
                  What changed, and what broke
                </h1>
                <p className="text-copy-16 mt-5 max-w-2xl text-muted-foreground">
                  Every public package shares one version, so one release is one
                  set of notes. The breaking changes are called out, because the
                  framework is young enough that there is no deprecation window.
                </p>

                <nav aria-label="Versions" className="mt-10 flex flex-wrap gap-2">
                  {RELEASES.map((release, index) => (
                    <a
                      key={release.version}
                      href={`#v${release.version}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 font-mono text-label-12-mono transition-colors hover:border-foreground/20 hover:bg-muted"
                    >
                      <span className="text-foreground">v{release.version}</span>
                      <span className="text-muted-foreground">{formatDate(release.date)}</span>
                      {index === 0 && (
                        <span className="rounded-full border border-accent/40 px-1.5 py-px text-accent">
                          latest
                        </span>
                      )}
                    </a>
                  ))}
                </nav>
              </div>
            </section>

            {RELEASES.map((release, index) => (
              <section
                key={release.version}
                id={`v${release.version}`}
                className="scroll-mt-24 border-b border-border"
              >
                <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <h2 className="text-heading-32">v{release.version}</h2>
                    <time dateTime={release.date} className="font-mono text-label-13-mono text-muted-foreground">
                      {formatDate(release.date)}
                    </time>
                    {index === 0 && (
                      <span className="rounded-full border border-accent/40 px-2 py-0.5 font-mono text-label-12-mono text-accent">
                        latest
                      </span>
                    )}
                    {release.compareFrom && (
                      <a
                        href={`https://github.com/bionicjs/bionicjs/compare/${release.compareFrom}...v${release.version}`}
                        className="font-mono text-label-13-mono text-muted-foreground underline underline-offset-4 hover:text-foreground"
                      >
                        compare
                      </a>
                    )}
                  </div>

                  <p className="text-copy-16 mt-4 max-w-3xl text-muted-foreground">{release.summary}</p>

                  <div className="mt-8 flex flex-col">
                    {release.groups.map((group) => (
                      <GroupBlock key={group.label} group={group} />
                    ))}
                  </div>
                </div>
              </section>
            ))}

            <section className="border-b border-border">
              <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-heading-20">Packages at v{CURRENT_VERSION}</h2>
                  <span className="font-mono text-label-12-mono text-muted-foreground">
                    {PACKAGES.length} packages
                  </span>
                </div>
                <p className="text-copy-16 mt-4 max-w-3xl text-muted-foreground">
                  Every package is published at {CURRENT_VERSION}. The workspace
                  root is private and is never published.
                </p>

                {GROUP_ORDER.map((group) => {
                  const packages = PACKAGES.filter((p) => p.group === group);
                  return (
                    <div key={group} className="mt-8">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="font-mono text-label-12-mono uppercase tracking-[0.12em] text-muted-foreground">
                          {group}
                        </h3>
                        <span className="font-mono text-label-12-mono text-muted-foreground">
                          {packages.length} {packages.length === 1 ? "package" : "packages"}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {packages.map((pkg) => (
                          <div
                            key={pkg.name}
                            className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-4"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-label-13-mono text-foreground">
                                {pkg.name}
                              </span>
                              <span className="rounded-full border border-border px-2 py-0.5 font-mono text-label-12-mono text-muted-foreground">
                                {CURRENT_VERSION}
                              </span>
                            </div>
                            <p className="text-copy-13 text-muted-foreground">{pkg.role}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}