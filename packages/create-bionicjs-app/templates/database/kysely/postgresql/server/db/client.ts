import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import type { Database } from "./types";

const url = process.env.DATABASE_URL;

if (!url) throw new Error("DATABASE_URL is not set");

const dialect = new PostgresDialect({
  pool: new Pool({ connectionString: url }),
});

export const db = new Kysely<Database>({ dialect });