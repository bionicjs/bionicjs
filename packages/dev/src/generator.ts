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
      
      imports.push(`import ${safeName} from "../server/api/${file}";`);
      
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
${imports.join("\\n")}

const app = new Hono().basePath("/api");
${chains.join("\\n")}

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

  const serverContent = `// AUTO-GENERATED\\n` + exports.join("\\n\\n");
  const bionicjsDir = path.join(cwd, ".bionicjs");
  await mkdir(bionicjsDir, { recursive: true });
  await writeFile(path.join(bionicjsDir, "server.ts"), serverContent);
}

export async function loadConfig(cwd: string) {
  const configPath = path.join(cwd, "bionicjs.config.ts");
  try {
    // using tsx or dynamic import requires some esbuild logic in dev,
    // but for now let's just dynamic import it (assuming Node can load it if compiled, 
    // or we can use jiti).
    // In a real framework, we use jiti or c12 to load bionicjs.config.ts.
    const jiti = (await import("jiti")).default;
    const load = jiti(cwd, { interopDefault: true });
    const config = load(configPath);
    
    // Convert config object values to array of plugins
    return Object.values(config) as any[];
  } catch (err) {
    console.warn("No bionicjs.config.ts found or failed to load.", err);
    return [];
  }
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
