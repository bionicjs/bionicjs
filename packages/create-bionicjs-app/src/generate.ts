import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

export const TEMPLATES_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "templates",
);

// All workspace packages publish in lockstep, so the scaffolded app pins every
// @bionicjs/* dependency to the same version as the running create-bionicjs-app itself.
// Resolves from the package root whether this module runs from src/ or dist/.
const require = createRequire(import.meta.url);
export const BIONICJS_VERSION: string = require("../package.json").version;

import type { Selection } from "./prompts.ts";

export interface GenerateOptions {
  appName: string;
  templates: string[];
  selection: Selection;
  force?: boolean;
}

export interface GenerateReport {
  written: string[];
  merged: string[];
}

const BASE_TEMPLATE = "base";

function sanitizeAppName(name: string): string {
  const clean = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || "my-app";
}

function render(template: string, appName: string): string {
  return template.replaceAll("{{appName}}", appName);
}

export async function generateProject(
  destDir: string,
  options: GenerateOptions,
): Promise<GenerateReport> {
  const appName = sanitizeAppName(options.appName);
  const templates = [BASE_TEMPLATE, ...options.templates];

  let exists = false;
  try {
    await stat(destDir);
    exists = true;
  } catch {
    exists = false;
  }

  if (exists) {
    const entries = await readdir(destDir);
    if (entries.length > 0 && !options.force) {
      throw new Error(
        `Directory "${destDir}" is not empty. Use --force to overwrite existing files.`,
      );
    }
  }

  await mkdir(destDir, { recursive: true });

  const report: GenerateReport = { written: [], merged: [] };

  for (const template of templates) {
    const templateDir = path.join(TEMPLATES_DIR, template);
    await applyTemplate(templateDir, destDir, appName, report);
  }

  // Generated bionicjs.config.ts imports @bionicjs/* plugin packages for the selected
  // capabilities, so those must be resolvable as real dependencies in the
  // scaffolded app. Also replace the workspace:* placeholder with a real
  // version (workspace: is invalid outside the monorepo).
  await finalizePluginDeps(destDir, options.selection);

  // Generate bionicjs.config.ts based on user selections (config = what/which, not how)
  const configContent = generateBionicJSConfig(options.selection);
  await writeFile(path.join(destDir, "bionicjs.config.ts"), configContent);
  report.written.push("bionicjs.config.ts");

  // Scaffold server/ai/* implementation folders (code, not config)
  if (options.selection.ai && options.selection.ai.length > 0) {
    await scaffoldAiFolders(destDir, options.selection.ai);
  }

  return report;
}

// ─── Config generation ──────────────────────────────────────────────────────

interface PluginEntry {
  pkg: string;
  fn: string;
  body: (s: Selection) => string;
}

const AUTH_PLUGINS: Record<string, PluginEntry> = {
  "better-auth": {
    pkg: "@bionicjs/better-auth",
    fn: "betterAuth",
    body: () => `  auth: betterAuth({
    emailAndPassword: { enabled: true },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
    },
  })`,
  },
  clerk: {
    pkg: "@bionicjs/clerk",
    fn: "clerk",
    body: () => `  auth: clerk({
    secretKey: process.env.CLERK_SECRET_KEY!,
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  })`,
  },
  supabase: {
    pkg: "@bionicjs/supabase",
    fn: "supabase",
    body: () => `  auth: supabase({
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  })`,
  },
  firebase: {
    pkg: "@bionicjs/firebase",
    fn: "firebase",
    body: () => `  auth: firebase({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!,
  })`,
  },
  workos: {
    pkg: "@bionicjs/workos",
    fn: "workos",
    body: () => `  auth: workos({
    apiKey: process.env.WORKOS_API_KEY!,
    clientId: process.env.WORKOS_CLIENT_ID!,
    redirectUri: process.env.WORKOS_REDIRECT_URI!,
  })`,
  },
};

const DB_PLUGINS: Record<string, PluginEntry> = {
  drizzle: {
    pkg: "@bionicjs/drizzle",
    fn: "drizzle",
    body: (s) => `  database: drizzle({
    provider: "${s.database}",
    url: process.env.DATABASE_URL!,
  })`,
  },
  prisma: {
    pkg: "@bionicjs/prisma",
    fn: "prisma",
    body: (s) => `  database: prisma({
    provider: "${s.database}",
    url: process.env.DATABASE_URL!,
  })`,
  },
  kysely: {
    pkg: "@bionicjs/kysely",
    fn: "kysely",
    body: (s) => `  database: kysely({
    provider: "${s.database}",
    url: process.env.DATABASE_URL!,
  })`,
  },
  sql: {
    pkg: "@bionicjs/sql",
    fn: "sql",
    body: (s) => `  database: sql({
    provider: "${s.database}",
    url: process.env.DATABASE_URL!,
  })`,
  },
};

