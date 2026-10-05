"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GITHUB_URL } from "@/lib/sections";

const NAV: { label: string; href: string; match: string }[] = [
  { label: "Docs", href: "/docs/why-bionicjs", match: "/docs" },
  { label: "Learn", href: "/learn/why-a-meta-framework", match: "/learn" },
  { label: "Blog", href: "/blog", match: "/blog" },
  { label: "Changelog", href: "/changelog", match: "/changelog" },
];

function linkClass(active: boolean) {
  return `text-label-14 transition-colors ${
    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
  }`;
}

export function HeaderNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={className ?? "hidden items-center gap-6 md:flex"}
    >
      {NAV.map((item) => {
        const active = pathname.startsWith(item.match);
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={linkClass(active)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const links = [
    { label: "Docs", href: "/docs/why-bionicjs", match: "/docs", external: false },
    { label: "Learn", href: "/learn/why-a-meta-framework", match: "/learn", external: false },
    { label: "Blog", href: "/blog", match: "/blog", external: false },
    { label: "Changelog", href: "/changelog", match: "/changelog", external: false },
    {
      label: "Releases",
      href: `${GITHUB_URL}/releases`,
      match: "",
      external: true,
    },
  ];

  return (
    <div className="flex flex-col gap-1">
      {links.map((item) => {
        const active = !item.external && pathname.startsWith(item.match);
        const cls = `rounded-lg px-3 py-2 text-copy-20 transition-colors ${
          active
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`;
        return item.external ? (
          <a
            key={item.label}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            onClick={onNavigate}
            className={cls}
          >
            {item.label}
          </a>
        ) : (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            className={cls}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
