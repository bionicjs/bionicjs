import { createAiPlugin } from "@bionicjs/core";

export interface AnthropicConfig {
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

export function anthropic(options: AnthropicConfig) {
  return createAiPlugin({
    name: "anthropic",
    options,
    generateExports: (opts) =>
      `export const ai = {\n  // anthropic client — model: ${opts.model ?? "claude-sonnet-4-5"}\n  chat: async (message: string) => message,\n};`,
  });
}
