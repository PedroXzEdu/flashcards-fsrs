import { Pool } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function runMigrations() {
  const sql = fs.readFileSync(path.join(__dirname, "migrations.sql"), "utf-8");
  await pool.query(sql);
  console.log("Migrações executadas com sucesso!");
}
