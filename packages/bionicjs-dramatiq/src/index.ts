import { createJobsPlugin } from "@bionicjs/core";

export interface DramatiqConfig {
  broker: string;
}

export function dramatiq(options: DramatiqConfig) {
  return createJobsPlugin({
    name: "dramatiq",
    options,
    generateExports: () =>
      `export const jobs = {\n  enqueue: async (task: string, args?: unknown) => true,\n};`,
  });
}
