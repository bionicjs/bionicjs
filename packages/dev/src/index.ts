import { createServer as createViteServer } from "vite";
import react from "@vitejs/plugin-react";
import { createNitro, createDevServer as createNitroDevServer, build, prepare } from "nitropack";
import { networkInterfaces } from "node:os";

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

export async function runDevServer(options: { cwd?: string } = {}) {
  const cwd = options.cwd || process.cwd();
  const publicPort = 3000;
  const nitroPort = 3001;
  const startedAt = performance.now();

  await generateAll(cwd);

  // 1. Start Nitro Programmatically
  const nitro = await createNitro({
    rootDir: cwd,
    dev: true,
    compatibilityDate: '2026-09-14'
  });
  
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
          replacement: `${cwd}/.bionicjs/server.ts`,
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

  const cleanup = () => {
    vite.close();
    nitro.close();
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}
