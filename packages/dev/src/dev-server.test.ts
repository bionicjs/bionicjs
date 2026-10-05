import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveNitroConfig, runDevServer } from "./index";

// Anchor to this file rather than process.cwd(), so the test behaves the same
// whether it runs from the repo root or from the package directory.
const testDir = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(testDir, "..");
const repoRoot = path.resolve(pkgRoot, "../..");
const storeDir = path.join(repoRoot, "node_modules/.pnpm");
const testAppDir = path.join(pkgRoot, "scratch/dev-server-test-app");

let passed = 0;
let failed = 0;

function check(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${error instanceof Error ? error.message : String(error)}`);
  }
}

/** Every h3 version present in the pnpm store. */
function storeH3Versions(): string[] {
  if (!fs.existsSync(storeDir)) return [];
  return fs
    .readdirSync(storeDir)
    .map((entry) => /^h3@(\d+\.\d+\.\d+)/.exec(entry)?.[1])
    .filter((version): version is string => Boolean(version));
}

/**
 * Resolve a package's real directory in the pnpm store. Store dir names carry
 * peer-dependency suffixes (`react-dom@19.3.0_react@19.3.0`), so the directory
 * has to be matched by prefix rather than reconstructed.
 */
function storePathFor(name: string, version: string) {
  const entry = fs
    .readdirSync(storeDir)
    .find((e) => new RegExp(`^${name.replace("/", "\\/")}@${version.replace(/\./g, "\\.")}(_|$)`).test(e));
  assert.ok(entry, `${name}@${version} is not in the pnpm store`);
  return path.join(storeDir, entry, "node_modules", name);
}

/** Link packages out of the pnpm store into the test app's node_modules. */
function link(name: string, version: string) {
  const target = storePathFor(name, version);
  const link = path.join(testAppDir, "node_modules", name);
  fs.mkdirSync(path.dirname(link), { recursive: true });
  fs.symlinkSync(target, link, "dir");
}

function linkH3() {
  const versions = storeH3Versions();
  assert.equal(versions.length, 1, `expected exactly one h3 in the store, found: ${versions.join(", ")}`);
  link("h3", versions[0]);
  return versions[0];
}

/** React is only needed so Vite's dep optimizer does not warn about the fixture. */
function linkReact() {
  for (const name of ["react", "react-dom"]) {
    const version = fs
      .readdirSync(storeDir)
      .map((entry) => new RegExp(`^${name}@(\\d+\\.\\d+\\.\\d+)`).exec(entry)?.[1])
      .find(Boolean);
    if (version) link(name, version);
  }
}

function writeApp() {
  fs.rmSync(testAppDir, { recursive: true, force: true });

  fs.mkdirSync(path.join(testAppDir, "app"), { recursive: true });
  fs.mkdirSync(path.join(testAppDir, "server/api"), { recursive: true });
  fs.mkdirSync(path.join(testAppDir, "public"), { recursive: true });

  fs.writeFileSync(
    path.join(testAppDir, "app/layout.tsx"),
    `export default function RootLayout({ children }: { children: any }) { return children; }`,
  );
  fs.writeFileSync(
    path.join(testAppDir, "app/page.tsx"),
    `export default function HomePage() { return "Home"; }`,
  );
  fs.writeFileSync(path.join(testAppDir, "app/globals.css"), `@import "tailwindcss";\n`);
  fs.writeFileSync(path.join(testAppDir, "bionicjs.config.ts"), `export default { port: 3000 };\n`);

  // Byte-for-byte the base template's route. This is the thing under test: a
  // version drift between this file's h3 and Nitro's h3 is what made every
  // endpoint 404 with no error from either package.
  fs.writeFileSync(
    path.join(testAppDir, "server/api/health.ts"),
    fs.readFileSync(
      path.join(pkgRoot, "../create-bionicjs-app/templates/base/server/api/health.ts"),
      "utf8",
    ),
  );

  fs.writeFileSync(
    path.join(testAppDir, "public/favicon.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" />`,
  );

  fs.writeFileSync(
    path.join(testAppDir, "package.json"),
    `${JSON.stringify(
      { name: "dev-server-test-app", private: true, type: "module", scripts: { dev: "bionicjs dev" } },
      null,
      2,
    )}\n`,
  );
}

