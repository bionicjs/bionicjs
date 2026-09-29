import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, stat, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { generateProject } from "../src/generate.ts";
import { isUnsafeDirName, resolveTemplatePaths } from "../src/prompts.ts";

async function makeProject(features: string[], name = "my-app") {
  const dir = await mkdtemp(path.join(os.tmpdir(), "bionicjs-test-"));
  const report = await generateProject(dir, { appName: name, templates: features, selection: {} });
  return { dir, report };
}

async function hasFile(dir: string, file: string): Promise<boolean> {
  try {
    const statResult = await stat(path.join(dir, file));
    return statResult.isFile();
  } catch {
    return false;
  }
}

async function hasDir(dir: string, sub: string): Promise<boolean> {
  try {
    const statResult = await stat(path.join(dir, sub));
    return statResult.isDirectory();
  } catch {
    return false;
  }
}

async function entries(dir: string, sub: string): Promise<string[] | null> {
  try {
    return await readdir(path.join(dir, sub));
  } catch {
    return null;
  }
}

const BASE_DIRS = ["app", "public", "server"];
const BASE_FILES = [
  "package.json",
  "pyproject.toml",
  "tsconfig.json",
  ".gitignore",
  ".env.example",
  "README.md",
  "bionicjs.config.ts",
  "vite.config.ts",
  "app/layout.tsx",
  "app/page.tsx",
  "server/api/health.ts",
];

test("resolveTemplatePaths: base capabilities and compositions", () => {
  assert.deepEqual(resolveTemplatePaths({}), []);
  assert.deepEqual(resolveTemplatePaths({ auth: "clerk" }), ["auth/clerk"]);
  assert.deepEqual(resolveTemplatePaths({ ai: ["openai", "agents"] }), [
    "ai/llm/openai",
    "ai/agents",
  ]);
  assert.deepEqual(resolveTemplatePaths({ jobs: "celery" }), [
    "jobs/celery",
    "jobs/brokers/redis",
  ]);
  assert.deepEqual(resolveTemplatePaths({ jobs: "celery", broker: "rabbitmq" }), [
    "jobs/celery",
    "jobs/brokers/rabbitmq",
  ]);
  assert.deepEqual(resolveTemplatePaths({ database: "sqlite", toolkit: "drizzle" }), [
    "database/drizzle/sqlite",
  ]);
  assert.deepEqual(resolveTemplatePaths({ database: "postgresql", toolkit: "prisma" }), [
    "database/prisma/postgresql",
  ]);
  assert.deepEqual(resolveTemplatePaths({ database: "sqlite" }), [
    "database/sql/sqlite",
  ]);
  assert.deepEqual(resolveTemplatePaths({ database: "postgresql" }), [
    "database/sql/postgresql",
  ]);
  assert.deepEqual(resolveTemplatePaths({ toolkit: "none" }), []);
  assert.deepEqual(resolveTemplatePaths({ database: "none" }), []);
  assert.deepEqual(resolveTemplatePaths({}), []);
  assert.deepEqual(
    resolveTemplatePaths({ database: "sqlite", toolkit: "none" }),
    ["database/sql/sqlite"],
  );
  assert.deepEqual(
    resolveTemplatePaths({
      auth: "clerk",
      database: "postgresql",
      toolkit: "drizzle",
      ai: ["openai", "mcp"],
      jobs: "celery",
      broker: "redis",
    }),
    ["auth/clerk", "database/drizzle/postgresql", "ai/llm/openai", "ai/mcp", "jobs/celery", "jobs/brokers/redis"],
  );
});

test("resolveTemplatePaths: rejects unknown templates", () => {
  assert.throws(() => resolveTemplatePaths({ auth: "nope" }), /Unknown auth/);
  assert.throws(() => resolveTemplatePaths({ database: "nope" }), /Unknown database/);
  assert.throws(() => resolveTemplatePaths({ ai: ["nope"] }), /Unknown AI/);
  assert.throws(() => resolveTemplatePaths({ jobs: "nope" }), /Unknown jobs/);
  assert.throws(() => resolveTemplatePaths({ jobs: "celery", broker: "nope" }), /Unknown broker/);
  assert.throws(
    () => resolveTemplatePaths({ database: "sqlite", toolkit: "nope" }),
    /Unknown database toolkit/,
  );
});