const JOBS_PLUGINS: Record<string, PluginEntry> = {
  celery: {
    pkg: "@bionicjs/celery",
    fn: "celery",
    body: () => `  jobs: celery({
    broker: process.env.CELERY_BROKER_URL!,
  })`,
  },
  dramatiq: {
    pkg: "@bionicjs/dramatiq",
    fn: "dramatiq",
    body: () => `  jobs: dramatiq({
    broker: process.env.DRAMATIQ_BROKER_URL!,
  })`,
  },
  rq: {
    pkg: "@bionicjs/rq",
    fn: "rq",
    body: () => `  jobs: rq({
    broker: process.env.RQ_BROKER_URL!,
  })`,
  },
};

function buildAiBlock(s: Selection): { importLine: string; configBlock: string } | null {
  if (!s.ai || s.ai.length === 0) return null;

  const hasRag = s.ai.includes("rag");
  const hasAgents = s.ai.includes("agents");
  const llmProvider = s.ai.find((id) => id.startsWith("llm/")) ?? "llm/anthropic";
  const isOpenAI = llmProvider === "llm/openai";
  const isGoogle = llmProvider === "llm/google";
  const isOllama = llmProvider === "llm/ollama";

  const ragBlock = hasRag
    ? `
    rag: {
      enabled: true,
      vectorDb: "chroma",
      dbUrl: process.env.CHROMA_URL,
      knowledgeBase: "./knowledge",
      embeddingModel: "text-embedding-3-small",
      chunkSize: 1000,
      chunkOverlap: 200,
    },`
    : "";

  const agentsBlock = hasAgents
    ? `
    agents: {
      default: {
        tools: ["get_score"],
      },
    },`
    : "";

  if (isOpenAI) {
    return {
      importLine: `import { openai } from "@bionicjs/openai";`,
      configBlock: `  ai: openai({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o",${ragBlock}${agentsBlock}
  })`,
    };
  }

  if (isGoogle) {
    return {
      importLine: `import { google } from "@bionicjs/google";`,
      configBlock: `  ai: google({
    apiKey: process.env.GEMINI_API_KEY!,
    model: "gemini-2.5-pro",${ragBlock}${agentsBlock}
  })`,
    };
  }

  if (isOllama) {
    return {
      importLine: `import { ollama } from "@bionicjs/ollama";`,
      configBlock: `  ai: ollama({
    baseUrl: process.env.OLLAMA_HOST!,
    model: "llama3.2",${ragBlock}${agentsBlock}
  })`,
    };
  }

  return {
    importLine: `import { anthropic } from "@bionicjs/anthropic";`,
    configBlock: `  ai: anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: "claude-sonnet-4-5",${ragBlock}${agentsBlock}
  })`,
  };
}

function generateBionicJSConfig(selection: Selection): string {
  const imports: string[] = [`import { defineConfig } from "@bionicjs/core";`];
  const configKeys: string[] = [];

  // Auth
  if (selection.auth && selection.auth !== "none") {
    const entry = AUTH_PLUGINS[selection.auth];
    if (entry) {
      imports.push(`import { ${entry.fn} } from "${entry.pkg}";`);
      configKeys.push(entry.body(selection));
    }
  }

  // Database
  const toolkit = selection.toolkit ?? "sql";
  if (selection.database && selection.database !== "none") {
    const entry = DB_PLUGINS[toolkit] ?? DB_PLUGINS.sql;
    imports.push(`import { ${entry.fn} } from "${entry.pkg}";`);
    configKeys.push(entry.body(selection));
  }

  // AI (provider-level plugin only; implementation stays in server/ai/)
  const aiBlock = buildAiBlock(selection);
  if (aiBlock) {
    imports.push(aiBlock.importLine);
    configKeys.push(aiBlock.configBlock);
  }

  // Jobs
  if (selection.jobs && selection.jobs !== "none") {
    const entry = JOBS_PLUGINS[selection.jobs];
    if (entry) {
      imports.push(`import { ${entry.fn} } from "${entry.pkg}";`);
      configKeys.push(entry.body(selection));
    }
  }

  const body =
    configKeys.length > 0
      ? configKeys.join(",\n\n")
      : "  // Add plugins here — e.g. auth: betterAuth({ ... })";

  return `${imports.join("\n")}\n\nexport default defineConfig({\n${body}\n});\n`;
}

