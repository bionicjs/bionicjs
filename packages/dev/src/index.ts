import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { createNitro, createDevServer as createNitroDevServer, build, prepare } from "nitropack";
import type { NitroConfig } from "nitropack";
import { existsSync } from "node:fs";
import { networkInterfaces } from "node:os";
import path from "node:path";

import { bionicjsRoutesPlugin } from "./plugins/routes";
import { generateAll } from "./generator";

function getNetworkUrl(port: number) {
  const interfaces = networkInterfaces();

  for (const entries of Object.values(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family === "IPv4" && !entry.internal) {
        return `http://${entry.address}:${port}`;
      }
    }
  }

  return null;
}

export interface DevServerPaths {
  cwd: string;
  serverDir: string;
  publicDir: string;
  generatedServer: string;
}

export interface DevServerHandle {
  publicPort: number;
  nitroPort: number;
  close: () => Promise<void>;
}

/**
 * Resolve the layout a BionicJS app is expected to have, and the Nitro options
 * that make it work.
 *
 * Kept separate from `runDevServer` and free of side effects so the part that
 * actually matters can be asserted in tests: `srcDir` decides whether Nitro
 * finds `server/api` at all, and getting it wrong registers zero routes and
 * 404s every endpoint with no warning from either package.
 */
export function resolveNitroConfig(cwd: string): {
  paths: DevServerPaths;
  nitroOptions: NitroConfig;
} {
  // Nitro scans `<srcDir>/api`, `<srcDir>/routes`, `<srcDir>/middleware` and
  // `<srcDir>/plugins`. BionicJS puts all of those under `server/`, so srcDir
  // has to be the server directory — pointing rootDir at the project would
  // make Nitro look for `./api` and silently register no routes at all.
  const paths: DevServerPaths = {
    cwd,
    serverDir: path.join(cwd, "server"),
    publicDir: path.join(cwd, "public"),
    generatedServer: path.join(cwd, ".bionicjs", "server.ts"),
  };

  return {
    paths,
    nitroOptions: {
      rootDir: cwd,
      srcDir: paths.serverDir,
      dev: true,
      compatibilityDate: "2026-09-14",
      // public/ is a sibling of server/, so it cannot be resolved from srcDir.
      publicAssets: existsSync(paths.publicDir) ? [{ dir: paths.publicDir }] : [],
      // Server routes import the same generated interface the client does.
      alias: existsSync(paths.generatedServer)
        ? { "@bionicjs/core/server": paths.generatedServer }
        : {},
    },
  };
}

export async function runDevServer(
  options: { cwd?: string; ports?: { public?: number; nitro?: number } } = {},
): Promise<DevServerHandle> {
  const cwd = options.cwd || process.cwd();
  const publicPort = options.ports?.public ?? 3000;
  const nitroPort = options.ports?.nitro ?? 3001;
  const startedAt = performance.now();

  await generateAll(cwd);

  // 1. Start Nitro Programmatically
  const { paths, nitroOptions } = resolveNitroConfig(cwd);
  const nitro = await createNitro(nitroOptions);

  const nitroDevServer = createNitroDevServer(nitro);
  await nitroDevServer.listen(nitroPort);
  await prepare(nitro);
  
  // Normally `build(nitro)` is called to start the dev build loop
  build(nitro).catch(err => {
    console.error("Nitro build error:", err);
  });

  const vite = await createViteServer({
    root: cwd,
    resolve: {
      alias: [
        // Resolve #bionicjs-api to the generated .bionicjs/api-client.ts at dev time
        {
          find: /^#bionicjs-api$/,
          replacement: `${cwd}/.bionicjs/api-client.ts`,
        },
        // Resolve @bionicjs/core/server to the generated .bionicjs/server.ts
        {
          find: /^@bionicjs\/core\/server$/,
          replacement: paths.generatedServer,
        },
      ],
    },
    server: {
      port: publicPort,
      strictPort: true,
      watch: {
        ignored: ["**/node_modules/**", "**/.git/**"],
      },
      proxy: {
        "/api": `http://localhost:${nitroPort}`,
      },
    },
    plugins: [
      bionicjsRoutesPlugin(cwd),
      react(),
      // Tailwind is part of the base app (app/globals.css imports it), so the
      // plugin is registered here rather than in a user-owned vite.config.ts.
      // The user never writes a Vite config for BionicJS.
      tailwindcss(),
      {
        name: "bionicjs-html",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (
              req.headers.accept?.includes("text/html") &&
              !req.url?.startsWith("/api")
            ) {
              try {
                let html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BionicJS App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/@id/@bionicjs/core/entry-client"></script>
  </body>
</html>`;
                html = await server.transformIndexHtml(req.url ?? "/", html);
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/html");
                res.end(html);
              } catch (e) {
                return next(e);
              }
            } else {
              next();
            }
          });
        },
      },
    ],
  });

  await vite.listen();

  const networkUrl = getNetworkUrl(publicPort);
  const readyMs = Math.round(performance.now() - startedAt);

  console.log("");
  console.log("BionicJS dev server");
  console.log(`- Local:   http://localhost:${publicPort}`);
  if (networkUrl) {
    console.log(`- Network: ${networkUrl}`);
  }
  console.log(`✓ Ready in ${readyMs}ms`);

  // Returned so tests (and any embedder) can shut the server down. The CLI
  // ignores it and simply stays alive on the open listeners.
  const handle: DevServerHandle = {
    publicPort,
    nitroPort,
    close: async () => {
      await vite.close();
      await nitro.close();
    },
  };

  // Only wire up signal handling for a real `bionicjs dev` invocation, so
  // repeated calls in a test process don't accumulate listeners.
  if (options.ports === undefined) {
    const cleanup = () => {
      void handle.close();
      process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  }

  return handle;
}
