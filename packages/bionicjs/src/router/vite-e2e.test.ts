import { createServer as createViteServer } from "vite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bionicjsRoutesPlugin } from "../../../dev/src/plugins/routes";

// Anchor every path to this file rather than process.cwd(), so the test behaves
// the same whether it runs from the repo root or from the package directory.
const testDir = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(testDir, "../..");
const testAppDir = path.join(pkgRoot, "scratch/test-app");
const bionicjsRouterPath = path.join(testDir, "index.ts");

if (!fs.existsSync(bionicjsRouterPath)) {
  throw new Error(`Alias target does not exist: ${bionicjsRouterPath}`);
}

function setupTestApp() {
  console.log("📁 Setting up temporary test application in:", testAppDir);
  if (fs.existsSync(testAppDir)) {
    fs.rmSync(testAppDir, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(testAppDir, "app/about"), { recursive: true });
  fs.mkdirSync(path.join(testAppDir, "app/users/[id]"), { recursive: true });

  fs.writeFileSync(
    path.join(testAppDir, "app/layout.tsx"),
    `export default function RootLayout({ children }: { children: any }) { return children; }`
  );
  fs.writeFileSync(
    path.join(testAppDir, "app/page.tsx"),
    `export default function HomePage() { return "Home"; }`
  );
  fs.writeFileSync(
    path.join(testAppDir, "app/about/page.tsx"),
    `export default function AboutPage() { return "About"; }`
  );
  fs.writeFileSync(
    path.join(testAppDir, "app/users/[id]/page.tsx"),
    `export default function UserPage() { return "User"; }`
  );
}

async function runViteE2ETest() {
  setupTestApp();

  console.log("🚀 Starting programmatic Vite server with bionicjsRoutesPlugin...");
  
  const reactPath = fileURLToPath(import.meta.resolve("react"));
  const reactRouterPath = fileURLToPath(import.meta.resolve("react-router"));

  const vite = await createViteServer({
    root: testAppDir,
    resolve: {
      alias: [
        { find: "@bionicjs/core/router", replacement: bionicjsRouterPath },
        { find: /^react$/, replacement: reactPath },
        { find: /^react-router$/, replacement: reactRouterPath },
      ],
    },
    server: {
      middlewareMode: true,
      watch: null, // Disable filesystem chokidar watcher to avoid inotify ENOSPC limits during test
      fs: {
        allow: [pkgRoot, testAppDir],
      },
    },
    appType: "custom",
    plugins: [
      bionicjsRoutesPlugin(testAppDir),
    ],
  });

  try {
    // Test 1: Load virtual module code via Vite transformRequest
    console.log("⚡ Testing Vite virtual:bionicjs-routes transform...");
    const res1 = await vite.transformRequest("virtual:bionicjs-routes");
    if (!res1 || !res1.code) {
      throw new Error("Failed to transform virtual:bionicjs-routes");
    }

    console.log("Transformed virtual:bionicjs-routes code length:", res1.code.length);
    if (!res1.code.includes('path: "about"')) {
      throw new Error("Transformed module missing about route path");
    }
    console.log("✅ Initial virtual:bionicjs-routes load successful!");

    // Test 2: HMR Route Addition - Create app/contact/page.tsx
    console.log("➕ Testing HMR: Creating app/contact/page.tsx...");
    const contactDir = path.join(testAppDir, "app/contact");
    fs.mkdirSync(contactDir, { recursive: true });
    const contactFile = path.join(contactDir, "page.tsx");
    fs.writeFileSync(contactFile, `export default function ContactPage() { return "Contact"; }`);

    const mod = vite.moduleGraph.getModuleById("\0virtual:bionicjs-routes");
    if (mod) {
      vite.moduleGraph.invalidateModule(mod);
    }

    const res2 = await vite.transformRequest("virtual:bionicjs-routes");
    if (!res2?.code.includes('path: "contact"')) {
      throw new Error("Virtual module failed to include new /contact route after file creation");
    }
    console.log("✅ HMR route addition test passed!");

    // Test 3: HMR Route Deletion - Remove app/contact/page.tsx
    console.log("🗑️ Testing HMR: Deleting app/contact/page.tsx...");
    fs.rmSync(contactFile);
    if (mod) {
      vite.moduleGraph.invalidateModule(mod);
    }

    const res3 = await vite.transformRequest("virtual:bionicjs-routes");
    if (res3?.code.includes('path: "contact"')) {
      throw new Error("Virtual module still contains /contact route after file deletion");
    }
    console.log("✅ HMR route deletion test passed!");

    // Test 4: HMR Layout Addition - Add app/about/layout.tsx
    console.log("📐 Testing HMR: Adding nested app/about/layout.tsx...");
    const aboutLayoutFile = path.join(testAppDir, "app/about/layout.tsx");
    fs.writeFileSync(aboutLayoutFile, `export default function AboutLayout({ children }: any) { return children; }`);
    if (mod) {
      vite.moduleGraph.invalidateModule(mod);
    }

    const res4 = await vite.transformRequest("virtual:bionicjs-routes");
    if (!res4?.code.includes("/app/about/layout.tsx")) {
      throw new Error("Virtual module missing newly added /app/about/layout.tsx");
    }
    console.log("✅ HMR layout addition test passed!");

    console.log("\n🎉 ALL VITE VIRTUAL ROUTE PLUGIN & HMR E2E TESTS PASSED!");
  } finally {
    await vite.close();
  }
}

runViteE2ETest().catch((err) => {
  console.error("❌ Vite E2E test failed:", err);
  process.exit(1);
});
