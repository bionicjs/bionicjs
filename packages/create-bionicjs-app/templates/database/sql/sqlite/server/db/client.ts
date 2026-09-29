import Database from "better-sqlite3";

const url = process.env.DATABASE_URL;

if (!url) throw new Error("DATABASE_URL is not set");

export const sql = new Database(url.replace(/^file:/, ""));