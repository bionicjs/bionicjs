import { createDatabasePlugin } from "@bionicjs/core";

export interface KyselyConfig {
  provider?: "postgres" | "sqlite" | "mysql";
  url: string;
}

export function kysely(options: KyselyConfig) {
  return createDatabasePlugin({
    name: "kysely",
    options,
    generateExports: () =>
      `export const db = {\n  // kysely client\n  query: {},\n};`,
  });
}
