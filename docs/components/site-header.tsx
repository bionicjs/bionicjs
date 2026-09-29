"use client";

import { useState } from "react";
import Link from "next/link";
import { CommandMenu } from "@/components/command-menu";
import { HeaderNav, MobileNavLinks } from "@/components/header-nav";
import { HeaderSearchButton } from "@/components/header-search-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useGitHubStars } from "@/components/use-github-stars";
import {
  CloseIcon,
  GithubIcon,
  LogoIcon,
  MenuIcon,
  SearchIcon,
} from "@/components/icons";
import { DOCS_NAV, GITHUB_URL } from "@/lib/sections";

export function SiteHeader({ className = "" }: { className?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const stars = useGitHubStars();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className={`relative flex h-14 items-center gap-2 px-4 sm:px-6 lg:px-8 ${className}`}>
        <Link
          href="/"
          aria-label="bionicjs home"
          className="flex shrink-0 items-center gap-2"
        >
          <LogoIcon className="size-6" />
          <span className="text-label-16 font-semibold">bionicjs</span>
        </Link>

        <HeaderNav className="ml-4 hidden items-center gap-5 md:flex" />

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <HeaderSearchButton
              onClick={() => setMenuOpen(true)}
              className="hidden md:inline-flex"
            />

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={`bionicjs on GitHub - ${stars ?? 0} stars`}
              title="bionicjs on GitHub"
              className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <GithubIcon className="size-5" />
              <span className="hidden font-mono text-label-12-mono sm:inline">
                {stars ?? "—"}
              </span>
            </a>

            <ThemeSwitcher small />
          </div>

          <div className="flex items-center gap-2.5 md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Search documentation"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <SearchIcon className="size-4" />
            </button>
            <ThemeSwitcher small />
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {mobileOpen ? <CloseIcon className="size-4" /> : <MenuIcon className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Site sections"
          className="fixed inset-0 z-50 flex flex-col bg-background md:hidden"
        >
          <div className="flex h-14 items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <LogoIcon className="size-6" />
              <span className="text-label-16 font-semibold">bionicjs</span>
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <CloseIcon className="size-4" />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-1 px-2 pb-6 sm:px-4">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setMenuOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-3 text-left text-label-14 text-muted-foreground"
            >
              <SearchIcon className="size-4" />
              <span>Search the docs…</span>
              <span className="ml-auto" aria-hidden>
                <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-label-12-mono">
                  ⌘K
                </kbd>
              </span>
            </button>
            <MobileNavLinks onNavigate={() => setMobileOpen(false)} />
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-copy-20 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <GithubIcon className="size-5" />
              GitHub
              <span className="ml-auto font-mono text-label-12-mono">
                {stars ?? "—"}
              </span>
            </a>
          </div>
        </nav>
      )}

      <CommandMenu nav={DOCS_NAV} open={menuOpen} onOpenChange={setMenuOpen} />
    </header>
  );
}