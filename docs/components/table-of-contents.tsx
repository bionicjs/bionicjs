"use client";

import { useState } from "react";
import {
  ArrowUpIcon,
  ChatBubbleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  GithubIcon,
} from "@/components/icons";
import { GITHUB_URL, type TocItem } from "@/lib/sections";

function blockToMarkdown(el: HTMLElement): string | null {
  const tag = el.tagName;
  const text = () => el.innerText.replace(/\s+/g, " ").trim();
  if (el.classList.contains("mt-12")) return null;
  if (tag === "H1") return `# ${text()}`;
  if (tag === "H2") return `## ${text()}`;
  if (tag === "H3") return `### ${text()}`;
  if (tag === "H4") return `#### ${text()}`;
  if (tag === "P") {
    const t = text();
    return t ? t : null;
  }
  if (tag === "PRE") return `\`\`\`\n${el.textContent?.trim()}\n\`\`\``;
  if (tag === "FIG") return `\`\`\`\n${el.textContent?.trim()}\n\`\`\``;
  if (tag === "TABLE") {
    const rows = Array.from(el.querySelectorAll("tr")).map((tr) =>
      Array.from(tr.children)
        .map((c) =>
          (c as HTMLElement).textContent?.trim().replace(/\|/g, "\\|") ?? ""
        )
        .join(" | ")
    );
    if (rows.length === 0) return null;
    const header = rows[0];
    const separator = header.split(" | ").map(() => "---").join(" | ");
    return [header, separator, ...rows.slice(1)].join("\n");
  }
  if (tag === "OL") {
    const items = Array.from(el.querySelectorAll(":scope > li"));
    if (items.length === 0) return null;
    return items
      .map((li, i) => `${i + 1}. ${(li as HTMLElement).innerText.trim()}`)
      .join("\n");
  }
  if (tag === "UL") {
    const items = Array.from(el.querySelectorAll(":scope > li"));
    if (items.length === 0) return null;
    return items
      .map((li) => `- ${(li as HTMLElement).innerText.trim()}`)
      .join("\n");
  }
  if (tag === "DIV" && el.querySelector(":scope > span")) {
    const icon = Array.from(el.querySelectorAll(":scope > span")).find(
      (s) => s.textContent === "\u24D8"
    );
    if (icon) {
      const body = Array.from(el.children).find((c) => c.tagName === "DIV");
      const quote = body?.textContent?.trim();
      return quote ? `> ${quote.replace(/\s+/g, " ")}` : null;
    }
  }
  return null;
}

function markdownFromDocs(): string {
  const root = document.querySelector<HTMLElement>("[data-md-root]");
  if (!root) return "";
  const blocks: string[] = [];
  function walk(node: HTMLElement) {
    for (const el of Array.from(node.children) as HTMLElement[]) {
      const md = blockToMarkdown(el);
      if (md) {
        blocks.push(md);
      } else if (el.tagName === "DIV") {
        walk(el);
      }
    }
  }
  walk(root);
  return blocks.filter(Boolean).join("\n\n");
}

const AGENTS = [
  { name: "General agent", hint: "Code, refactors, and architecture" },
  { name: "Explore agent", hint: "Fast codebase exploration" },
  { name: "Docs agent", hint: "Guides and documentation work" },
];

export function TableOfContents({
  items,
  activeId,
}: {
  items: TocItem[];
  activeId: string;
}) {
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAgent, setCopiedAgent] = useState<string | null>(null);

  function copyMarkdown() {
    const md = markdownFromDocs();
    if (!md) return;
    navigator.clipboard
      .writeText(md)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => undefined);
  }

  function openInChat(name: string) {
    const title =
      document.querySelector("h1")?.textContent?.trim() ?? "bionicjs docs";
    const prompt = `Discuss this page: ${title}. ${location.href}`;
    navigator.clipboard
      .writeText(prompt)
      .then(() => {
        setCopiedAgent(name);
        setTimeout(() => setCopiedAgent(null), 2000);
      })
      .catch(() => undefined);
  }

  return (
    <nav aria-label="Page tools" className="text-sm">
      {items.length > 0 && (
        <>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            On this page
          </p>
          <ul className="space-y-1 border-l border-border">
            {items.map((item) => {
              const active = item.id === activeId;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active ? "true" : undefined}
                    className={
                      active
                        ? "flex items-center gap-1.5 border-l-2 border-foreground -ml-px py-1 pl-3 pr-2 text-sm font-medium text-foreground"
                        : "flex items-center gap-1.5 -ml-px border-l-2 border-transparent py-1 pl-3 pr-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    }
                  >
                    <ChevronRightIcon
                      className={`size-3 shrink-0 ${active ? "opacity-100" : "opacity-0"}`}
                    />
                    {item.title}
                  </a>
                  {item.children && item.children.length > 0 && (
                    <ul className="mt-0.5 space-y-0.5 border-l border-border pl-2.5">
                      {item.children.map((child) => {
                        const childActive = child.id === activeId;
                        return (
                          <li key={child.id}>
                            <a
                              href={`#${child.id}`}
                              aria-current={childActive ? "true" : undefined}
                              className={
                                childActive
                                  ? "flex items-center gap-1.5 border-l-2 border-foreground -ml-px py-1 pl-2 pr-2 text-sm font-medium text-foreground"
                                  : "flex items-center gap-1.5 -ml-px border-l-2 border-transparent py-1 pl-2 pr-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                              }
                            >
                              <ChevronRightIcon
                                className={`size-3 shrink-0 ${childActive ? "opacity-100" : "opacity-0"}`}
                              />
                              {child.title}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <hr className="my-4 border-border" />
        </>
      )}

      <div className="space-y-0.5">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <GithubIcon className="size-4 shrink-0" />
          Edit on GitHub
        </a>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex w-full items-center gap-2.5 py-1.5 text-left text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowUpIcon className="size-4 shrink-0" />
          Scroll to top
        </button>
        <button
          type="button"
          onClick={copyMarkdown}
          className="flex w-full items-center gap-2.5 py-1.5 text-left text-muted-foreground transition-colors hover:text-foreground"
        >
          <CopyIcon className="size-4 shrink-0" />
          {copied ? "Copied" : "Copy as Markdown"}
        </button>
        <div>
          <button
            type="button"
            onClick={() => setChatOpen((v) => !v)}
            aria-expanded={chatOpen}
            className="flex w-full items-center gap-2.5 py-1.5 text-left text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChatBubbleIcon className="size-4 shrink-0" />
            <span className="flex-1">Open in chat</span>
            <ChevronDownIcon
              className={`size-3.5 shrink-0 transition-transform ${chatOpen ? "rotate-180" : ""}`}
            />
          </button>
          {chatOpen && (
            <ul className="mt-1 space-y-0.5 border-l border-border pl-3.5">
              {AGENTS.map((agent) => (
                <li key={agent.name}>
                  <button
                    type="button"
                    onClick={() => openInChat(agent.name)}
                    className="flex w-full flex-col items-start rounded-md py-1.5 text-left transition-colors hover:text-foreground"
                  >
                    <span className="font-medium text-foreground">
                      {copiedAgent === agent.name ? "Prompt copied" : agent.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {agent.hint}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}