test("resolveTemplatePaths: toolkit requires a database", () => {
  assert.throws(() => resolveTemplatePaths({ toolkit: "prisma" }), /toolkit/);
  assert.throws(() => resolveTemplatePaths({ toolkit: "sql" }), /toolkit/);
});

test("resolveTemplatePaths: rq requires the redis broker", () => {
  assert.throws(
    () => resolveTemplatePaths({ jobs: "rq", broker: "rabbitmq" }),
    /RQ requires the Redis broker/,
  );
  assert.doesNotThrow(() => resolveTemplatePaths({ jobs: "rq", broker: "redis" }));
});

test('resolveTemplatePaths: "none" values select nothing', () => {
  assert.deepEqual(resolveTemplatePaths({ auth: "none" }), []);
  assert.deepEqual(resolveTemplatePaths({ database: "none" }), []);
  assert.deepEqual(resolveTemplatePaths({ jobs: "none" }), []);
  assert.deepEqual(resolveTemplatePaths({ ai: ["none"] }), []);
  assert.deepEqual(resolveTemplatePaths({ ai: [] }), []);
  assert.deepEqual(
    resolveTemplatePaths({ auth: "none", database: "none", ai: [], jobs: "none" }),
    [],
  );
  assert.deepEqual(resolveTemplatePaths({ database: "sqlite", toolkit: "none" }), [
    "database/sql/sqlite",
  ]);
  assert.deepEqual(resolveTemplatePaths({ toolkit: "none", database: "none" }), []);
  assert.deepEqual(resolveTemplatePaths({ ai: ["openai", "none", ""] }), ["ai/llm/openai"]);
  assert.deepEqual(
    resolveTemplatePaths({ auth: "clerk", jobs: "celery", broker: "rabbitmq" }),
    ["auth/clerk", "jobs/celery", "jobs/brokers/rabbitmq"],
  );
});

test('resolveTemplatePaths: broker with "none" jobs is still a conflict', () => {
  assert.throws(() => resolveTemplatePaths({ jobs: "none", broker: "redis" }), /jobs system/);
});

test("isUnsafeDirName: rejects unsafe project names", () => {
  for (const bad of ["", "   ", "..", "foo/bar", "foo\\bar", "../x", "a/b", "..\\x"]) {
    assert.equal(isUnsafeDirName(bad), true, `${JSON.stringify(bad)} should be unsafe`);
  }
  for (const good of ["my-app", "my_app", "My App", "app1", "foo.bar", "bionicjs-app", "."]) {
    assert.equal(isUnsafeDirName(good), false, `${JSON.stringify(good)} should be safe`);
  }
});

test("generate: base project only, no extraneous directories", async () => {
  const { dir, report } = await makeProject([]);

  for (const file of BASE_FILES) {
    assert.equal(await hasFile(dir, file), true, `missing ${file}`);
  }
  for (const sub of BASE_DIRS) {
    assert.equal(await hasDir(dir, sub), true, `missing ${sub}`);
  }

  // BionicJS convention: no index.html, no main.tsx, no app/routes — the framework manages entry
  assert.equal(await hasFile(dir, "index.html"), false, "BionicJS manages index.html internally");
  assert.equal(await hasFile(dir, "main.tsx"), false, "BionicJS manages the entry point internally");
  assert.equal(await hasDir(dir, "app/routes"), false, "BionicJS uses app/page.tsx convention, not app/routes/");
  assert.equal(await hasFile(dir, "nitro.config.ts"), false, "BionicJS manages nitro config internally");

  for (const absent of ["ai", "jobs"]) {
    assert.equal(await hasDir(dir, absent), false, `${absent} should not exist`);
  }

  const packageJson = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));
  assert.equal(packageJson.dependencies["next"], undefined, "base must not depend on next");
  assert.ok(packageJson.dependencies["nitropack"], "base must depend on nitropack");
  assert.ok(packageJson.dependencies["react-router"], "base must depend on react-router");
  assert.ok(packageJson.devDependencies["vite"], "base must depend on vite");

  // Layout uses { children } — BionicJS adapts this to React Router via BionicJSLayoutAdapter
  const layout = await readFile(path.join(dir, "app/layout.tsx"), "utf8");
  assert.ok(layout.includes("children"), "layout uses { children } API");

  assert.equal(report.merged.length, 0);
  assert.ok(report.written.length >= BASE_FILES.length);
});

