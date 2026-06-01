import { pool, runMigrations } from "../database/db";
import { PoolClient } from "pg";
import { logger } from "../config/logger";

class CardRepository {
  async findByDeckId(deckId: string) {
    const result = await pool.query(
      `SELECT *
       FROM cards
       WHERE deck_id = $1`,
      [deckId],
    );

    return result.rows;
  }

  async findDailyQueue(userId: number, limit = 50) {
    const result = await pool.query(
      `SELECT c.id, c.front, c.back, c.stability, c.due, c.state
       FROM cards c
       JOIN decks d ON d.id = c.deck_id
       WHERE d.user_id = $1
       ORDER BY (EXTRACT(EPOCH FROM NOW() - c.due) / NULLIF(c.stability,0)) DESC NULLS LAST
       LIMIT $2`,
      [userId, limit],
    );

    return result.rows;
  }

  async findDueByDeck(deckId: string, userId: number) {
    const result = await pool.query(
      `SELECT c.*
       FROM cards c
       JOIN decks d ON d.id = c.deck_id
       WHERE c.deck_id = $1
         AND d.user_id = $2
         AND c.due <= NOW()
       ORDER BY
         CASE WHEN c.state != 0 THEN 0 ELSE 1 END,
         c.due ASC,
         c.created_at ASC`,
      [deckId, userId],
    );

    return result.rows;
  }

  async create(data: any, client?: PoolClient) {
    const db = client ?? pool;
    const result = await db.query(
      `INSERT INTO cards
        (
          deck_id,
          front,
          back,
          stability,
          difficulty,
          elapsed_days,
          scheduled_days,
          reps,
          lapses,
          state,
          due
        )
       VALUES
        (
          $1,$2,$3,$4,$5,
          $6,$7,$8,$9,$10,$11
        )
       RETURNING *`,
      [
        data.deck_id,
        data.front,
        data.back,
        data.stability,
        data.difficulty,
        data.elapsed_days,
        data.scheduled_days,
        data.reps,
        data.lapses,
        data.state,
        data.due,
      ],
    );

    return result.rows[0];
  }

  async updateFsrsData(client: PoolClient, cardId: string, data: any) {
    const result = await client.query(
      `UPDATE cards
       SET
         stability = $1,
         difficulty = $2,
         elapsed_days = $3,
         scheduled_days = $4,
         reps = $5,
         lapses = $6,
         state = $7,
         due = $8,
         last_review = $9
       WHERE id = $10
       RETURNING *`,
      [
        data.stability,
        data.difficulty,
        data.elapsed_days,
        data.scheduled_days,
        data.reps,
        data.lapses,
        data.state,
        data.due,
        data.last_review,
        cardId,
      ],
    );

    return result.rows[0];
  }

  async findById(id: string, userId: number) {
    const result = await pool.query(
      `SELECT c.*
     FROM cards c
     JOIN decks d ON d.id = c.deck_id
     WHERE c.id = $1
     AND d.user_id = $2
     LIMIT 1`,
      [id, userId],
    );

    return result.rows[0];
  }

  async update(deckId: string, cardId: string, front: string, back: string) {
    const result = await pool.query(
      `UPDATE cards SET front = $1, back = $2
       WHERE id = $3 AND deck_id = $4
       RETURNING *`,
      [front, back, cardId, deckId],
    );

    return result.rows[0];
  }

  async delete(deckId: string, cardId: string) {
    const result = await pool.query(
      `DELETE FROM cards WHERE id = $1 AND deck_id = $2 RETURNING id`,
      [cardId, deckId],
    );

    return result.rows[0];
  }
}

export const cardRepository = new CardRepository();
