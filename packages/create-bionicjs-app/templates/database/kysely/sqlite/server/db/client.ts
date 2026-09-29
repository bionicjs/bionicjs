import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

import type { Database as DatabaseSchema } from "./types";

const url = process.env.DATABASE_URL;

if (!url) throw new Error("DATABASE_URL is not set");

const dialect = new SqliteDialect({
  database: new Database(url.replace(/^file:/, "")),
});

export const db = new Kysely<DatabaseSchema>({ dialect });