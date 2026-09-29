export interface TemplateChoice {
  id: string;
  path: string;
  label: string;
}

export interface Selection {
  auth?: string;
  database?: string;
  toolkit?: string;
  ai?: string[];
  jobs?: string;
  broker?: string;
}

export const authTemplates: TemplateChoice[] = [
  { id: "better-auth", path: "auth/better-auth", label: "Better Auth" },
  { id: "clerk", path: "auth/clerk", label: "Clerk" },
  { id: "firebase", path: "auth/firebase", label: "Firebase" },
  { id: "supabase", path: "auth/supabase", label: "Supabase" },
  { id: "workos", path: "auth/workos", label: "WorkOS" },
];

export const databaseTemplates: TemplateChoice[] = [
  { id: "sqlite", path: "database", label: "SQLite" },
  { id: "postgresql", path: "database", label: "PostgreSQL" },
];

export const toolkitTemplates: TemplateChoice[] = [
  { id: "prisma", path: "database/prisma", label: "Prisma (ORM)" },
  { id: "drizzle", path: "database/drizzle", label: "Drizzle (ORM)" },
  { id: "kysely", path: "database/kysely", label: "Kysely (query builder)" },
  { id: "sql", path: "database/sql", label: "SQL (raw driver)" },
];

export const aiTemplates: TemplateChoice[] = [
  { id: "llm/openai", path: "ai/llm/openai", label: "OpenAI (LLM provider)" },
  { id: "llm/anthropic", path: "ai/llm/anthropic", label: "Anthropic (LLM provider)" },
  { id: "llm/google", path: "ai/llm/google", label: "Google Gemini (LLM provider)" },
  { id: "llm/ollama", path: "ai/llm/ollama", label: "Ollama (LLM provider)" },
  { id: "agents", path: "ai/agents", label: "Agents" },
  { id: "rag", path: "ai/rag", label: "RAG" },
  { id: "tools", path: "ai/tools", label: "Tools" },
  { id: "prompts", path: "ai/prompts", label: "Prompts" },
  { id: "mcp", path: "ai/mcp", label: "MCP" },
];

export const jobsTemplates: TemplateChoice[] = [
  { id: "celery", path: "jobs/celery", label: "Celery" },
  { id: "rq", path: "jobs/rq", label: "RQ" },
  { id: "dramatiq", path: "jobs/dramatiq", label: "Dramatiq" },
];

export const brokerTemplates: TemplateChoice[] = [
  { id: "redis", path: "jobs/brokers/redis", label: "Redis" },
  { id: "rabbitmq", path: "jobs/brokers/rabbitmq", label: "RabbitMQ" },
];

const DEFAULT_BROKER = "redis";
const DEFAULT_TOOLKIT = "sql";

export function isUnsafeDirName(name: string): boolean {
  return (
    name.trim() === "" ||
    name === ".." ||
    /[/\\]/.test(name)
  );
}

function findById(choices: TemplateChoice[], id: string): TemplateChoice | undefined {
  return choices.find((choice) => choice.id === id);
}

export function resolveTemplatePaths(selection: Selection): string[] {
  const paths: string[] = [];

  if (selection.auth && selection.auth !== "none") {
    const auth = findById(authTemplates, selection.auth);
    if (!auth) throw new Error(`Unknown auth template "${selection.auth}"`);
    paths.push(auth.path);
  }

  if (selection.database && selection.database !== "none") {
    const database = findById(databaseTemplates, selection.database);
    if (!database) throw new Error(`Unknown database "${selection.database}"`);
    const toolkitId =
      selection.toolkit && selection.toolkit !== "none"
        ? selection.toolkit
        : DEFAULT_TOOLKIT;
    const toolkit = findById(toolkitTemplates, toolkitId);
    if (!toolkit) throw new Error(`Unknown database toolkit "${toolkitId}"`);
    paths.push(`${toolkit.path}/${database.id}`);
  } else if (selection.toolkit && selection.toolkit !== "none") {
    throw new Error("A database toolkit can only be selected together with a database");
  }

  if (selection.ai) {
    const ids = selection.ai.filter((id) => id && id !== "none");
    for (const id of ids) {
      const ai =
        findById(aiTemplates, id) ?? findById(aiTemplates, `llm/${id}`);
      if (!ai) throw new Error(`Unknown AI template "${id}"`);
      paths.push(ai.path);
    }
  }

  if (selection.jobs && selection.jobs !== "none") {
    const jobs = findById(jobsTemplates, selection.jobs);
    if (!jobs) throw new Error(`Unknown jobs template "${selection.jobs}"`);
    paths.push(jobs.path);

    const broker = selection.broker ?? DEFAULT_BROKER;
    const brokerChoice = findById(brokerTemplates, broker);
    if (!brokerChoice) throw new Error(`Unknown broker template "${broker}"`);
    if (selection.jobs === "rq" && broker !== "redis") {
      throw new Error("RQ requires the Redis broker");
    }
    paths.push(brokerChoice.path);
  } else if (selection.broker) {
    throw new Error("A broker can only be selected together with a jobs system");
  }

  return paths;
}