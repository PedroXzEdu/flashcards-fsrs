import { Pool } from "pg";
import fs from "fs";
import path from "path";

import { env } from "../config/env";
import { logger } from "../config/logger";

export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
});

export async function runMigrations() {
  const sql = fs.readFileSync(path.join(__dirname, "migrations.sql"), "utf-8");
  await pool.query(sql);
  logger.info("Migrações executadas com sucesso!");
}
