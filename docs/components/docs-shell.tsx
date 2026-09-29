"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CloseIcon,
  GithubIcon,
  LogoIcon,
  MenuIcon,
} from "@/components/icons";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { HeaderNav } from "@/components/header-nav";
import { TableOfContents } from "@/components/table-of-contents";
import { CommandMenu } from "@/components/command-menu";
import { HeaderSearchButton } from "@/components/header-search-button";
import { useGitHubStars } from "@/components/use-github-stars";
import {
  GITHUB_URL,
  type NavGroup,
  type NavItem,
  type TocItem,
} from "@/lib/sections";

const GROUP_ICONS: Record<string, string> = {
  "Get Started": "M13 10V3L4 14h7v7l9-11h-7z",
  Concepts:
    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  "Build & Dev":
    "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  Integrations:
    "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  Runtime: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  Deployment:
    "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z",
  "CI/CD":
    "M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9",
  "Agentic Integration":
    "M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z",
  Reference:
    "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
};

const SUBCATEGORY_ICONS: Record<string, string> = {
  Core: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  "Data & APIs":
    "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
  Integrations:
    "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  AI: "M12 6.5c.28-1.63.81-2.58 1.63-3.5-.07 1.05.1 2.02.42 2.98.45 1.32 1.25 2.24 2.45 2.98-1.2.74-2 1.66-2.45 2.98-.32.96-.49 1.93-.42 2.98-.82-.92-1.35-1.87-1.63-3.5-.28-1.63-.81-2.58-1.63-3.5.07 1.05-.1 2.02-.42 2.98-.45 1.32-1.25 2.24-2.45 2.98 1.2.74 2 1.66 2.45 2.98.32.96.49 1.93.42 2.98.82-.92 1.35-1.87 1.63-3.5z",
};

// Subcategory headings use SimpleIcons CDN for brand icons
const SUBCATEGORY_BRAND_ICONS: Record<string, string> = {
  Auth: "betterauth",
  Database: "prisma",
  Jobs: "celery",
};
// Per-item brand icons for sidebar links
const ITEM_BRAND_ICONS: Record<string, string> = {
  // Integration sections
  "Auth": "betterauth",
  "Database": "prisma",
  "Jobs": "celery",
  // Auth providers
  "Better Auth": "betterauth",
  "Clerk": "clerk",
  "Firebase": "firebase",
  "Supabase": "supabase",
  // Database
  "Prisma": "prisma",
  "Drizzle": "drizzle",
  // AI
  "LLM": "anthropic",
  "MCP": "claude",
  "RAG": "langchain",
  "Anthropic": "anthropic",
  "Gemini": "googlegemini",
  "Ollama": "ollama",
  // Jobs
  "Celery": "celery",
  "RQ": "redis",
  "Dramatiq": "rabbitmq",
  "Redis": "redis",
  "RabbitMQ": "rabbitmq",
  // Deployment
  "Vercel": "vercel",
  "Netlify": "netlify",
  "Cloudflare": "cloudflare",
  "Deno Deploy": "deno",
  "Fly.io": "flydotio",
  "Railway": "railway",
  "Render": "render",
  // Python
  "Python Execution": "python",
};