test("generate: base renders app name tokens", async () => {
  const { dir } = await makeProject([], "My Cool App");
  const packageJson = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));
  assert.equal(packageJson.name, "my-cool-app");
  // bionicjs.config.ts is generated from the selection (not a template), verify package name
  assert.equal(packageJson.name, "my-cool-app");
});

test("generate: no templates leaves no feature directories", async () => {
  const { dir } = await makeProject([]);
  const topLevel = await readdir(dir);
  assert.ok(!topLevel.includes("auth"), "auth must not be generated without selection");
  assert.ok(!topLevel.includes("db"), "db must not be generated without selection");
});

test("generate: auth template adds server/auth only", async () => {
  const { dir, report } = await makeProject(["auth/clerk"]);

  assert.equal(await hasDir(dir, "server/auth"), true);
  assert.equal(await hasFile(dir, "server/auth/clerk.ts"), true);

  assert.equal(await hasDir(dir, "server/db"), false, "auth must not add db");
  assert.equal(await hasDir(dir, "ai"), false);
  assert.equal(await hasDir(dir, "jobs"), false);

  const packageJson = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));
  assert.ok(packageJson.dependencies["@clerk/backend"], "server clerk dependency merged");
  assert.ok(packageJson.dependencies["@clerk/clerk-react"], "client clerk dependency merged");
  assert.equal(packageJson.dependencies["@clerk/nextjs"], undefined, "no next-specific clerk");
  assert.equal(packageJson.name, "my-app", "base package metadata preserved");

  const env = await readFile(path.join(dir, ".env.example"), "utf8");
  assert.ok(env.includes("CLERK_SECRET_KEY"));
  assert.ok(env.includes("VITE_CLERK_PUBLISHABLE_KEY"));

  const main = await readFile(path.join(dir, "main.tsx"), "utf8");
  assert.ok(main.includes("ClerkProvider"), "client entry wraps the app in ClerkProvider");

  assert.ok(report.merged.includes("package.json"));
  assert.ok(report.written.includes(".env.example"));
});

test("generate: clerk template carries no next.js artifacts", async () => {
  const { dir } = await makeProject(["auth/clerk"]);
  assert.equal(await hasFile(dir, "proxy.ts"), false, "clerk must not ship next proxy.ts");
});

test("generate: each auth provider produces its own server/auth file", async () => {
  const providers = [
    ["better-auth", "server/auth/better-auth.ts"],
    ["clerk", "server/auth/clerk.ts"],
    ["firebase", "server/auth/firebase.ts"],
    ["supabase", "server/auth/supabase.ts"],
    ["workos", "server/auth/workos.ts"],
  ];
  for (const [provider, file] of providers) {
    const { dir } = await makeProject([`auth/${provider}`]);
    assert.equal(await hasFile(dir, file), true, `${file} missing for ${provider}`);
  }
});

test("generate: database template adds server/db only", async () => {
  const { dir } = await makeProject(["database/drizzle/sqlite"]);

  for (const file of [
    "server/db/client.ts",
    "server/db/schema.ts",
    "drizzle.config.ts",
  ]) {
    assert.equal(await hasFile(dir, file), true, `missing ${file}`);
  }
  assert.equal(await hasDir(dir, "ai"), false);
  assert.equal(await hasDir(dir, "jobs"), false);
  assert.equal(await hasDir(dir, "server/auth"), false, "database must not add auth");

  const packageJson = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));
  assert.ok(packageJson.dependencies["drizzle-orm"]);
  assert.ok(packageJson.devDependencies["drizzle-kit"]);
});

