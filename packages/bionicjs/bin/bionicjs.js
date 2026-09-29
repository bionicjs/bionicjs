#!/usr/bin/env node

import { createJiti } from "jiti";
import { fileURLToPath } from "node:url";

const jiti = createJiti(fileURLToPath(import.meta.url));

const command = process.argv[2];

if (command === "dev" || !command) {
  const { runDevServer } = await jiti.import("@bionicjs/dev");
  runDevServer().catch((err) => {
    console.error("Error starting BionicJS dev server:", err);
    process.exit(1);
  });
} else {
  console.log(`Unknown command: ${command}`);
  console.log("Usage: bionicjs dev");
  process.exit(1);
}
