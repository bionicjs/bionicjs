import { createAuthPlugin } from "@bionicjs/core";

export interface BetterAuthConfig {
  emailAndPassword?: { enabled: boolean };
  socialProviders?: Record<string, {
    clientId: string;
    clientSecret: string;
  }>;
  [key: string]: any;
}

export function betterAuth(options: BetterAuthConfig) {
  return createAuthPlugin({
    name: "better-auth",
    options,
    path: "/api/auth/[...auth]",
    generateExports: () =>
      `export const auth = {\n  getSession: async () => null,\n  requireAuth: async () => null,\n};`,
  });
}
