"use client";

import { useState } from "react";
import type { ReactNode, SVGProps } from "react";

import Link from "next/link";
import Image from "next/image";

import { SiteHeader } from "@/components/site-header";
import { Browser } from "@/components/browser";
import { HeroDoodle } from "@/components/hero-doodle";
import { BorderBeam } from "border-beam";
import {
  PythonLogo,
  SparkleIcon,
  JobsIcon,
  KeyIcon,
  DatabaseIcon,
  CloudIcon,
} from "@/components/icons";
import { LandingFooter } from "@/components/landing-footer";
import { Next as NextIcon, Nuxt as NuxtIcon, Svelte as SvelteIcon } from "@react-symbols/icons";

const CREATE_COMMAND = "npx create-bionicjs-app@latest";

const FEATURES: {
  index: string;
  label: string;
  status: "ships" | "direction";
  copy: string;
  icon: ReactNode;
}[] = [
    {
      index: "01.1",
      label: "Drop-in auth",
      status: "ships",
      icon: <KeyIcon className="size-5" />,
      copy: "Better Auth, Clerk, Firebase, Supabase, or WorkOS. Server code and client wiring land ready, waiting only for your keys.",
    },
    {
      index: "01.2",
      label: "Database, wired",
      status: "ships",
      icon: <DatabaseIcon className="size-5" />,
      copy: "SQLite or PostgreSQL behind Prisma, Drizzle, Kysely, or the raw driver you prefer - a working client and schema from day one.",
    },
    {
      index: "01.3",
      label: "AI, ready in a module",
      status: "ships",
      icon: <SparkleIcon className="size-5" />,
      copy: "OpenAI, Anthropic, Google Gemini, or Ollama as flat modules that hand you the official SDK client - plus agents, RAG, tools, prompts, and MCP.",
    },
    {
      index: "01.4",
      label: "Jobs, first task ready",
      status: "ships",
      icon: <JobsIcon className="size-5" />,
      copy: "Celery, RQ, or Dramatiq with a Redis or RabbitMQ broker. You get a queue and a task that already connects.",
    },
    {
      index: "01.5",
      label: "Python where it belongs",
      status: "ships",
      icon: <PythonLogo className="size-5" />,
      copy: "AI and jobs live at the top level - ai/ and jobs/ - never buried under the server, never an afterthought.",
    },
    {
      index: "01.6",
      label: "Deploy anywhere",
      status: "direction",
      icon: <CloudIcon className="size-5" />,
      copy: "Nitro presets for Node.js and Docker, Vercel, Netlify, Cloudflare Workers, Deno Deploy, and AWS Lambda. One build, one config, deploy where you want.",
    },
  ];

// Only brands present on the SimpleIcons CDN sign a real mark; the rest fall
// back to a letter badge so the strip never renders a broken image.
const BRAND_ICONS = new Set([
  "betterauth",
  "clerk",
  "firebase",
  "supabase",
  "prisma",
  "drizzle",
  "sqlite",
  "postgresql",
  "anthropic",
  "googlegemini",
  "ollama",
  "celery",
  "redis",
  "rabbitmq",
  "nodedotjs",
  "vercel",
  "netlify",
  "cloudflare",
  "deno",
  "flydotio",
  "railway",
  "render",
]);

const INTEGRATIONS: { name: string; icon?: string; url: string }[] = [
  { name: "Better Auth", icon: "betterauth", url: "https://better-auth.com" },
  { name: "Clerk", icon: "clerk", url: "https://clerk.com" },
  { name: "Firebase", icon: "firebase", url: "https://firebase.google.com" },
  { name: "Supabase", icon: "supabase", url: "https://supabase.com" },
  { name: "WorkOS", url: "https://workos.com" },
  { name: "Prisma", icon: "prisma", url: "https://prisma.io" },
  { name: "Drizzle", icon: "drizzle", url: "https://orm.drizzle.team" },
  { name: "Kysely", url: "https://kysely.dev" },
  { name: "SQLite", icon: "sqlite", url: "https://sqlite.org" },
  { name: "PostgreSQL", icon: "postgresql", url: "https://postgresql.org" },
  { name: "OpenAI", url: "https://openai.com" },
  { name: "Anthropic", icon: "anthropic", url: "https://anthropic.com" },
  { name: "Gemini", icon: "googlegemini", url: "https://ai.google.dev" },
  { name: "Ollama", icon: "ollama", url: "https://ollama.com" },
  { name: "Celery", icon: "celery", url: "https://docs.celeryq.dev" },
  { name: "RQ", url: "https://python-rq.org" },
  { name: "Dramatiq", url: "https://dramatiq.io" },
  { name: "Redis", icon: "redis", url: "https://redis.io" },
  { name: "RabbitMQ", icon: "rabbitmq", url: "https://rabbitmq.com" },
];

