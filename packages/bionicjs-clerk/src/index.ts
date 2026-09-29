import { createAuthPlugin } from "@bionicjs/core";

export interface ClerkConfig {
  secretKey: string;
  publishableKey: string;
}

export function clerk(options: ClerkConfig) {
  return createAuthPlugin({
    name: "clerk",
    options,
    path: "/api/auth/[...clerk]",
    generateExports: () =>
      `export const auth = {\n  getSession: async () => null,\n  requireAuth: async () => null,\n};`,
  });
}
