import { WorkOS } from "@workos-inc/node";

const apiKey = process.env.WORKOS_API_KEY;

if (!apiKey) throw new Error("WORKOS_API_KEY is not set");

export const workos = new WorkOS(apiKey);