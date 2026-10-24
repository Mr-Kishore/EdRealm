import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
};

const isProduction = process.env.NODE_ENV === "production";
const isVercel = Boolean(process.env.VERCEL);
const connectionString = process.env.DATABASE_URL || "postgresql://edrealm:edrealm_dev@localhost:5432/edrealm_db";

const isLocalhost = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

const requiresSsl = Boolean(
  connectionString.includes("sslmode=require") ||
  connectionString.includes("neon.tech") ||
  connectionString.includes("supabase.co") ||
  connectionString.includes("render.com") ||
  connectionString.includes("aivencloud.com") ||
  connectionString.includes("railway.app") ||
  process.env.PGSSLMODE === "require" ||
  ((isProduction || isVercel) && !isLocalhost)
);

export const pool =
  globalForDb.conn ??
  new Pool({
    connectionString,
    max: isVercel ? 2 : (isProduction ? 10 : 20),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ...(requiresSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

if (!isProduction) {
  globalForDb.conn = pool;
}

export const db = drizzle(pool, { schema });

