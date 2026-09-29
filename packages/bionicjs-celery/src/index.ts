import { createJobsPlugin } from "@bionicjs/core";

export interface CeleryConfig {
  broker: string;
}

export function celery(options: CeleryConfig) {
  return createJobsPlugin({
    name: "celery",
    options,
    generateExports: () =>
      `export const jobs = {\n  enqueue: async (task: string, args?: unknown) => true,\n};`,
  });
}
