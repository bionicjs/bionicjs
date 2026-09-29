import { createAiPlugin } from "@bionicjs/core";

export interface OpenAIConfig {
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

export function openai(options: OpenAIConfig) {
  return createAiPlugin({
    name: "openai",
    options,
    generateExports: (opts) =>
      `export const ai = {\n  // openai client — model: ${opts.model ?? "gpt-4o"}\n  chat: async (message: string) => message,\n};`,
  });
}
