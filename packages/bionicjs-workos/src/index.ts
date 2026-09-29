import { createAuthPlugin } from "@bionicjs/core";

export interface WorkOSConfig {
  apiKey: string;
  clientId: string;
  redirectUri: string;
}

export function workos(options: WorkOSConfig) {
  return createAuthPlugin({
    name: "workos",
    options,
    path: "/api/auth/callback",
    generateExports: () =>
      `export const auth = {\n  getSession: async () => null,\n  requireAuth: async () => null,\n};`,
  });
}
