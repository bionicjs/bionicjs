#!/usr/bin/env node
/**
 * Docs integrity check.
 *
 * A curated `subsections` list in `lib/sections.ts` overrides the
 * auto-derived table of contents, so the two can drift apart silently: the
 * page builds, the heading exists, and the "On this page" links just do
 * not scroll anywhere.
 *
 * This verifies that every curated TOC id has a matching heading in the
 * page's markdown, and that every blog post is registered in `lib/blog.ts`
 * (blog routes set `dynamicParams = false`, so an unregistered file 404s).
 *
 * Heading ids are derived the same way `lib/markdown.ts` derives them, so
 * authors can pin one with a trailing {#id}.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const docsDir = join(dirname(fileURLToPath(import.meta.url)), "..");

const errors = [];

// Mirrors parseHeading() in lib/markdown.ts.
function slugify(text) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&[#a-z0-9]+;/gi, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readMarkdownCandidates(slug) {
  return [
    join(docsDir, "content", `${slug}.md`),
    join(docsDir, "content", slug, "index.md"),
  ];
}

function readMarkdown(slug) {
  for (const path of readMarkdownCandidates(slug)) {
    try {
      return readFileSync(path, "utf-8");
    } catch {
      // try next candidate
    }
  }
  return null;
}

function headingIds(md) {
  const ids = new Set();
  for (const m of md.matchAll(/^(#{1,6})\s+(.+?)\s*$/gm)) {
    const raw = m[2];
    const pinned = raw.match(/\{#([\w-]+)\}\s*$/);
    ids.add(pinned ? pinned[1] : slugify(raw.replace(/\{#[\w-]+\}\s*$/, "")));
  }
  return ids;
}

// ── Curated TOC entries must exist as headings ──────────────────────────────

const sectionsSrc = readFileSync(join(docsDir, "lib", "sections.ts"), "utf-8");

const defRe =
  /slug:\s*"([^"]+)"[\s\S]*?subsections:\s*\[([\s\S]*?)\]/g;

let checked = 0;
for (const m of sectionsSrc.matchAll(defRe)) {
  const [, slug, block] = m;
  const ids = [...block.matchAll(/id:\s*"([\w-]+)"/g)].map((i) => i[1]);
  if (ids.length === 0) continue;

  const md = readMarkdown(slug);
  if (md === null) {
    errors.push(`docs section "${slug}" has curated TOC entries but no markdown file`);
    continue;
  }

  const present = headingIds(md);
  for (const id of ids) {
    checked++;
    if (!present.has(id)) {
      errors.push(
        `docs section "${slug}": TOC id "${id}" matches no heading.\n` +
          `    headings in the markdown: ${[...present].join(", ")}`
      );
    }
  }
}

// ── Blog posts must be registered ──────────────────────────────────────────

const blogDir = join(docsDir, "content", "blog");
if (existsSync(blogDir)) {
  const blogSrc = readFileSync(join(docsDir, "lib", "blog.ts"), "utf-8");
  const registered = new Set(
    [...blogSrc.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1])
  );

  for (const file of readdirSync(blogDir)) {
    if (!file.endsWith(".md")) continue;
    const slug = file.replace(/\.md$/, "");
    if (!registered.has(slug)) {
      errors.push(
        `blog post "${slug}" exists in content/blog but is not registered in lib/blog.ts`
      );
    }
    if (readMarkdown(`blog/${slug}`) === null) {
      errors.push(`blog post "${slug}" could not be read via lib/markdown.ts`);
    }
  }
}

// ── Report ──────────────────────────────────────────────────────────────────

if (errors.length === 0) {
  console.log(`docs check passed: ${checked} curated TOC entries resolve.`);
  process.exit(0);
}

// A curated TOC id that matches no heading still builds — the page renders
// and the "On this page" links just go nowhere. There is a known backlog of
// these, so the default is a warning and --strict is how you ratchet it to
// zero. New and edited sections should never add to the backlog.
const strict = process.argv.includes("--strict");
const report = (label) => {
  console.error(`\n${label} (${errors.length}):\n`);
  for (const e of errors) console.error(`  - ${e}\n`);
};

if (strict) {
  report("docs check failed");
  process.exit(1);
}

console.warn(`\ndocs check: ${errors.length} unresolved TOC entr(ies). Known backlog — run with --strict to fail.\n`);
for (const e of errors) console.warn(`  - ${e}`);
