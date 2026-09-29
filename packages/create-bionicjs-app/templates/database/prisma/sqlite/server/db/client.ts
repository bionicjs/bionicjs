import "dotenv/config";

import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";

const url = process.env.DATABASE_URL;

if (!url) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaBetterSQLite3({ url });

export const prisma = new PrismaClient({ adapter });