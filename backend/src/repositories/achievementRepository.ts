import { pool } from "../database/db";

export interface AchievementRow {
  id: number;
  user_id: number;
  key: string;
  unlocked_at: Date;
}

class AchievementRepository {
  async findByUser(userId: number): Promise<AchievementRow[]> {
    const result = await pool.query(
      `SELECT * FROM achievements WHERE user_id = $1 ORDER BY unlocked_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async findByUserAndKey(userId: number, key: string): Promise<AchievementRow | undefined> {
    const result = await pool.query(
      `SELECT * FROM achievements WHERE user_id = $1 AND key = $2 LIMIT 1`,
      [userId, key],
    );
    return result.rows[0];
  }

  async create(userId: number, key: string): Promise<AchievementRow> {
    const result = await pool.query(
      `INSERT INTO achievements (user_id, key) VALUES ($1, $2) RETURNING *`,
      [userId, key],
    );
    return result.rows[0];
  }
}

export const achievementRepository = new AchievementRepository();
