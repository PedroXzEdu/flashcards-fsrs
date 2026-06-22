import { Pool } from "pg";
import { runMigrations as runVersionedMigrations } from "../../../database/migrationRunner";

let pool: Pool | null = null;

export function getTestPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }
  return pool;
}

export async function runMigrations() {
  const p = getTestPool();
  await runVersionedMigrations(p);
}

export async function cleanDatabase() {
  const p = getTestPool();
  await p.query("TRUNCATE review_logs, cards, decks, users CASCADE");
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export { Pool };
