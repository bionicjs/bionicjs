import { createDatabasePlugin } from "@bionicjs/core";

export interface PrismaConfig {
  provider?: "postgres" | "sqlite" | "mysql";
  url: string;
}

export function prisma(options: PrismaConfig) {
  return createDatabasePlugin({
    name: "prisma",
    options,
    generateExports: () =>
      `export const db = {\n  // prisma client\n  query: {},\n};`,
  });
}