const DEPLOY_TARGETS: { name: string; href: string; icon?: string }[] = [
  { name: "Node.js / Docker", href: "/docs/deployment", icon: "nodedotjs" },
  { name: "Vercel", href: "/docs/deployment/vercel", icon: "vercel" },
  { name: "Netlify", href: "/docs/deployment/netlify", icon: "netlify" },
  { name: "Cloudflare", href: "/docs/deployment/cloudflare", icon: "cloudflare" },
  { name: "Deno Deploy", href: "/docs/deployment/deno-deploy", icon: "deno" },
  { name: "Fly.io", href: "/docs/deployment/flyio", icon: "flydotio" },
  { name: "Railway", href: "/docs/deployment/railway", icon: "railway" },
  { name: "Render", href: "/docs/deployment/render", icon: "render" },
  { name: "AWS Lambda", href: "/docs/deployment/aws-lambda", icon: "awslambda" },
];

function CommandButton() {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={`Copy ${CREATE_COMMAND} to clipboard`}
      onClick={() => {
        void navigator.clipboard?.writeText(CREATE_COMMAND);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
      className="group inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 font-mono text-label-13-mono text-foreground transition-all hover:border-foreground/30 hover:bg-muted"
    >
      <span aria-hidden className="text-muted-foreground">
        $
      </span>
      {CREATE_COMMAND}
      <span aria-hidden className="ml-1 inline-flex text-muted-foreground">
        {copied ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : (
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1 0 2 .9 2 2" />
          </svg>
        )}
      </span>
    </button>
  );
}

function IndexLabel({
  index,
  label,
  tone = "default",
}: {
  index: string;
  label: string;
  tone?: "default" | "onDark";
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-label-12-mono uppercase tracking-[0.12em] ${
        tone === "onDark" ? "text-white/50" : "text-muted-foreground"
      }`}
    >
      <span className={tone === "onDark" ? "text-white/30" : "text-foreground/40"}>
        {index}
      </span>
      <span aria-hidden className="opacity-30">
        /
      </span>
      <span>{label}</span>
    </span>
  );
}

function SectionHeader({
  index,
  eyebrow,
  title,
  body,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  body?: string;
}) {
  return (
    <div>
      <IndexLabel index={index} label={eyebrow} />
      <h2 className="text-heading-32 mt-4">{title}</h2>
      {body && (
        <p className="text-copy-16 mt-3 max-w-2xl text-muted-foreground">{body}</p>
      )}
    </div>
  );
}

export default function HomePage() {
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
            <main className="relative">
          <div className="grid gap-20 pb-28 sm:gap-32">
            <section className="relative overflow-hidden">
            <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-14 py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20 lg:py-28">
              <div className="w-full max-w-2xl">
                  <IndexLabel
                    index="00"
                    label="TypeScript web, Python intelligence"
                  />
                  <h1 className="text-heading-40 mt-6 max-w-2xl">
                    The full-stack framework for building{" "}
                    <strong>intelligent</strong> web apps
                  </h1>
                  <p className="text-copy-16 mt-4 max-w-2xl text-muted-foreground">
                    TypeScript runs the web surface, Python runs the
                    intelligence. Routing, auth, database, AI, and jobs - wired
                    together by one config.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <BorderBeam
                      size="sm"
                      colorVariant="colorful"
                      strength={0.85}
                      borderRadius={8}
                      className="rounded-lg"
                    >
                      <Link
                        href="/docs/installation"
                        className="inline-flex h-8 items-center justify-center rounded-lg bg-foreground px-3 text-button-14 text-background transition hover:bg-foreground/90 active:translate-y-px"
                      >
                        Get started
                      </Link>
                    </BorderBeam>
                    <CommandButton />
                  </div>

                  <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-label-12-mono uppercase tracking-[0.12em] text-muted-foreground">
                    {["React + Vite", "Nitro server", "Python ai/ jobs"].map(
                      (token, i) => (
                        <span key={token} className="flex items-center gap-3">
                          {i > 0 && <span aria-hidden className="opacity-30">/</span>}
                          <span className="transition-colors hover:text-foreground">{token}</span>
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <HeroDoodle />
              </div>

              <div className="border-t border-border pb-10 pt-8">
                <p className="mb-6 text-center text-copy-14 text-muted-foreground">
                  Plays well with the stack you already use.
                </p>
                <div
                  className="marquee-mask min-w-0 overflow-hidden"
                  role="region"
                  aria-label="Integration partners"
                >
                  <div className="animate-marquee flex w-max gap-2 py-1">
                    {INTEGRATIONS.map((integration) => (
                      <StackTile key={integration.name} integration={integration} />
                    ))}
                    {INTEGRATIONS.map((integration) => (
                      <StackTile key={`dup-${integration.name}`} integration={integration} hidden />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

        <section className="line-t relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="reveal">
              <SectionHeader
                index="01"
                eyebrow="What you get"
                title={
                  <>
                    Everything <strong>wired.</strong>
                  </>
                }
                body="Real libraries, composed through one config. Each capability is a thin plugin package - pick what your project needs, ignore the rest."
              />

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.label}
                  className="group flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-5 transition-colors duration-200 hover:border-foreground/20 hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      aria-hidden
                      className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors duration-200 group-hover:border-foreground/20 group-hover:text-foreground"
                    >
                      {feature.icon}
                    </span>
                    <StatusChip status={feature.status} />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-label-14 mt-1">{feature.label}</h3>
                    <span className="font-mono text-label-12-mono text-muted-foreground/50">
                      {feature.index}
                    </span>
                  </div>
                  <p className="text-copy-13 text-muted-foreground">{feature.copy}</p>
                </div>
              ))}
            </div>
          </div>
          </div>
        </section>

        <section className="line-t relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="reveal">
              <SectionHeader
                index="02"
                eyebrow="One config"
              title={
                <>
                  Everything in <strong>one file.</strong>
                </>
              }
              body="The same config composes auth, database, AI, and jobs. Flip the framework on the right and see what the alternative looks like."
            />
            <div className="mt-10">
              <ComparisonBlock />
            </div>
          </div>
          </div>
        </section>

        <section className="line-t relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="reveal">
              <SectionHeader
                index="03"
                eyebrow="Deploy anywhere"
              title={
                <>
                  One build, <strong>any platform.</strong>
                </>
              }
              body="The build contract is one .output/ directory. Point any supported target at it and ship."
            />
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DEPLOY_TARGETS.map((target) => (
                <Link
                  key={target.name}
                  href={target.href}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4 transition-colors duration-200 hover:border-foreground/20 hover:bg-muted/40"
                >
                  <IntegrationMark name={target.name} icon={target.icon} />
                  <div className="min-w-0">
                    <p className="truncate text-label-14">{target.name}</p>
                    <p className="mt-0.5 font-mono text-label-12-mono text-muted-foreground">
                      /docs/{target.href.replace("/docs/", "")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          </div>
        </section>

          </div>
            </main>
          </div>
        </div>

      <LandingFooter />
    </div>
  );
}

function StackTile({
  integration,
  hidden,
  tone = "default",
}: {
  integration: { name: string; icon?: string; url: string };
  hidden?: boolean;
  tone?: "default" | "dark";
}) {
  return (
    <a
      href={integration.url}
      target="_blank"
      rel="noreferrer"
      aria-hidden={hidden ? true : undefined}
      tabIndex={hidden ? -1 : undefined}
      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-label-12-mono transition-colors ${
        tone === "dark"
          ? "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white"
          : "border-border bg-muted/20 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      }`}
    >
      {integration.icon ? (
        <IntegrationMark name={integration.name} icon={integration.icon} tone={tone} />
      ) : (
        <IntegrationMark name={integration.name} tone={tone} />
      )}
      {integration.name}
    </a>
  );
}

