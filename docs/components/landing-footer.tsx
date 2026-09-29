import Link from "next/link";
import { LogoIcon } from "@/components/icons";
import { GITHUB_URL } from "@/lib/sections";

function FooterColumn({
  title,
  links,
  external,
}: {
  title: string;
  links: { label: string; href: string }[];
  external?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-label-12-mono uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            {external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="text-copy-14 text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-copy-14 text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="line-t relative">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <LogoIcon className="size-8" />
              <span className="text-label-18">bionicjs</span>
            </div>
            <p className="mt-4 max-w-xs text-copy-14 leading-6 text-muted-foreground">
              The fullstack framework for the web and its intelligence.
            </p>
          </div>
          <FooterColumn
            title="Get started"
            links={[
              { label: "Docs", href: "/docs/why-bionicjs" },
              { label: "Quick start", href: "/docs/installation" },
            ]}
          />
          <FooterColumn
            title="Templates"
            links={[
              { label: "Auth", href: "/docs/auth" },
              { label: "Database", href: "/docs/database" },
              { label: "AI (Python)", href: "/docs/ai" },
              { label: "Jobs (Python)", href: "/docs/jobs" },
            ]}
          />
          <FooterColumn
            title="Project"
            external
            links={[{ label: "GitHub", href: GITHUB_URL }]}
          />
        </div>
      </div>
      <div className="line-t relative">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-4 py-6 text-label-13 text-muted-foreground sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} bionicjs · MIT License</p>
          <a
            href="https://github.com/bionicjs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <LogoIcon className="size-4" />
            Built by Atnatewos
          </a>
        </div>
      </div>
    </footer>
  );
}