// Stroke icons for sidebar items without a brand logo
const ITEM_ICON_PATHS: Record<string, string> = {
  "Why?":
    "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z",
  "Getting Started":
    "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",
  "Project Structure":
    "M3.75 9.75h16.5M3.75 6.75h16.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H3.75a1.5 1.5 0 0 1-1.5-1.5v-9a1.5 1.5 0 0 1 1.5-1.5Z",
  "Layouts and Pages":
    "M3.75 6.75A2.25 2.25 0 0 1 6 4.5h12a2.25 2.25 0 0 1 2.25 2.25v10.5A2.25 2.25 0 0 1 18 19.5H6a2.25 2.25 0 0 1-2.25-2.25V6.75ZM3.75 9h16.5M9 9v10.5",
  "Filesystem routing":
    "M16 3h5v5M8 3H3v5M21 16v5h-5M3 16v5h5M6.7 6.7l10.6 10.6",
  "Linking and Navigating":
    "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  "Server and Client Components":
    "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm0 9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3zM6 8h.01M6 17h.01",
  "The RPC Boundary":
    "M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4",
  "Fetching Data":
    "M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2",
  "Mutating Data":
    "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z",
  "Caching": "M13 2 3 14h7l-1 8 10-12h-7l1-8z",
  "AI Capabilities":
    "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z",
  "OpenAI":
    "M12 2l3.2 2.4 4-.6 1.1 3.9 3.5 2.1-1.4 3.9 1.4 3.9-3.5 2.1-1.1 3.9-4-.6L12 22l-3.2-2.4-4 .6-1.1-3.9L.2 14.3l1.4-3.9L.2 6.5l3.5-2.1 1.1-3.9 4 .6L12 2zm0 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z",
  "Agents":
    "M12 8V4H8a2 2 0 0 0-2 2v2M4 11c0 .7.6 1.2 1.2 1.2H6.9M16 8h-2V4h4v2M8 17h8m0 0V12.2h-8V17M5.5 20a2 2 0 0 0-2 2h17a2 2 0 0 0-2-2h-13z",
  "Prompts":
    "M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM4.5 4.5h15v12a1.5 1.5 0 0 1-1.5 1.5H8.25l-3.75 3.75V4.5Z",
  "WorkOS":
    "M9 13.5V9a3 3 0 1 1 6 0v4.5M8 13.5h8a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z",
  "Kysely":
    "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m-8 4v7.5",
  "AWS Lambda":
    "M12 6.5 5.5 19.5h3.8l2.7-5.2 2.7 5.2h3.8L12 6.5zM12 6.5V3m0 0 2 1.5M12 3l-2 1.5",
  "Background Jobs":
    "M12 6v6h4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  "Vite and Nitro": "M13 2 3 14h7l-1 8 10-12h-7l1-8z",
  "The Dev Server":
    "m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z",
  "HMR & Watchers":
    "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99",
  "Configuration":
    "M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75",
  "Build Pipeline":
    "m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
  "Parser & Manifest":
    "M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z",
  "Virtual Modules":
    "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a2.5 2.5 0 0 1-2.5 2.5c-.836 0-1.625.035-2.4.128M6 9.75h2.25a2.25 2.25 0 0 1 2.25 2.25V14.25M9.75 21v-2.25A2.25 2.25 0 0 1 12 16.5h2.25m0-9.75v6.75m0 0A2.25 2.25 0 0 0 16.5 19.5h4.5M15 12a2.25 2.25 0 0 0 2.25 2.25h4.5",
  "Layout Adaptation":
    "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
  "How it works":
    "M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9-3.75h.008v.008H12V8.25z",
  "The Server & Hono":
    "M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Zm0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2Z",
  "API Proxying":
    "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99",
  "Middleware & Edge":
    "M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
  "Merge strategy":
    "M8 7h8m0 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-8 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0v-5a5 5 0 0 1 5-5h3m0 0 2-2m-2 2 2 2",
  "Overview": "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75",
  "Brokers":
    "M7 3v8m0 2v2m0-4a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm7-2a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm0 0V7a4 4 0 0 0-4-4h-1",
  "Providers":
    "M5 7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm7 7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm7 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6ZM8.2 16 16 9m-1-4h4v4",
  "The stack": "m12 2 9 5-9 5-9-5 9-5zm9 12-9 5-9-5m18 0-9 5-9-5",
  "Testing":
    "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-1.687C1.96 19.02 1.638 16.93 2.87 15.7L5 14.5",
  "CLI": "m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z",
  "Examples":
    "M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6",
  "Package Reference":
    "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25",
  "CI/CD": "M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9",
};


