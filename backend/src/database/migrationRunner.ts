import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { logger } from "../config/logger";

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

export async function runMigrations(pool: Pool) {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const { rows: executed } = await client.query(
      "SELECT name FROM _migrations ORDER BY name",
    );
    const executedSet = new Set(executed.map((r: { name: string }) => r.name));

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (executedSet.has(file)) {
        logger.debug({ migration: file }, "Migration already executed, skipping");
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        logger.info({ migration: file }, "Migration executed");
      } catch (err) {
        await client.query("ROLLBACK");
        logger.error({ migration: file, err }, "Migration failed");
        throw err;
      }
    }

    logger.info("All migrations executed successfully");
  } finally {
    client.release();
  }
}
