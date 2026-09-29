import { createDatabasePlugin } from "@bionicjs/core";

export interface SqlConfig {
  provider?: "postgres" | "sqlite" | "mysql";
  url: string;
}

export function sql(options: SqlConfig) {
  return createDatabasePlugin({
    name: "sql",
    options,
    generateExports: () =>
      `export const db = {\n  // raw sql client\n  query: async () => ({ rows: [] }),\n};`,
  });
}