function GroupIcon({ title }: { title: string }) {
  const d = GROUP_ICONS[title];
  if (!d) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5 shrink-0 text-muted-foreground"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

function ItemIcon({ title }: { title: string }) {
  const brand = ITEM_BRAND_ICONS[title];
  if (brand) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://cdn.simpleicons.org/${brand}/a1a1aa`}
        alt=""
        aria-hidden
        width={14}
        height={14}
        className="size-3.5 shrink-0 opacity-80"
      />
    );
  }
  const d = ITEM_ICON_PATHS[title];
  if (d) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5 shrink-0 opacity-50"
        aria-hidden
      >
        <path d={d} />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-3.5 shrink-0 opacity-50"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}

type SidebarEntry =
  | { kind: "item"; item: NavItem }
  | { kind: "subcategory"; item: NavItem; items: NavItem[] }
  | { kind: "children"; items: NavItem[] };

function groupItems(items: NavItem[], flat = false): SidebarEntry[] {
  const entries: SidebarEntry[] = [];
  let i = 0;
  while (i < items.length) {
    if (flat) {
      entries.push({ kind: "item", item: items[i] });
      i++;
    } else if (items[i].isChild) {
      const children: NavItem[] = [];
      while (i < items.length && items[i].isChild) {
        children.push(items[i]);
        i++;
      }
      entries.push({ kind: "children", items: children });
    } else if (items[i].children && items[i].children!.length > 0) {
      entries.push({ kind: "subcategory", item: items[i], items: items[i].children! });
      i++;
    } else {
      entries.push({ kind: "item", item: items[i] });
      i++;
    }
  }
  return entries;
}

