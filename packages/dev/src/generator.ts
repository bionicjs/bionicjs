import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { pathToFileURL } from "node:url";

// Helper to compile server/api to Hono router
export async function generateRPC(cwd: string) {
  const apiDir = path.join(cwd, "server", "api");
  const files = await fg("**/*.ts", { cwd: apiDir }).catch(() => []);
  
  const imports: string[] = [];
  const chains: string[] = [];
  
  imports.push(`import { Hono } from "hono";`);
  
  if (files.length === 0) {
    chains.push(`const routes = app;`);
  } else {
    chains.push(`const routes = app`);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const routePath = file.replace(/\.ts$/, "").replace(/\/index$/, "");
      const safeName = `route_${routePath.replace(/[^a-zA-Z0-9]/g, "_")}`;
      
      imports.push(`import ${safeName} from "../server/api/${file.replace(/\.ts$/, "")}";`);
      
      // Assume all functions accept a single args object and are called via POST
      chains.push(`  .post("/${routePath}", async (c) => {
    const args = await c.req.json().catch(() => undefined);
    const result = await ${safeName}(args);
    return c.json(result);
  })`);
    }
    chains[chains.length - 1] += ";";
  }

  const honoContent = `// AUTO-GENERATED
${imports.join("\n")}

const app = new Hono().basePath("/api");
${chains.join("\n")}

export type AppRouter = typeof routes;
export default app;
`;

  const apiClientContent = `// AUTO-GENERATED
import { hc } from "hono/client";
import type { AppRouter } from "./hono";

const client = hc<AppRouter>("/");
export const api = client.api;
`;

  const bionicjsDir = path.join(cwd, ".bionicjs");
  await mkdir(bionicjsDir, { recursive: true });
  await writeFile(path.join(bionicjsDir, "hono.ts"), honoContent);
  await writeFile(path.join(bionicjsDir, "api-client.ts"), apiClientContent);
}

// Helper to generate server exports from config plugins
export async function generateServerExports(cwd: string, plugins: any[]) {
  const exports: string[] = [];
  for (const plugin of plugins) {
    if (plugin.generateExports) {
      exports.push(await plugin.generateExports());
    }
  }

  const serverContent = `// AUTO-GENERATED\n${exports.join("\n\n")}\n`;
  const bionicjsDir = path.join(cwd, ".bionicjs");
  await mkdir(bionicjsDir, { recursive: true });
  await writeFile(path.join(bionicjsDir, "server.ts"), serverContent);
}

export async function loadConfig(cwd: string) {
  const configPath = path.join(cwd, "bionicjs.config.ts");
  if (!existsSync(configPath)) {
    console.warn(`No bionicjs.config.ts found in ${cwd}.`);
    return [];
  }

  let config: any;
  try {
    // Use jiti's async import, not its sync `jiti()` loader. The sync path
    // transpiles the whole import graph to CJS, so an ESM-only dependency
    // anywhere in it (vite, and anything importing vite) dies on
    // `import.meta`. The async path keeps native ESM for those.
    const { createJiti } = await import("jiti");
    const jiti = createJiti(configPath, { interopDefault: true });
    config = await jiti.import(configPath);
  } catch (err) {
    // A config that exists but throws is a real error the user must see; it is
    // not the same as "no config", and silently generating an empty server
    // module hides it until every import of auth/db/ai/jobs fails at runtime.
    console.error(`Failed to load ${configPath}:`, err);
    throw err;
  }

  // jiti's interopDefault wraps a default-only module as { default: config }.
  // Reading Object.values() off the wrapper yields one bogus plugin, so every
  // generateExports() is skipped and .bionicjs/server.ts comes out empty.
  const resolved = config?.default ?? config;
  if (typeof resolved !== "object" || resolved === null) {
    console.error(
      `${configPath} must export an object via defineConfig(). Got ${typeof resolved}.`,
    );
    return [];
  }

  return Object.values(resolved).filter(
    (value): value is any => typeof value === "object" && value !== null,
  );
}

export async function generateAll(cwd: string) {
  const plugins = await loadConfig(cwd);
  
  // Call setup on plugins
  for (const plugin of plugins) {
    if (plugin.setup) {
      await plugin.setup({});
    }
  }
  
  await generateServerExports(cwd, plugins);
  await generateRPC(cwd);
}