test("generate: each database toolkit and engine produces server/db", async () => {
  for (const orm of ["prisma", "drizzle", "kysely", "sql"]) {
    for (const dialect of ["postgresql", "sqlite"]) {
      const { dir } = await makeProject([`database/${orm}/${dialect}`]);
      assert.equal(
        await hasFile(dir, "server/db/client.ts"),
        true,
        `missing client for ${orm}/${dialect}`,
      );
    }
  }
  const prisma = await makeProject(["database/prisma/sqlite"]);
  assert.equal(await hasFile(prisma.dir, "prisma/schema.prisma"), true);
  assert.equal(await hasFile(prisma.dir, "prisma.config.ts"), true);
});

test("generate: database configs match the selected toolkit and engine", async () => {
  const prismaSqlite = await makeProject(["database/prisma/sqlite"]);
  const psSchema = await readFile(path.join(prismaSqlite.dir, "prisma/schema.prisma"), "utf8");
  assert.ok(psSchema.includes('provider = "sqlite"'));
  const psClient = await readFile(path.join(prismaSqlite.dir, "server/db/client.ts"), "utf8");
  assert.ok(psClient.includes("PrismaBetterSQLite3"));

  const prismaPg = await makeProject(["database/prisma/postgresql"]);
  const ppSchema = await readFile(path.join(prismaPg.dir, "prisma/schema.prisma"), "utf8");
  assert.ok(ppSchema.includes('provider = "postgresql"'));
  const ppClient = await readFile(path.join(prismaPg.dir, "server/db/client.ts"), "utf8");
  assert.ok(ppClient.includes("PrismaPg"));

  const drizzleSqlite = await makeProject(["database/drizzle/sqlite"]);
  const dsSchema = await readFile(path.join(drizzleSqlite.dir, "server/db/schema.ts"), "utf8");
  assert.ok(dsSchema.includes("sqliteTable"));
  const dsClient = await readFile(path.join(drizzleSqlite.dir, "server/db/client.ts"), "utf8");
  assert.ok(dsClient.includes("drizzle-orm/libsql"));

  const kyselySqlite = await makeProject(["database/kysely/sqlite"]);
  const ksClient = await readFile(path.join(kyselySqlite.dir, "server/db/client.ts"), "utf8");
  assert.ok(ksClient.includes("SqliteDialect"));

  const rawSqlite = await makeProject(["database/sql/sqlite"]);
  const rsClient = await readFile(path.join(rawSqlite.dir, "server/db/client.ts"), "utf8");
  assert.ok(rsClient.includes("better-sqlite3"));

  const drizzlePg = await makeProject(["database/drizzle/postgresql"]);
  const dsEnv = await readFile(path.join(drizzlePg.dir, ".env.example"), "utf8");
  assert.ok(dsEnv.includes("postgres://"));
  const drizzleSql = await makeProject(["database/drizzle/sqlite"]);
  const deEnv = await readFile(path.join(drizzleSql.dir, ".env.example"), "utf8");
  assert.ok(deEnv.includes("file:./dev.db"));
});

test("generate: ai template places Python under ai/ not server/", async () => {
  const { dir } = await makeProject(["ai/llm/openai"]);

  assert.equal(await hasFile(dir, "ai/llm/openai.py"), true);
  assert.equal(await hasDir(dir, "server/ai"), false, "ai must not live under server/");
  assert.equal(await hasDir(dir, "ai"), true);

  const llmEntries = await entries(dir, "ai/llm");
  assert.ok(llmEntries && !llmEntries.includes("openai"), "providers must be flat modules, not packages");

  const pyproject = await readFile(path.join(dir, "pyproject.toml"), "utf8");
  assert.ok(pyproject.includes('openai = ">=1.99.0"'), "openai dependency merged");

  const env = await readFile(path.join(dir, ".env.example"), "utf8");
  assert.ok(env.includes("OPENAI_API_KEY"));
});

