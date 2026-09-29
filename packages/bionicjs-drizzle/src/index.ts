import { createDatabasePlugin } from "@bionicjs/core";

export interface DrizzleConfig {
  provider: "postgres" | "sqlite" | "mysql";
  url: string;
}

export function drizzle(options: DrizzleConfig) {
  return createDatabasePlugin({
    name: "drizzle",
    options,
    generateExports: (opts) =>
      `export const db = {\n  // drizzle client — provider: ${opts.provider}\n  query: {},\n};`,
  });
}