function aiProviderPkg(selection: Selection): string | undefined {
  const llmProvider = selection.ai?.find((id) => id.startsWith("llm/")) ?? "llm/anthropic";
  switch (llmProvider) {
    case "llm/openai":
      return "@bionicjs/openai";
    case "llm/google":
      return "@bionicjs/google";
    case "llm/ollama":
      return "@bionicjs/ollama";
    default:
      return "@bionicjs/anthropic";
  }
}

function selectedPluginDeps(selection: Selection): string[] {
  const deps: string[] = [];

  if (selection.auth && selection.auth !== "none") {
    const entry = AUTH_PLUGINS[selection.auth];
    if (entry) deps.push(entry.pkg);
  }

  const toolkit = selection.toolkit ?? "sql";
  if (selection.database && selection.database !== "none") {
    const entry = DB_PLUGINS[toolkit] ?? DB_PLUGINS.sql;
    deps.push(entry.pkg);
  }

  if (selection.ai && selection.ai.length > 0) {
    const pkg = aiProviderPkg(selection);
    if (pkg) deps.push(pkg);
  }

  if (selection.jobs && selection.jobs !== "none") {
    const entry = JOBS_PLUGINS[selection.jobs];
    if (entry) deps.push(entry.pkg);
  }

  return deps;
}

const DEP_SECTIONS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"] as const;