function StatusChip({ status }: { status: "ships" | "direction" }) {
  const ships = status === "ships";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${ships
        ? "border-accent/40 text-accent"
        : "border-amber-500/30 text-amber-600 dark:text-amber-400"
        }`}
    >
      <span
        aria-hidden
        className={`size-1.5 rounded-full ${ships ? "bg-accent" : "bg-amber-500"
          }`}
      />
      {ships ? "ships" : "direction"}
    </span>
  );
}

function IntegrationMark({
  icon,
  tone = "default",
}: {
  name: string;
  icon?: string;
  tone?: "default" | "dark";
}) {
  if (icon && BRAND_ICONS.has(icon)) {
    return (
      <Image
        src={`https://cdn.simpleicons.org/${icon}/9ca3af`}
        alt=""
        width="14"
        height="14"
        unoptimized
        className="size-3.5 shrink-0"
      />
    );
  }

  if (icon === "awslambda") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        fill="#9ca3af"
        className="size-3.5 shrink-0"
      >
        <path d="M4.9855 0c-.2941.0031-.5335.2466-.534.5482L4.446 5.456c0 .1451.06.2835.159.3891a.5322.5322 0 0 0 .3806.1562h3.4282l8.197 17.6805a.5365.5365 0 0 0 .4885.3181h5.811c.2969 0 .5426-.2448.5426-.5482V18.544c0-.3035-.2392-.5482-.5425-.5482h-2.0138L12.7394.3153C12.647.124 12.4564 0 12.2452 0h-7.254Zm.5397 1.0907h6.3678l8.16 17.6804a.5365.5365 0 0 0 .4885.3181h1.8178v3.8173H17.437L9.2402 5.226a.536.536 0 0 0-.4885-.318H5.5223Zm2.0137 8.2366c-.2098.0011-.3937.1193-.4857.3096L.6002 23.2133a.5506.5506 0 0 0 .0313.5282.5334.5334 0 0 0 .4544.25h6.169a.5468.5468 0 0 0 .497-.3096l3.38-7.166a.5405.5405 0 0 0-.0029-.4686L8.036 9.637a.5468.5468 0 0 0-.4942-.3096Zm.0057 1.8036 2.488 5.1522-3.1214 6.6206H1.9465Z" />
      </svg>
    );
  }

  return (
    <span
      aria-hidden
      className={`size-1.5 shrink-0 rounded-full ${
        tone === "dark" ? "bg-white/40" : "bg-muted-foreground/40"
      }`}
    />
  );
}

