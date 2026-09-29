import { createAuthPlugin } from "@bionicjs/core";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function supabase(options: SupabaseConfig) {
  return createAuthPlugin({
    name: "supabase",
    options,
    generateExports: () =>
      `export const auth = {\n  getSession: async () => null,\n  requireAuth: async () => null,\n};`,
  });
}
