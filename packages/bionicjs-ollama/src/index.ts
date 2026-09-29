import { createAiPlugin } from "@bionicjs/core";

export interface OllamaConfig {
  baseUrl?: string;
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

export function ollama(options: OllamaConfig) {
  return createAiPlugin({
    name: "ollama",
    options,
    generateExports: (opts) =>
      `export const ai = {\n  // ollama client — model: ${opts.model ?? "llama3.2"}\n  chat: async (message: string) => message,\n};`,
  });
}