const VERCEL_KEYWORDS = new Set([
  "import",
  "from",
  "export",
  "default",
  "const",
]);

function highlightVercel(code: string): string {
  const out: string[] = [];
  let i = 0;
  const len = code.length;

  while (i < len) {
    const ch = code[i]!;

    if (ch === '"' || ch === "'" || ch === "`") {
      let j = i + 1;
      while (j < len && code[j] !== ch) j++;
      j++;
      out.push(`<span style="color:var(--code-string)">${escHtml(code.slice(i, j))}</span>`);
      i = j;
      continue;
    }

    if (/[a-zA-Z_$]/.test(ch)) {
      let j = i;
      while (j < len && /[a-zA-Z0-9_$]/.test(code[j]!)) j++;
      const word = code.slice(i, j);

      let k = j;
      while (k < len && code[k] === " ") k++;
      let m = j;
      while (m < len && code[m] === " ") m++;

      if (VERCEL_KEYWORDS.has(word)) {
        out.push(`<span style="color:var(--code-keyword)">${word}</span>`);
      } else if (code[k] === "(") {
        out.push(`<span style="color:var(--code-fn)">${word}</span>`);
      } else if (code[m] === ":") {
        out.push(`<span style="color:var(--code-type)">${word}</span>`);
      } else {
        out.push(`<span style="color:var(--code-fg)">${word}</span>`);
      }
      i = j;
      continue;
    }

    if ("{}[]()".includes(ch)) {
      out.push(`<span style="color:var(--code-punct)">${ch}</span>`);
      i++;
      continue;
    }

    if (",;:".includes(ch)) {
      out.push(`<span style="color:var(--code-punct)">${ch}</span>`);
      i++;
      continue;
    }

    out.push(escHtml(ch));
    i++;
  }

  return out.join("");
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const COMPARISONS = [
  {
    feature: "Everything in one config",
    bionicjs: {
      file: "bionicjs.config.ts",
      code: `import { defineConfig } from "@bionicjs/core";
import { betterAuth } from "@bionicjs/better-auth";   // auth
import { prisma } from "@bionicjs/prisma";             // database
import { anthropic } from "@bionicjs/anthropic";        // ai
import { celery } from "@bionicjs/celery";              // jobs

export default defineConfig({
  auth: betterAuth({ emailAndPassword: { enabled: true }, socialProviders: { github: { clientId, clientSecret } } }),
  database: prisma({ provider: "postgresql", url: env("DATABASE_URL") }),
  ai: anthropic({ model: "claude-sonnet-4-5", agents: true, rag: true }),
  jobs: celery({ broker: "redis://localhost:6379" }),
});`,
    },
    nextjs: {
      file: "middleware.ts + lib/db.ts",
      code: `// ── auth ──
import { clerkMiddleware } from "@clerk/nextjs/server";
export default clerkMiddleware({
  publicRoutes: ["/", "/sign-in"],
});

// ── database ──
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

// ── ai ──
import OpenAI from "openai";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── jobs ──
// No built-in — manual BullMQ or custom worker`,
    },
    nuxt: {
      file: "nuxt.config.ts + server/utils/db.ts",
      code: `// ── auth ──
export default defineNuxtConfig({
  modules: ["@sidebase/nuxt-auth"],
  auth: {
    provider: {
      type: "authjs",
      providers: { github({ clientId, clientSecret }) {} },
    },
  },
});

// ── database ──
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// ── ai ──
// No built-in — manual OpenAI SDK in server/api/chat.post.ts

// ── jobs ──
// No built-in — custom BullMQ worker`,
    },
    sveltekit: {
      file: "src/hooks.server.ts + src/lib/server/db.ts",
      code: `// ── auth ──
import { SvelteKitAuth } from "@auth/sveltekit";
import GitHub from "@auth/core/providers/github";
export const handle = SvelteKitAuth({
  providers: [GitHub({ clientId, clientSecret })],
});

// ── database ──
import { PrismaClient } from "@prisma/client";
import { env } from "$env/dynamic/private";
const client = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } });
export const db = client;

// ── ai ──
// No built-in — manual OpenAI SDK in src/routes/api/chat/+server.ts

// ── jobs ──
// No built-in — custom worker`,
    },
    tanstack: {
      file: "multiple files",
      code: `// ── auth ──
// Manual Better Auth or Auth.js setup
// providers: [GitHub({ clientId, clientSecret })]

// ── database ──
// Manual Prisma or Drizzle client
// import { PrismaClient } from "@prisma/client"

// ── ai ──
// Manual OpenAI / Anthropic SDK
// import OpenAI from "openai"

// ── jobs ──
// No built-in — custom BullMQ or pg-boss`,
    },
    remix: {
      file: "app/root.tsx + app/lib/db.server.ts",
      code: `// ── auth ──
// Manual session + cookie strategy
// import { sessionStorage } from "~/services/session.server";

// ── database ──
import { PrismaClient } from "@prisma/client";
let db: PrismaClient;
declare global { var db: PrismaClient }
if (!global.db) global.db = new PrismaClient();
db = global.db;

// ── ai ──
// No built-in — manual OpenAI SDK calls

// ── jobs ──
// No built-in — custom BullMQ worker`,
    },
    rails: {
      file: "Gemfile + config/database.yml",
      code: `# ── auth ──
gem "devise"

# ── database ──
# ActiveRecord (built-in)
# config/database.yml:
#   development:
#     adapter: sqlite3
#     database: db/development.sqlite3

# ── ai ──
gem "openai"

# ── jobs ──
# Active Job (built-in)
# app/jobs/`,
    },
    adonisjs: {
      file: "start/routes.ts + app/services",
      code: `// ── auth ──
// @adonisjs/auth starter kit
// import router from "@adonisjs/core/services/router";

// ── database ──
// Lucid ORM (built-in)
// import db from "@adonisjs/lucid/services/db";

// ── ai ──
// Manual openai npm package

// ── jobs ──
// @adonisjs/queue
// import { QueueManager } from "@adonisjs/queue";`,
    },
    wasp: {
      file: "main.wasp",
      code: `app myApp {
  auth: {
    userEntity: User,
    methods: [Email],
  },
  dependencies: [ ("@prisma/client", "5.10.0") ],
}

// ── database ──
// Prisma (auto-generated from entities)

// ── ai ──
// No built-in — manual setup

// ── jobs ──
// Built-in task system
// import { Task } from "wasp/server/jobs";`,
    },
  },
];

function BionicJSLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="18 18 46 40" fill="none" {...props}>
      <path
        d="M36 24 A14 14 0 0 0 36 52"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M36 24 H48 V52 H36" stroke="#0891B2" strokeWidth="6" strokeLinejoin="miter" />
      <path d="M48 38 H54" stroke="#0891B2" strokeWidth="6" />
      <circle cx="58" cy="38" r="4.5" fill="#0891B2" />
    </svg>
  );
}