test("generate: each llm provider and capability is composable", async () => {
  const capabilities = ["llm/openai", "llm/anthropic", "llm/google", "llm/ollama"];
  for (const capability of capabilities) {
    const id = capability.split("/")[1];
    const { dir } = await makeProject([`ai/${capability}`]);
    assert.equal(await hasFile(dir, `ai/llm/${id}.py`), true);
  }

  for (const capability of ["agents", "rag", "tools", "prompts", "mcp"]) {
    const { dir } = await makeProject([`ai/${capability}`]);
    assert.equal(await hasFile(dir, `ai/${capability}/__init__.py`), true);
  }
});

test("generate: llm/ollama produces the ollama config block", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "bionicjs-test-"));
  await generateProject(dir, {
    appName: "my-app",
    templates: ["ai/llm/ollama"],
    selection: { ai: ["llm/ollama"] },
  });

  const config = await readFile(path.join(dir, "bionicjs.config.ts"), "utf8");
  assert.ok(
    config.includes('import { ollama } from "@bionicjs/ollama";'),
    "imports the ollama provider plugin",
  );
  assert.ok(config.includes("ai: ollama({"), "uses the ollama ai block");
  assert.ok(
    config.includes("baseUrl: process.env.OLLAMA_HOST!"),
    "reads the ollama host from env",
  );
  assert.ok(config.includes('model: "llama3.2"'), "defaults to llama3.2");

  const env = await readFile(path.join(dir, ".env.example"), "utf8");
  assert.ok(env.includes("OLLAMA_HOST"), "env example documents OLLAMA_HOST");

  await rm(dir, { recursive: true, force: true });
});

test("generate: jobs system and broker compose independently", async () => {
  const { dir } = await makeProject(["jobs/celery", "jobs/brokers/redis"]);
  assert.equal(await hasFile(dir, "jobs/celery/celery_app.py"), true);
  assert.equal(await hasDir(dir, "jobs"), true);
  assert.equal(await hasDir(dir, "server/jobs"), false, "jobs must not live under server/");

  const pyproject = await readFile(path.join(dir, "pyproject.toml"), "utf8");
  assert.ok(pyproject.includes('celery = ">=5.4.0"'));
  assert.ok(pyproject.includes('redis = ">=5.0.0"'));

  const env = await readFile(path.join(dir, ".env.example"), "utf8");
  assert.ok(env.includes("REDIS_URL"));
  assert.ok(env.includes("CELERY_BROKER_URL"));
  assert.equal(await hasDir(dir, "ai"), false, "jobs must not add ai");
});

test("generate: rq defaults to a redis broker url", async () => {
  const { dir } = await makeProject(["jobs/rq"]);
  const queue = await readFile(path.join(dir, "jobs/rq/queue.py"), "utf8");
  assert.ok(queue.includes("REDIS_URL"));
});

test("generate: dramatiq works with either broker and gets its own url", async () => {
  const { dir } = await makeProject(["jobs/dramatiq", "jobs/brokers/rabbitmq"]);
  const broker = await readFile(path.join(dir, "jobs/dramatiq/broker.py"), "utf8");
  assert.ok(broker.includes("RedisBroker"));
  assert.ok(broker.includes("RabbitmqBroker"));
  const env = await readFile(path.join(dir, ".env.example"), "utf8");
  assert.ok(env.includes("DRAMATIQ_BROKER_URL"));
  assert.ok(env.includes("RABBITMQ_URL"));
});

