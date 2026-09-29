"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { TableOfContents } from "@/components/table-of-contents";
import { LEARN_PARTS } from "@/lib/learn";
import { type TocItem } from "@/lib/sections";

function ChapterList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Learn chapters" className="flex flex-col gap-6">
      {LEARN_PARTS.map((part, partIndex) => (
        <div key={part.title}>
          <p className="flex items-center gap-2 px-3 pb-1.5 text-label-12 text-muted-foreground">
            <span className="font-mono text-label-12-mono text-foreground/40">
              {String(partIndex + 1).padStart(2, "0")}
            </span>
            {part.title}
          </p>
          <ul className="relative ml-1 flex flex-col gap-0.5 border-l border-border pl-2">
            {part.chapters.map((chapter) => {
              const href = `/learn/${chapter.slug}`;
              const active = pathname === href;
              return (
                <li key={chapter.slug} className="relative">
                  <div
                    aria-hidden
                    className="absolute left-[-9px] top-[13px] h-px w-2 bg-border"
                  />
                  <Link
                    href={href}
                    onClick={onNavigate}
                    scroll={false}
                    aria-current={active ? "true" : undefined}
                    className={`block rounded-md px-3 py-1.5 text-label-14 transition-colors ${
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {chapter.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <Link
        href="/docs/why-bionicjs"
        className="px-3 text-label-13 text-muted-foreground transition-colors hover:text-foreground"
      >
        Using BionicJS? Read the docs
      </Link>
    </nav>
  );
}

function ChapterToc() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-md-root]");
    if (!root) return;
    const headings = Array.from(root.querySelectorAll<HTMLElement>("h3[id]"));
    const next = headings.map((h) => ({ id: h.id, title: h.textContent ?? "" }));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- headings are only known after mount
    setItems(next);
    if (next.length > 0) setActiveId(next[0]!.id);
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map((t) => t.id);
    function onScroll() {
      let current = ids[0]!;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActiveId(current);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[260px] shrink-0 overflow-y-auto pl-6 pr-2 py-8 xl:block">
      <TableOfContents items={items} activeId={activeId} />
    </aside>
  );
}

export function LearnShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      <SiteHeader />

      <div className="flex lg:pl-4">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[260px] shrink-0 overflow-y-auto overscroll-contain border-border py-8 pr-4 lg:block lg:border-r">
          <ChapterList />
        </aside>

        <div className="min-w-0 flex-1 px-6 pb-24 pt-3 sm:px-12 lg:px-20">
          <div className="mb-8 pt-4 lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 text-label-14 text-muted-foreground transition-colors hover:text-foreground"
            >
              <MenuIcon className="size-4" />
              All chapters
            </button>
          </div>
          <article data-md-root className="mx-auto max-w-3xl py-8 sm:py-12">
            {children}
          </article>
        </div>

        <ChapterToc />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close chapters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-[300px] max-w-[88vw] flex-col border-r border-border bg-background shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="text-label-14 font-semibold">Chapters</span>
              <button
                type="button"
                aria-label="Close chapters"
                onClick={() => setOpen(false)}
                className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-6">
              <ChapterList onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