function NextjsLogo(props: SVGProps<SVGSVGElement>) {
  return <NextIcon {...props} />;
}

function NuxtLogo(props: SVGProps<SVGSVGElement>) {
  return <NuxtIcon {...props} />;
}

function SvelteLogo(props: SVGProps<SVGSVGElement>) {
  return <SvelteIcon {...props} />;
}

function TanstackLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0c6.627 0 9.166 4.102 9.166 12S18.626 24 12 24s-9.166-4.096-9.166-12c0-7.898 2.54-12 9.166-12m3.031 17.485c-.861 0-1.33.234-1.708.423-.327.164-.582.292-1.148.292-.567 0-.822-.128-1.148-.292-.378-.189-.848-.423-1.71-.423-.86 0-1.33.234-1.708.423-.327.164-.581.292-1.148.292v1.251c.862 0 1.331-.234 1.709-.423.326-.163.581-.292 1.148-.292s.821.129 1.148.292c.378.189.847.423 1.709.423.861 0 1.33-.234 1.709-.423.326-.163.58-.292 1.147-.292s.822.129 1.148.292c.378.189.848.423 1.71.423v-1.25c-.565 0-.822-.13-1.149-.293-.377-.189-.847-.423-1.709-.423m.41-12.536c.65-.586 0-1.648-.813-1.328-.45.18-.873.438-1.251.779a4.2 4.2 0 0 0-1.202 1.94 4.2 4.2 0 0 0-1.203-1.94 4.3 4.3 0 0 0-1.25-.779c-.814-.32-1.463.742-.814 1.328l2.385 2.153a4.86 4.86 0 0 0-2.731-.839c-.552 0-1.082.09-1.58.26-.836.284-.604 1.532.275 1.532h3.326a4.2 4.2 0 0 0-2.012.988 4 4 0 0 0-.9 1.165c-.403.776.588 1.529 1.237.948l2.686-2.42-.2 6.656c0 .08-.047.158-.107.223a5 5 0 0 1-.257-.123c-.378-.189-.848-.423-1.71-.423-.861 0-1.33.234-1.708.423-.327.164-.581.292-1.148.292v1.251c.861 0 1.33-.234 1.709-.423.326-.164.58-.292 1.148-.292.566 0 .821.128 1.148.292.377.189.847.423 1.708.423.862 0 1.332-.234 1.71-.423.326-.164.58-.292 1.147-.292s.822.128 1.148.292c.378.189.848.423 1.71.423v-1.25c-.565 0-.822-.13-1.149-.293v-.005c-.378-.19-.847-.424-1.709-.424-.861 0-1.33.235-1.709.424-.097.045-.189.094-.283.131a.34.34 0 0 1-.12-.232l-.2-6.69 2.722 2.457c.65.587 1.64-.166 1.236-.948a4.11 4.11 0 0 0-2.911-2.153h3.326c.882 0 1.108-1.245.275-1.531a4.88 4.88 0 0 0-4.311.578l2.385-2.152z" />
    </svg>
  );
}

function RemixLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.856 10.303c.086.554.144 1.125.144 1.697 0 4.226-3.372 7.64-7.544 7.64-2.83 0-5.308-1.44-6.83-3.64l7.764-3.326c.036-.015.072-.03.102-.048.12-.072.24-.15.354-.234.018-.012.036-.024.054-.036l.006-.006c.42-.24.72-.582.888-.972.018-.042.03-.084.042-.126.012-.042.018-.09.018-.138 0-.096-.024-.186-.066-.27l-1.566-3.402c-.066-.144-.156-.276-.27-.396a2.13 2.13 0 00-.396-.27l-3.402-1.566c-.084-.042-.174-.066-.27-.066-.048 0-.096.006-.138.018-.042.012-.084.03-.126.042-.39.168-.732.468-.972.888-.012.018-.024.036-.036.054-.072.114-.15.234-.234.354-.015.03-.03.066-.048.102L5.654 18.85c-1.65-2.158-2.628-4.884-2.628-7.746 0-4.226 3.372-7.64 7.544-7.64 2.83 0 5.308 1.44 6.83 3.64l-7.764 3.326c-.552.24-1.008.648-1.308 1.164a2.868 2.868 0 00-.312 1.308c0 .39.096.762.27 1.092l1.566 3.402c.144.336.336.636.576.888.24.24.54.432.888.576l3.402 1.566c.33.174.702.27 1.092.27.456 0 .894-.108 1.308-.312.516-.3.924-.756 1.164-1.308l3.326-7.764c2.2 1.522 3.64 3.996 3.64 6.83 0 2.862-.978 5.586-2.628 7.746L21.856 10.303z" />
    </svg>
  );
}

function RailsLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M.741 19.365h8.36s-1.598-7.291 3.693-10.243l.134-.066c1.286-.637 4.907-2.431 10.702 1.854.19-.159.37-.286.37-.286s-5.503-5.492-11.63-4.878c-3.079.275-6.867 3.079-9.09 6.783C1.058 16.233.741 19.365.741 19.365Zm8.804-.783a10.682 10.682 0 0 1-.127-1.333l1.143.412c.063.498.159.963.254 1.376l-1.27-.455Zm-7.799-4.317L.529 13.82c-.201.455-.423.984-.529 1.27l1.217.444c.137-.359.36-.878.529-1.269Zm7.831.296.857.677c.042-.413.116-.825.222-1.238l-.762-.603c-.137.391-.233.783-.317 1.164Zm2.042-2.646-.508-.762c.191-.243.413-.486.656-.709l.476.72a5.958 5.958 0 0 0-.624.751ZM4.19 8.878l.752.656c-.254.265-.498.551-.72.836l-.815-.698c.244-.265.508-.529.783-.794Zm9.799 1.027-.243-.73c.265-.117.571-.233.931-.339l.233.698a6.82 6.82 0 0 0-.921.371Zm3.122-.656.042-.667c.339.021.688.064 1.048.138l-.042.656a5.859 5.859 0 0 0-1.048-.127ZM8.942 6.392l-.476-.731c-.265.138-.54.286-.826.455l.487.741c.275-.169.54-.328.815-.465Zm9.217-.053.042-.709c-.095-.053-.36-.18-1.026-.371l-.043.699c.349.116.688.243 1.027.381ZM13.238 5.28h.106l-.212-.645c-.328 0-.666.021-1.016.063l.201.625a8.87 8.87 0 0 1 .921-.043Z" />
    </svg>
  );
}

function AdonisLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M0 12c0 9.68 2.32 12 12 12s12-2.32 12-12S21.68 0 12 0 0 2.32 0 12Zm4.84 2.492 3.762-8.555C9.238 4.498 10.46 3.716 12 3.716c1.54 0 2.762.781 3.398 2.223l3.762 8.554c.172.418.32.953.32 1.418 0 2.125-1.492 3.617-3.617 3.617-.726 0-1.3-.183-1.883-.37-.597-.192-1.203-.387-1.98-.387-.77 0-1.39.195-1.996.386-.59.188-1.168.371-1.867.371-2.125 0-3.617-1.492-3.617-3.617 0-.465.148-1 .32-1.418ZM12 7.43l-3.715 8.406c1.102-.512 2.371-.758 3.715-.758 1.297 0 2.613.246 3.664.758Z" />
    </svg>
  );
}

function WaspLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.15 3.06c-.55 0-1.1.07-1.64.21-.22.06-.44.13-.65.21C12.66 4.1 11.48 5 10.52 6.14c-1.07 1.28-1.7 2.8-2.08 4.39-.38 1.59-.52 3.26-.52 4.94v.09c0 1.68.14 3.35.52 4.94.38 1.59 1.01 3.11 2.08 4.39.96 1.14 2.14 2.04 3.34 2.87.22.15.44.29.65.44.54.14 1.09.21 1.64.21s1.1-.07 1.64-.21c.22-.15.44-.29.65-.44 1.2-.83 2.38-1.73 3.34-2.87 1.07-1.28 1.7-2.8 2.08-4.39.38-1.59.52-3.26.52-4.94v-.09c0-1.68-.14-3.35-.52-4.94-.38-1.59-1.01-3.11-2.08-4.39C19.93 5 18.75 4.1 17.79 3.27c-.22-.08-.44-.15-.65-.21-.54-.14-1.09-.21-1.64-.21h.65zM12 7.43l-3.715 8.406c1.102-.512 2.371-.758 3.715-.758 1.297 0 2.613.246 3.664.758Z" />
    </svg>
  );
}

