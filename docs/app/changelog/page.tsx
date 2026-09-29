import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { LandingFooter } from "@/components/landing-footer";

export const metadata: Metadata = {
  title: "Changelog · BionicJS",
  description:
    "Every BionicJS package queued for its first publish.",
};

const VERSION = "0.1.0";

type Pkg = { name: string; role: string; group: string };

const PACKAGES: Pkg[] = [
  { name: "bionicjs", role: "Framework core: config, routing, runtime exports", group: "Core" },
  { name: "create-bionicjs-app", role: "Project generator and template composer", group: "Core" },
  { name: "@bionicjs/dev", role: "Vite + Nitro development server and codegen", group: "Core" },
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

export default function ChangelogPage() {
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
              v{VERSION} · packages
            </p>
            <h1 className="text-heading-48 mt-4 max-w-3xl">
              Packages to be published
            </h1>
            <p className="text-copy-16 mt-5 max-w-2xl text-muted-foreground">
              The v{VERSION} wave is prepared and queued for its first npm
              publish. Framework core, the generator, the dev server, and every
              provider package ship together — nothing is held back.
            </p>
          </div>
        </section>

        {GROUP_ORDER.map((group) => {
          const packages = PACKAGES.filter((p) => p.group === group);
          return (
            <section key={group} className="border-b border-border">
              <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-heading-20">{group}</h2>
                  <span className="font-mono text-label-12-mono text-muted-foreground">
                    {packages.length} {packages.length === 1 ? "package" : "packages"}
                  </span>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.name}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:border-foreground/20 hover:bg-muted/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-label-13-mono text-foreground">
                          {pkg.name}
                        </span>
                        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-label-12-mono text-muted-foreground">
                          {VERSION}
                        </span>
                      </div>
                      <p className="text-copy-13 text-muted-foreground">{pkg.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </main>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
