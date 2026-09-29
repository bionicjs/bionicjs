import { createAuthPlugin } from "@bionicjs/core";

export interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export function firebase(options: FirebaseConfig) {
  return createAuthPlugin({
    name: "firebase",
    options,
    generateExports: () =>
      `export const auth = {\n  getSession: async () => null,\n  requireAuth: async () => null,\n};`,
  });
}
