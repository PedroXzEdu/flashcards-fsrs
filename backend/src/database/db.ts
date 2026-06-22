import { Pool } from "pg";

import { env } from "../config/env";
import { logger } from "../config/logger";
import { runMigrations as runVersionedMigrations } from "./migrationRunner";

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
});

export async function ping(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export async function runMigrations() {
  await runVersionedMigrations(pool);
  logger.info("Migrações executadas com sucesso!");
}
