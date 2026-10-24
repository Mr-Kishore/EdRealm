if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {
    // ignore
  }
}

import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index";

async function runMigration() {
  console.log("🚀 Applying Drizzle migrations to database...");
  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("✅ All migrations applied successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