const FRAMEWORKS = [
  { key: "bionicjs", label: "bionicjs", url: "https://bionicjs.vercel.app", Logo: BionicJSLogo },
  { key: "nextjs", label: "Next.js", url: "https://nextjs.org", Logo: NextjsLogo },
  { key: "nuxt", label: "Nuxt", url: "https://nuxt.com", Logo: NuxtLogo },
  { key: "sveltekit", label: "SvelteKit", url: "https://kit.svelte.dev", Logo: SvelteLogo },
  { key: "tanstack", label: "TanStack Start", url: "https://tanstack.com/start", Logo: TanstackLogo },
  { key: "remix", label: "Remix", url: "https://remix.run", Logo: RemixLogo },
  { key: "rails", label: "Rails", url: "https://rubyonrails.org", Logo: RailsLogo },
  { key: "adonisjs", label: "AdonisJS", url: "https://adonisjs.com", Logo: AdonisLogo },
  { key: "wasp", label: "Wasp", url: "https://wasp-lang.dev", Logo: WaspLogo },
] as const;

type FrameworkKey = (typeof FRAMEWORKS)[number]["key"];

function ComparisonBlock() {
  const [activeFramework, setActiveFramework] = useState<FrameworkKey>("nextjs");

  const comparison = COMPARISONS[0];
  const otherCode = comparison[activeFramework];
  const bionicjsCode = comparison.bionicjs;
  const bionicjsFramework = FRAMEWORKS.find((f) => f.key === "bionicjs")!;

  return (
    <div className="w-full">
      <BorderBeam
        size="md"
        colorVariant="colorful"
        strength={0.6}
        duration={7}
        borderRadius={12}
        className="rounded-xl"
      >
        <Browser address="bionicjs.dev" url="https://bionicjs.dev">
        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border" style={{ background: "var(--code-bg)" }}>
          {/* Left Pane: BionicJS */}
          <div className="flex flex-col overflow-hidden">
            {/* BionicJS Tab Header */}
            <div className="flex items-center border-b px-4 py-2" style={{ borderColor: "var(--code-border)", minHeight: "45px" }}>
              <div className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-muted text-foreground">
                <bionicjsFramework.Logo className="size-3.5" />
                {bionicjsFramework.label}
              </div>
            </div>

            {/* File Path */}
            <div className="flex items-center px-4 py-2 font-mono text-[11px]" style={{ backgroundColor: "rgba(0,0,0,0.15)", color: "var(--code-header-fg)" }}>
              <span>{bionicjsCode.file}</span>
            </div>

            <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-[1.7]" style={{ color: "var(--code-fg)", minHeight: "380px" }}>
              <code dangerouslySetInnerHTML={{ __html: highlightVercel(bionicjsCode.code) }} />
            </pre>
          </div>

          {/* Right Pane: Other Framework */}
          <div className="flex flex-col overflow-hidden">
            {/* Framework Selector Header */}
            <div className="flex items-center gap-1 border-b px-4 py-2 overflow-x-auto" style={{ borderColor: "var(--code-border)", minHeight: "45px" }}>
              {FRAMEWORKS.filter((f) => f.key !== "bionicjs").map((f) => {
                const Logo = f.Logo;
                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveFramework(f.key)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${activeFramework === f.key
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    title={f.label}
                  >
                    <Logo className="size-3.5" />
                    <span className="hidden sm:inline-block">{f.label}</span>
                  </button>
                );
              })}
            </div>

            {/* File Path */}
            <div className="flex items-center px-4 py-2 font-mono text-[11px]" style={{ backgroundColor: "rgba(0,0,0,0.15)", color: "var(--code-header-fg)" }}>
              <span>{otherCode.file}</span>
            </div>

            <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-[1.7]" style={{ color: "var(--code-fg)", minHeight: "380px" }}>
              <code dangerouslySetInnerHTML={{ __html: highlightVercel(otherCode.code) }} />
            </pre>
          </div>
        </div>
      </Browser>
      </BorderBeam>
    </div>
  );
}