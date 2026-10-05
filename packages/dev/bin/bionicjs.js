#!/usr/bin/env node

const command = process.argv[2];

if (command === "dev" || !command) {
  // Native dynamic import, not jiti. @bionicjs/dev ships ESM and its
  // dependencies (vite, nitropack) are ESM-only, so jiti transpiling our dist
  // to CJS makes it CJS-require vite, which dies on vite's `import.meta`.
  // jiti is still used inside loadConfig, where it is genuinely needed to
  // read the user's TypeScript bionicjs.config.ts.
  const { runDevServer } = await import("@bionicjs/dev");
  runDevServer().catch((err) => {
    console.error("Error starting BionicJS dev server:", err);
    process.exit(1);
  });
} else {
  console.log(`Unknown command: ${command}`);
  console.log("Usage: bionicjs dev");
  process.exit(1);
}
