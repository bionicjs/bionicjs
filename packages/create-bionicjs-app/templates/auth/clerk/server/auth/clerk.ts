import { createClerkClient } from "@clerk/backend";

const secretKey = process.env.CLERK_SECRET_KEY;

if (!secretKey) throw new Error("CLERK_SECRET_KEY is not set");

export const clerkClient = createClerkClient({ secretKey });