async function get(url: string) {
  const response = await fetch(url);
  return { status: response.status, body: await response.text() };
}

async function run() {
  console.log("dev-server integration tests");
  console.log(`app: ${testAppDir}\n`);

  writeApp();

  // 1. Dependency integrity. Two majors of h3 means two module instances, which
  //    means a silent total 404. This is the regression that cost a day.
  console.log("h3 dependency integrity");
  check("the pnpm store holds exactly one h3 version", () => {
    const versions = storeH3Versions();
    assert.deepEqual(versions, ["1.15.11"]);
  });

  check("the lockfile pins h3 to that same single version", () => {
    const lock = fs.readFileSync(path.join(repoRoot, "pnpm-lock.yaml"), "utf8");
    const pinned = [...lock.matchAll(/^\s+h3: (\S+)$/gm)].map((m) => m[1]);
    assert.ok(pinned.length > 0, "no h3 entries found in the lockfile");
    assert.deepEqual([...new Set(pinned)], ["1.15.11"]);
  });

  check("the template pins the same range nitropack depends on", () => {
    const template = JSON.parse(
      fs.readFileSync(
        path.join(pkgRoot, "../create-bionicjs-app/templates/base/package.json"),
        "utf8",
      ),
    );
    const nitropack = JSON.parse(
      fs.readFileSync(
        fs.readdirSync(storeDir)
          .filter((e) => e.startsWith("nitropack@2.13.4"))
          .map((e) => path.join(storeDir, e, "node_modules/nitropack/package.json"))[0],
        "utf8",
      ),
    );
    assert.equal(template.dependencies.h3, nitropack.dependencies.h3);
  });

  // 2. Pure config: what decides whether routes are found at all.
  console.log("\nresolveNitroConfig");
  const { paths, nitroOptions } = resolveNitroConfig(testAppDir);

  check("srcDir is the server directory, not the project root", () => {
    assert.equal(nitroOptions.srcDir, path.join(testAppDir, "server"));
  });

  check("rootDir is the project root", () => {
    assert.equal(nitroOptions.rootDir, testAppDir);
  });

  check("public/ is passed explicitly, since it sits outside srcDir", () => {
    assert.deepEqual(nitroOptions.publicAssets, [{ dir: path.join(testAppDir, "public") }]);
  });

  check("no publicAssets when the app has no public/ dir", () => {
    const bare = path.join(testAppDir, "no-public-here");
    assert.deepEqual(resolveNitroConfig(bare).nitroOptions.publicAssets, []);
  });

  check("aliases @bionicjs/core/server once generation has produced it", () => {
    // generateAll() has not run yet, so there is nothing to point at.
    assert.deepEqual(nitroOptions.alias, {});
    assert.equal(paths.generatedServer, path.join(testAppDir, ".bionicjs", "server.ts"));
  });

  // 3. End to end: a real Nitro + Vite pair serving a real h3 route.
  console.log("\nrunDevServer");
  linkH3();
  linkReact();

  const publicPort = 4310;
  const nitroPort = 4311;
  const handle = await runDevServer({ cwd: testAppDir, ports: { public: publicPort, nitro: nitroPort } });

  try {
    check("generates the .bionicjs modules", () => {
      assert.ok(fs.existsSync(path.join(testAppDir, ".bionicjs", "server.ts")));
    });

    const direct = await get(`http://localhost:${nitroPort}/api/health`);
    check("GET /api/health on Nitro returns 200 {status:'ok'}", () => {
      assert.equal(direct.status, 200, `expected 200, got ${direct.status}`);
      assert.deepEqual(JSON.parse(direct.body), { status: "ok" });
    });

    const proxied = await get(`http://localhost:${publicPort}/api/health`);
    check("GET /api/health through the Vite proxy returns the same", () => {
      assert.equal(proxied.status, 200, `expected 200, got ${proxied.status}`);
      assert.deepEqual(JSON.parse(proxied.body), { status: "ok" });
    });

    const favicon = await get(`http://localhost:${publicPort}/favicon.svg`);
    check("static assets from public/ are served through Vite", () => {
      assert.equal(favicon.status, 200, `expected 200, got ${favicon.status}`);
    });
  } finally {
    await handle.close();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
