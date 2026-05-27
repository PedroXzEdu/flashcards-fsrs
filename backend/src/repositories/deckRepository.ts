import { pool as client } from "../database/db";
import { PoolClient } from "pg";

class DeckRepository {
  async create(data: any) {
    const result = await client.query(
      `INSERT INTO decks (user_id, title, description, is_public)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.userId, data.title, data.description, data.is_public],
    );

    return result.rows[0];
  }

  async findByUser(userId: number) {
    const result = await client.query(
      `SELECT d.*, COUNT(c.id) AS card_count
       FROM decks d
       LEFT JOIN cards c ON c.deck_id = d.id
       WHERE d.user_id = $1
       GROUP BY d.id
       ORDER BY d.created_at DESC`,
      [userId],
    );

    return result.rows;
  }

  async findById(id: string, userId: number) {
    const result = await client.query(
      `SELECT d.*, COUNT(c.id) AS card_count
       FROM decks d
       LEFT JOIN cards c ON c.deck_id = d.id
       WHERE d.id = $1 AND d.user_id = $2
       GROUP BY d.id`,
      [id, userId],
    );

    return result.rows[0];
  }

  async update(id: string, userId: number, data: any) {
    const result = await client.query(
      `UPDATE decks
       SET title = $1, description = $2, is_public = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [data.title, data.description, data.is_public, id, userId],
    );

    return result.rows[0];
  }

  async delete(id: string, userId: number) {
    const result = await client.query(
      `DELETE FROM decks
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId],
    );

    return result.rows[0];
  }

  async exists(id: string, userId: number) {
    const result = await client.query(
      `SELECT id
       FROM decks
       WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );

    return result.rows[0];
  }

  async getCardStats(deckId: string) {
    const result = await client.query(
      `SELECT
        COUNT(*)                                  AS total,
        COUNT(*) FILTER (WHERE state = 0)         AS new_cards,
        COUNT(*) FILTER (WHERE state IN (1, 3))   AS learning,
        COUNT(*) FILTER (WHERE state = 2)         AS reviewing,
        COUNT(*) FILTER (WHERE due <= NOW())      AS due_today,
        ROUND(AVG(difficulty)::numeric, 2)        AS avg_difficulty,
        ROUND(AVG(stability)::numeric, 2)         AS avg_stability,
        COALESCE(SUM(lapses), 0)                  AS lapses
       FROM cards
       WHERE deck_id = $1`,
      [deckId],
    );

    return result.rows[0];
  }

  async getReviewStats(deckId: string, userId: number) {
    const result = await client.query(
      `SELECT
        COUNT(*)                                            AS total_reviews,
        COUNT(*) FILTER (WHERE rating = 1)                 AS again_count,
        COUNT(*) FILTER (WHERE rating = 2)                 AS hard_count,
        COUNT(*) FILTER (WHERE rating = 3)                 AS good_count,
        COUNT(*) FILTER (WHERE rating = 4)                 AS easy_count,
        ROUND(
          COUNT(*) FILTER (WHERE rating >= 2)::numeric
          / NULLIF(COUNT(*), 0) * 100, 1
        )                                                  AS retention_rate
       FROM review_logs rl
       JOIN cards c ON c.id = rl.card_id
       WHERE c.deck_id = $1 AND rl.user_id = $2`,
      [deckId, userId],
    );

    return result.rows[0];
  }

  async updateSettings(id: string, userId: number, newCardsPerDay: number) {
    const result = await client.query(
      `UPDATE decks
       SET new_cards_per_day = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [newCardsPerDay, id, userId],
    );

    return result.rows[0];
  }

  async findByIdRaw(id: string, userId: number) {
    const result = await client.query(
      `SELECT *
       FROM decks
       WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );

    return result.rows[0];
  }

  async updateShareToken(deckId: string, token: string) {
    const result = await client.query(
      `UPDATE decks
       SET share_token = $1
       WHERE id = $2
       RETURNING *`,
      [token, deckId],
    );

    return result.rows[0];
  }

  async removeShareToken(deckId: string, userId: number) {
    const result = await client.query(
      `UPDATE decks
       SET share_token = NULL
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [deckId, userId],
    );

    return result.rows[0];
  }

  async findByShareToken(token: string) {
    const result = await client.query(
      `SELECT *
       FROM decks
       WHERE share_token = $1`,
      [token],
    );

    return result.rows[0];
  }

  async getSharedDeckPreview(token: string) {
    const result = await client.query(
      `SELECT
        d.title,
        d.description,
        COUNT(c.id) AS card_count
       FROM decks d
       LEFT JOIN cards c ON c.deck_id = d.id
       WHERE d.share_token = $1
       GROUP BY d.id`,
      [token],
    );

    return result.rows[0];
  }

  async createCopy(
    client: PoolClient,
    userId: number,
    title: string,
    description: string,
  ) {
    const result = await client.query(
      `INSERT INTO decks
        (
          user_id,
          title,
          description,
          is_public
        )
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [userId, title, description],
    );

    return result.rows[0];
  }
}

export const deckRepository = new DeckRepository();
