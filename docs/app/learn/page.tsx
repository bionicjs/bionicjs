import type { Metadata } from "next";
import Link from "next/link";
import { LearnShell } from "@/components/learn-shell";
import { ArrowRightIcon, GithubIcon, TerminalIcon } from "@/components/icons";
import { LEARN_PARTS, LEARN_CHAPTERS } from "@/lib/learn";
import { GITHUB_URL } from "@/lib/sections";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "How BionicJS works under the hood - the routing engine, the build, the server runtime, and the Python bridge. For people building and contributing to the framework.",
};

export default function LearnIntroPage() {
  return (
    <LearnShell>
      <div className="flex items-center gap-1.5 font-mono text-label-12-mono uppercase tracking-[0.12em] text-muted-foreground">
        <TerminalIcon className="size-3.5" />
        Learn / Internals
      </div>

      <h1 className="text-heading-48 mt-3">Build BionicJS, not just with it</h1>

      <p className="text-copy-18 mt-5 max-w-2xl text-muted-foreground">
        The docs teach you how to use the framework. This guide is the other
        side: how it is put together - the parser, the build, the server, and
        the typed bridge to Python - written for people reading, debugging, and
        contributing to the source.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href={`/learn/${LEARN_CHAPTERS[0]!.slug}`}
          className="inline-flex h-8 items-center justify-center rounded-lg bg-foreground px-3 text-button-14 text-background transition hover:bg-foreground/80 active:translate-y-px"
        >
          Start with {LEARN_CHAPTERS[0]!.title}
        </Link>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-button-14 text-muted-foreground transition-colors hover:text-foreground"
        >
          <GithubIcon className="size-4" />
          Read the source
        </a>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {LEARN_PARTS.map((part, index) => (
          <section
            key={part.title}
            className="flex flex-col rounded-xl border border-border bg-muted/20 p-5"
          >
            <p className="flex items-baseline gap-2 font-mono text-label-12-mono uppercase tracking-[0.12em] text-muted-foreground">
              <span className="text-foreground/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              {part.title}
            </p>
            <p className="mt-2 text-copy-13 text-muted-foreground">{part.blurb}</p>
            <ul className="mt-4 space-y-1">
              {part.chapters.map((chapter) => (
                <li key={chapter.slug}>
                  <Link
                    href={`/learn/${chapter.slug}`}
                    className="group flex items-center gap-1.5 py-0.5 text-label-14 text-foreground/85 transition-colors hover:text-foreground"
                  >
                    <span className="-translate-x-0.5 transition-transform group-hover:translate-x-0">
                      {chapter.title}
                    </span>
                    <ArrowRightIcon className="size-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-xl border border-dashed border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-copy-14 text-muted-foreground">
          Using BionicJS in a project? The user guide is the place to start.
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link
            href="/docs/why-bionicjs"
            className="text-label-14 text-foreground underline-offset-4 hover:underline"
          >
            Read the docs
          </Link>
          <Link
            href="/docs/installation"
            className="text-label-14 text-muted-foreground transition-colors hover:text-foreground"
          >
            Quick start
          </Link>
        </div>
      </div>
    </LearnShell>
  );
}