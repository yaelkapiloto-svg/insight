import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Vercel Postgres uses POSTGRES_URL_NON_POOLING for migrations
    url: (process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL)!,
  },
} satisfies Config;
