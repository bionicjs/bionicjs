import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

const url = process.env.DATABASE_URL;

if (!url) throw new Error("DATABASE_URL is not set");

const client = createClient({ url });

export const db = drizzle({ client, schema });