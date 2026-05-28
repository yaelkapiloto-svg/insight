import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Vercel Postgres uses POSTGRES_URL; fallback to DATABASE_URL for other providers
const connectionString =
  process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: connectionString?.includes("vercel") || connectionString?.includes("neon")
    ? { rejectUnauthorized: false }
    : false,
});

export const db = drizzle(pool, { schema });
export * from "./schema";