async function finalizePluginDeps(destDir: string, selection: Selection): Promise<void> {
  const pkgPath = path.join(destDir, "package.json");
  const pkg = JSON.parse(await readFile(pkgPath, "utf8"));

  for (const dep of selectedPluginDeps(selection)) {
    pkg.dependencies = pkg.dependencies ?? {};
    pkg.dependencies[dep] = BIONICJS_VERSION;
  }

  // Every workspace:* placeholder must become a real version. pnpm's protocol
  // is invalid outside the monorepo, so a single surviving placeholder makes
  // the whole project uninstallable. This also covers @bionicjs/dev, which
  // lives in devDependencies and was previously never rewritten.
  for (const section of DEP_SECTIONS) {
    const deps = pkg[section];
    if (typeof deps !== "object" || deps === null) continue;
    for (const [name, range] of Object.entries(deps)) {
      if (typeof range === "string" && range.startsWith("workspace:")) {
        deps[name] = BIONICJS_VERSION;
      }
    }
  }

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

// ─── AI implementation folder scaffolding ────────────────────────────────────
// These are CODE folders, not plugins.
// The plugin only configures the provider and high-level settings.
// The real agents, tools, RAG pipelines, and prompts live here.

const AI_FOLDER_STUBS: Record<string, { folder: string; filename: string; content: string }> = {
  agents: {
    folder: "server/ai/agents",
    filename: "index.ts",
    content: `// server/ai/agents/index.ts
// Define your AI agents here. The ai config only references their names.
// Real system prompts and tool bindings live here.
export const defaultAgent = {
  systemPrompt: "You are a helpful assistant.",
  tools: ["get_score"],
};
`,
  },
  rag: {
    folder: "server/ai/rag",
    filename: "index.ts",
    content: `// server/ai/rag/index.ts
// Define your RAG retrieval logic here.
// The ai config sets the vector DB, chunk size, and knowledge base path.
// Real ingestion and retrieval code lives here.
export async function retrieveContext(query: string): Promise<string[]> {
  // TODO: implement vector search
  return [];
}
`,
  },
  tools: {
    folder: "server/ai/tools",
    filename: "index.ts",
    content: `// server/ai/tools/index.ts
// Define tool implementations here. These are called by AI agents.
export async function get_score(input: { id: string }) {
  // TODO: implement
  return { score: 0 };
}
`,
  },
  prompts: {
    folder: "server/ai/prompts",
    filename: "system.ts",
    content: `// server/ai/prompts/system.ts
export const systemPrompt = \`
You are a helpful assistant.
\`.trim();
`,
  },
  mcp: {
    folder: "server/ai/mcp",
    filename: "index.ts",
    content: `// server/ai/mcp/index.ts
// Define MCP server handlers here.
export const mcpHandlers = {};
`,
  },
};

async function scaffoldAiFolders(destDir: string, aiCapabilities: string[]) {
  for (const id of aiCapabilities) {
    const stub = AI_FOLDER_STUBS[id];
    if (!stub) continue;
    const fullDir = path.join(destDir, stub.folder);
    await mkdir(fullDir, { recursive: true });
    await writeFile(path.join(fullDir, stub.filename), stub.content);
  }
}

// ─── Template merging ────────────────────────────────────────────────────────

async function applyTemplate(
  sourceDir: string,
  destDir: string,
  appName: string,
  report: GenerateReport,
  rootDir: string = sourceDir,
): Promise<void> {
  const entries = await readdir(sourceDir);
  for (const entry of entries) {
    const source = path.join(sourceDir, entry);
    const statResult = await stat(source);
    // npm strips `.gitignore` from published tarballs, so templates ship it
    // without the leading dot and we restore the name on copy. A scaffolded
    // app with no .gitignore would commit its generated output.
    const relative = path.posix.relative(rootDir, source);
    const destRelative =
      entry === "gitignore"
        ? path.posix.join(path.dirname(relative), ".gitignore")
        : relative;
    if (statResult.isDirectory()) {
      await applyTemplate(source, destDir, appName, report, rootDir);
    } else {
      const content = await readFile(source, "utf8");
      const destPath = path.join(destDir, destRelative);
      const destParent = path.dirname(destPath);
      await mkdir(destParent, { recursive: true });

      let existing: string | undefined;
      try {
        existing = await readFile(destPath, "utf8");
      } catch {
        existing = undefined;
      }

      if (existing === undefined) {
        await writeFile(destPath, render(content, appName));
        report.written.push(destRelative);
      } else if (entry === "package.json") {
        const merged = JSON.stringify(
          mergePackageJson(JSON.parse(existing), JSON.parse(render(content, appName))),
          null,
          2,
        );
        await writeFile(destPath, merged + "\n");
        report.merged.push(relative);
      } else if (entry === "pyproject.toml") {
        await writeFile(
          destPath,
          render(mergePyproject(existing, content), appName),
        );
        report.merged.push(relative);
      } else if (entry === ".env.example") {
        await writeFile(
          destPath,
          render(mergeEnvExample(existing, content), appName),
        );
        report.merged.push(relative);
      } else {
        await writeFile(destPath, render(content, appName));
        report.written.push(relative);
      }
    }
  }
}

function mergePackageJson(target: unknown, source: unknown): unknown {
  if (
    typeof target === "object" &&
    target !== null &&
    !Array.isArray(target) &&
    typeof source === "object" &&
    source !== null &&
    !Array.isArray(source)
  ) {
    const result: Record<string, unknown> = { ...target };
    for (const [key, value] of Object.entries(source)) {
      result[key] =
        value !== null && typeof value === "object" && !Array.isArray(value)
          ? mergePackageJson(result[key] ?? {}, value)
          : value;
    }
    return result;
  }
  return source;
}

function mergePyproject(base: string, fragment: string): string {
  const baseLines = base.split("\n");
  const fragmentSections = parsePyprojectSections(fragment);

  for (const { header, lines } of fragmentSections) {
    const headerIndex = baseLines.findIndex((line) => line.trim() === header);
    if (headerIndex === -1) {
      baseLines.push("", header, ...lines);
      continue;
    }
    const sectionEnd = baseLines
      .slice(headerIndex + 1)
      .findIndex((line) => /^\[.*\]\s*$/.test(line.trim()));
    const end = sectionEnd === -1 ? baseLines.length : headerIndex + 1 + sectionEnd;
    const newLines = lines.filter(
      (line) => !baseLines.slice(headerIndex, end).includes(line),
    );
    if (newLines.length > 0) {
      baseLines.splice(end, 0, ...newLines);
    }
  }

  return baseLines.join("\n");
}

function parsePyprojectSections(content: string): { header: string; lines: string[] }[] {
  const sections: { header: string; lines: string[] }[] = [];
  let current: { header: string; lines: string[] } | undefined;
  for (const line of content.split("\n")) {
    if (/^\[.*\]\s*$/.test(line.trim())) {
      current = { header: line.trim(), lines: [] };
      sections.push(current);
    } else if (current && line.trim() !== "") {
      current.lines.push(line);
    }
  }
  return sections;
}

function mergeEnvExample(base: string, fragment: string): string {
  const baseLines = base.split("\n");
  const knownKeys = new Set(
    baseLines
      .map((line) => line.split("=")[0].trim())
      .filter((key) => key.length > 0),
  );

  for (const line of fragment.split("\n")) {
    const key = line.split("=")[0].trim();
    if (line.includes("=")) {
      if (!knownKeys.has(key)) {
        baseLines.push(line);
        knownKeys.add(key);
      }
    } else if (!baseLines.includes(line)) {
      baseLines.push(line);
    }
  }

  return baseLines.join("\n");
}