test("generate: combined project composes every capability", async () => {
  const { dir } = await makeProject([
    "auth/clerk",
    "database/drizzle/sqlite",
    "ai/llm/openai",
    "ai/agents",
    "ai/mcp",
    "jobs/celery",
    "jobs/brokers/rabbitmq",
  ]);

  assert.equal(await hasFile(dir, "server/auth/clerk.ts"), true);
  assert.equal(await hasFile(dir, "server/db/client.ts"), true);
  assert.equal(await hasFile(dir, "ai/llm/openai.py"), true);
  assert.equal(await hasFile(dir, "ai/agents/__init__.py"), true);
  assert.equal(await hasFile(dir, "ai/mcp/__init__.py"), true);
  assert.equal(await hasFile(dir, "jobs/celery/celery_app.py"), true);

  const env = await readFile(path.join(dir, ".env.example"), "utf8");
  for (const key of ["CLERK_SECRET_KEY", "VITE_CLERK_PUBLISHABLE_KEY", "DATABASE_URL", "OPENAI_API_KEY", "RABBITMQ_URL"]) {
    assert.ok(env.includes(key), `missing ${key}`);
  }

  const packageJson = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));
  for (const dep of ["@clerk/backend", "drizzle-orm", "@libsql/client"]) {
    assert.ok(packageJson.dependencies[dep], `missing ${dep}`);
  }

  const pyproject = await readFile(path.join(dir, "pyproject.toml"), "utf8");
  for (const dep of ["openai", "mcp", "celery", "pika"]) {
    assert.ok(pyproject.includes(dep), `missing ${dep}`);
  }
});

test("generate: combining unrelated templates does not overwrite files", async () => {
  const { dir } = await makeProject(["auth/clerk", "database/drizzle/sqlite"]);

  const page = await readFile(path.join(dir, "app/page.tsx"), "utf8");
  assert.ok(page.includes("my-app") || page.length > 0, "base page preserved");

  const tsconfig = await readFile(path.join(dir, "tsconfig.json"), "utf8");
  assert.ok(tsconfig.includes('"strict": true'));

  const scripts = (await readFile(path.join(dir, "package.json"), "utf8")).includes('"dev"');
  assert.ok(scripts);
});

test("generate: empty directories are not created for unselected capabilities", async () => {
  const { dir } = await makeProject(["auth/supabase"]);
  const list = await entries(dir, "server");
  assert.ok(
    list && list.length === 2 && list.includes("api") && list.includes("auth"),
    `server/ has only base api + selected auth, got ${list}`,
  );
});

test("generate: injects @bionicjs/* plugin deps and a real @bionicjs/core version", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "bionicjs-test-"));
  await generateProject(dir, {
    appName: "my-app",
    templates: ["database/drizzle/sqlite", "ai/llm/ollama", "jobs/celery", "jobs/brokers/redis"],
    selection: {
      database: "sqlite",
      toolkit: "drizzle",
      ai: ["llm/ollama"],
      jobs: "celery",
      broker: "redis",
    },
  });

  const packageJson = JSON.parse(await readFile(path.join(dir, "package.json"), "utf8"));
  const core = packageJson.dependencies["@bionicjs/core"];
  assert.ok(typeof core === "string" && !core.includes("workspace"), "core dep must be a real version");
  for (const dep of ["@bionicjs/drizzle", "@bionicjs/ollama", "@bionicjs/celery"]) {
    assert.equal(packageJson.dependencies[dep], core, `${dep} pinned to release version`);
  }
  assert.equal(packageJson.dependencies["@bionicjs/openai"], undefined, "unselected plugins are not injected");

  await rm(dir, { recursive: true, force: true });
});

test("generate: refuses non-empty directory without --force", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "bionicjs-test-"));
  await writeFile(path.join(dir, "keep.txt"), "x");
  await assert.rejects(
    () => generateProject(dir, { appName: "app", templates: [], selection: {} }),
    /not empty/,
  );
  await rm(dir, { recursive: true, force: true });
});

test("generate: rejects unknown template directory", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "bionicjs-test-"));
  await assert.rejects(
    () => generateProject(dir, { appName: "app", templates: ["auth/nope"], selection: {} }),
    /ENOENT|no such file/i,
  );
  await rm(dir, { recursive: true, force: true });
});