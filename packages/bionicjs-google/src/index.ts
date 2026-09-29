import { createAiPlugin } from "@bionicjs/core";

export interface GoogleConfig {
  apiKey: string;
  model?: string;
  rag?: {
    enabled?: boolean;
    vectorDb?: string;
    dbUrl?: string;
    knowledgeBase?: string;
    embeddingModel?: string;
    chunkSize?: number;
    chunkOverlap?: number;
  };
  agents?: Record<string, any>;
}

export function google(options: GoogleConfig) {
  return createAiPlugin({
    name: "google",
    options,
    generateExports: (opts) =>
      `export const ai = {\n  // google (gemini) client — model: ${opts.model ?? "gemini-2.5-pro"}\n  chat: async (message: string) => message,\n};`,
  });
}