function SidebarChildItem({
  item,
  activeHref,
  onNavigate,
}: {
  item: NavItem;
  activeHref: string;
  onNavigate?: () => void;
}) {
  // Item with its own sub-children (e.g. Jobs > Celery, or Brokers > Redis)
  if (item.children && item.children.length > 0) {
    return (
      <li className="relative ml-3">
        <div aria-hidden className="absolute left-[-1px] top-0 bottom-0 w-px bg-border" />
        {/* Section title */}
        <div className="flex items-center gap-2 py-1.5 pl-5">
          <div aria-hidden className="absolute left-[-4.5px] top-[9px] h-[5px] w-[5px] rounded-full border border-border bg-background" />
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <ItemIcon title={item.title} />
            {item.title}
          </span>
        </div>
        {/* Sub-items */}
        <ul className="flex flex-col gap-0.5 pb-2">
          {item.children.map((child) => {
            const active = activeHref === child.href;
            return (
              <li key={child.href} className="relative">
                <div aria-hidden className="absolute left-[-1px] top-[13px] h-px w-[12px] bg-border" />
                {active && (
                  <div aria-hidden className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-foreground" />
                )}
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  scroll={false}
                  aria-current={active ? "true" : undefined}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 pl-5 text-[13px] transition-colors ${
                    active
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <ItemIcon title={child.title} />
                  {child.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </li>
    );
  }

  // Simple child item (no sub-children)
  const active = activeHref === item.href;
  return (
    <li key={item.href} className="relative">
      <div aria-hidden className="absolute left-[-1px] top-[13px] h-px w-[12px] bg-border" />
      {active && (
        <div aria-hidden className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-foreground" />
      )}
      <Link
        href={item.href}
        onClick={onNavigate}
        scroll={false}
        aria-current={active ? "true" : undefined}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 pl-5 text-[13px] transition-colors ${
          active
            ? "bg-muted font-medium text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <ItemIcon title={item.title} />
        {item.title}
      </Link>
    </li>
  );
}

// Module-scope accordion cache. The docs page mounts a fresh DocsShell on
// every soft navigation, which would reset openGroups below. Keeping it in
// module scope preserves the open groups across navigations while a hard
// refresh re-evaluates the module and returns to the default.
let openGroupsCache: Set<string> | null = null;

const SidebarNav = memo(function SidebarNav({
  groups,
  activeHref,
  onNavigate,
}: {
  groups: NavGroup[];
  activeHref: string;
  onNavigate?: () => void;
}) {
  // Determine which group contains the active href
  const activeGroupTitle = useMemo(() => {
    for (const group of groups) {
      for (const item of group.items) {
        if (item.href === activeHref) return group.title;
        if (item.children) {
          for (const child of item.children) {
            if (child.href === activeHref) return group.title;
          }
        }
      }
    }
    return null;
  }, [groups, activeHref]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    return openGroupsCache ? new Set(openGroupsCache) : new Set(["Get Started"]);
  });

  // Skip the first run so a fresh load keeps only "Get Started" open.
  // Auto-open the group containing the active item on navigation WITHOUT
  // collapsing the rest.
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (activeGroupTitle) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: open active group after navigation
      setOpenGroups((prev) => {
        if (prev.has(activeGroupTitle)) return prev;
        const next = new Set(prev);
        next.add(activeGroupTitle);
        openGroupsCache = next;
        return next;
      });
    }
  }, [activeGroupTitle]);

  function toggleGroup(title: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      openGroupsCache = next;
      return next;
    });
  }

  return (
    <nav aria-label="Documentation" className="flex flex-col gap-0.5">
      {groups.map((group) => {
        // Deployment renders its Overview and platform pages on one level
        const entries = groupItems(group.items, group.title === "Deployment");
        const isOpen = openGroups.has(group.title);
        const groupHasActive = entries.some((e) => {
          if (e.kind === "item") return activeHref === e.item.href;
          if (e.kind === "subcategory")
            return e.items.some((c) => activeHref === c.href);
          return e.items.some((c) => activeHref === c.href);
        });
        // We use a useEffect below to handle auto-expanding groups when activeHref changes,
        // so we shouldn't mutate openGroups directly during render.
        return (
          <div key={group.title}>
            {/* Group title — clickable toggle */}
            <button
              type="button"
              onClick={() => toggleGroup(group.title)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left cursor-pointer transition-colors hover:bg-muted"
              aria-expanded={isOpen}
            >
              <GroupIcon title={group.title} />
              <span className="text-label-12 flex-1 text-muted-foreground">
                {group.title}
              </span>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 ${
                  isOpen ? "" : "-rotate-90"
                }`}
                aria-hidden
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
            {/* Collapsible content — grid-rows trick enables smooth simultaneous open/close */}
            <div
              className="grid transition-all duration-200 ease-in-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
              {/* Items — vertical line runs alongside them */}
              <div className="relative ml-5 border-l border-border pl-5 pt-0.5 pb-2">
                <ul className="flex flex-col gap-0.5">
                {entries.map((entry, idx) => {
                  if (entry.kind === "item") {
                    const active = activeHref === entry.item.href;
                    return (
                      <li key={entry.item.href} className="relative">
                        {/* Horizontal branch from vertical line */}
                        <div aria-hidden className="absolute left-[-20px] top-[13px] h-px w-[17px] bg-border" />
                        {active && (
                          <div aria-hidden className="absolute -left-[20px] top-0 bottom-0 w-px bg-foreground" />
                        )}
                        <Link
                          href={entry.item.href}
                          onClick={onNavigate}
                          scroll={false}
                          aria-current={active ? "true" : undefined}
                          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                            active
                              ? "bg-muted font-medium text-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <ItemIcon title={entry.item.title} />
                          {entry.item.title}
                        </Link>
                      </li>
                    );
                  }

                  if (entry.kind === "subcategory") {
                    const subIcon = SUBCATEGORY_ICONS[entry.item.title];
                    const brandIcon = SUBCATEGORY_BRAND_ICONS[entry.item.title];
                    const isActive = activeHref === entry.item.href;
                    return (
                      <li key={`sub-${entry.item.title}-${idx}`} className="relative mt-3 first:mt-0">
                        {/* Horizontal branch connecting title to parent vertical line */}
                        <div aria-hidden className="absolute left-[-20px] top-[11px] h-px w-[17px] bg-border" />
                        {/* Subcategory title — clickable link */}
                        <Link
                          href={entry.item.href}
                          onClick={onNavigate}
                          scroll={false}
                          className={`relative flex items-center gap-2 py-1.5 transition-colors ${
                            isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {brandIcon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`https://cdn.simpleicons.org/${brandIcon}/a1a1aa`}
                              alt=""
                              aria-hidden
                              width={14}
                              height={14}
                              className="size-3.5 shrink-0 opacity-80"
                            />
                          ) : subIcon ? (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="size-3.5 shrink-0 text-muted-foreground"
                              aria-hidden
                            >
                              <path d={subIcon} />
                            </svg>
                          ) : null}
                          <span className="text-label-12">
                            {entry.item.title}
                          </span>
                        </Link>
                        {/* Nested items — vertical line aligned with item branches, like Integrations */}
                        <div className="relative ml-3">
                          <div aria-hidden className="absolute left-[-1px] top-0 bottom-0 w-px bg-border" />
                          <ul className="flex flex-col gap-0.5">
                            {entry.items.map((child) => {
                              const active = activeHref === child.href;
                              return (
                                <li key={child.href} className="relative">
                                  <div aria-hidden className="absolute left-[-1px] top-[13px] h-px w-[12px] bg-border" />
                                  {active && (
                                    <div aria-hidden className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-foreground" />
                                  )}
                                  <Link
                                    href={child.href}
                                    onClick={onNavigate}
                                    scroll={false}
                                    aria-current={active ? "true" : undefined}
                                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 pl-5 text-[13px] transition-colors ${
                                      active
                                        ? "bg-muted font-medium text-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                                  >
                                    <ItemIcon title={child.title} />
                                    {child.title}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </li>
                    );
                  }

                  // Children group — nested vertical line to the right
                  return (
                    <li key={`children-${idx}`} className="relative ml-3">
                      <div aria-hidden className="absolute left-[-1px] top-0 bottom-0 w-px bg-border" />
                      <ul className="flex flex-col gap-0.5">
                        {entry.items.map((child) => (
                          <SidebarChildItem
                            key={child.href}
                            item={child}
                            activeHref={activeHref}
                            onNavigate={onNavigate}
                          />
                        ))}
                      </ul>
                    </li>
                  );
                })}
                </ul>
              </div>
            </div>{/* end overflow-hidden */}
            </div>{/* end grid wrapper */}
          </div>
        );
      })}
    </nav>
  );
});

export function DocsShell({
  toc,
  nav,
  children,
}: {
  toc?: TocItem[];
  nav: NavGroup[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>(toc?.[0]?.id ?? "");
  const sidebarRef = useRef<HTMLElement>(null);
  const stars = useGitHubStars();

  // Stable nav reference — prevent re-renders when nav data hasn't changed
  const stableNav = useMemo(() => nav, [nav]);

  // Sidebar scroll restoration (Farm.js approach: sessionStorage + ensureActiveVisible)
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const storageKey = "bionicjs-docs-sidebar-scroll";

    // Read saved position
    function readSaved(): { path: string; scrollTop: number } | null {
      try {
        const raw = sessionStorage.getItem(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : null;
      } catch {
        return null;
      }
    }

    // Save current position
    function save(targetPath?: string) {
      if (!sidebar) return;
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            path: targetPath ?? location.pathname,
            scrollTop: sidebar.scrollTop,
          })
        );
      } catch {
        // Ignore storage errors
      }
    }

    // Restore on navigation
    const saved = readSaved();
    if (saved?.path === pathname && Number.isFinite(saved.scrollTop)) {
      sidebar.scrollTop = saved.scrollTop;
    } else {
      // New page — scroll active link into view
      const active = sidebar.querySelector('a[aria-current="true"]');
      if (active instanceof HTMLElement) {
        const activeRect = active.getBoundingClientRect();
        const sidebarRect = sidebar.getBoundingClientRect();
        if (
          activeRect.top < sidebarRect.top ||
          activeRect.bottom > sidebarRect.bottom
        ) {
          sidebar.scrollTop +=
            activeRect.top -
            sidebarRect.top -
            (sidebar.clientHeight - activeRect.height) / 2;
        }
      }
    }

    // Persist on scroll
    sidebar.addEventListener("scroll", () => save(), { passive: true });

    // Save target path on link click
    sidebar.addEventListener("click", (event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;
      if (!target) return;
      try {
        save(new URL(target.getAttribute("href") ?? "", location.href).pathname);
      } catch {
        save();
      }
    });

    // Save on page unload
    window.addEventListener("beforeunload", () => save());

    return () => {
      sidebar.removeEventListener("scroll", () => save());
      window.removeEventListener("beforeunload", () => save());
    };
  }, [pathname]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!toc || toc.length === 0) return;
    const ids = toc.map((t) => t.id);
    function onScroll() {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActiveId(current);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  const activeHref = pathname === "/" ? "/" : pathname;

  return (
    <>
      <CommandMenu nav={stableNav} open={menuOpen} onOpenChange={setMenuOpen} />
      <header
        className={`sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur transition-shadow ${
          scrolled ? "shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : ""
        }`}
      >
        <div className="relative flex h-14 items-center gap-2 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          >
            <MenuIcon className="size-4" />
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2">
            <LogoIcon className="size-6" />
            <span className="text-label-16 font-semibold">
              bionicjs
            </span>
          </Link>

          <HeaderNav className="ml-4 hidden items-center gap-5 md:flex" />

          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
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
              <GithubIcon className="size-[18px]" />
              <span className="hidden font-mono text-label-12-mono sm:inline">
                {stars ?? "—"}
              </span>
            </a>
            <ThemeSwitcher small />
          </div>
        </div>
      </header>

      <div className="flex lg:pl-4">
        <aside ref={sidebarRef} className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[260px] shrink-0 overflow-y-auto overscroll-contain border-border py-8 pr-4 lg:block lg:border-r">
          <SidebarNav groups={stableNav} activeHref={activeHref} />
        </aside>

        <div className="min-w-0 flex-1 px-6 pb-24 pt-3 sm:px-12 lg:px-20">
          <main id="docs-main" data-md-root className="mx-auto max-w-3xl">
            {children}
          </main>
        </div>

        {toc !== undefined && (
          <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[260px] shrink-0 overflow-y-auto pl-6 pr-2 py-8 xl:block">
            <TableOfContents items={toc} activeId={activeId} />
          </aside>
        )}
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-[300px] max-w-[85vw] flex-col border-r border-border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 h-14">
              <Link href="/" className="flex shrink-0 items-center gap-2" onClick={() => setMobileOpen(false)}>
                <LogoIcon className="size-6" />
                <span className="text-[16px] font-semibold tracking-tight">
                  bionicjs
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
                className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto border-border px-3 py-6">
              <SidebarNav
                groups={stableNav}
                activeHref={activeHref}
                onNavigate={() => setMobileOpen(false)}
              />
              <div className="mt-6 border-t border-border pt-4">
                <p className="px-2 pb-2 text-label-12 text-muted-foreground">
                  More
                </p>
                <Link
                  href="/learn/why-a-meta-framework"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2 py-2 text-label-14 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Learn the internals
                </Link>
                <Link
                  href="/changelog"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-2 py-2 text-label-14 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Changelog
                </Link>
                <a
                  href={`${GITHUB_URL}/releases`}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg px-2 py-2 text-label-14 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Releases
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
