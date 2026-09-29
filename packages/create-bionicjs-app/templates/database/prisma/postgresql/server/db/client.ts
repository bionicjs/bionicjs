import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const url = process.env.DATABASE_URL;

if (!url) throw new Error("DATABASE_URL is not set");

const adapter = new PrismaPg({ connectionString: url });

export const prisma = new PrismaClient({ adapter });