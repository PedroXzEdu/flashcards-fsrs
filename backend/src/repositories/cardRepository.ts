import { pool as client } from "../database/db";
import { PoolClient } from "pg";

class CardRepository {
  async findByDeckId(deckId: string) {
    const result = await client.query(
      `SELECT *
       FROM cards
       WHERE deck_id = $1`,
      [deckId],
    );

    return result.rows;
  }

  async findDueByDeck(deckId: string, userId: number) {
    const result = await client.query(
      `SELECT c.*
       FROM cards c
       JOIN decks d ON d.id = c.deck_id
       WHERE c.deck_id = $1
         AND d.user_id = $2
         AND c.due <= NOW()
       ORDER BY c.due ASC, c.created_at ASC`,
      [deckId, userId],
    );

    return result.rows;
  }

  async create(client: PoolClient, data: any) {
    const result = await client.query(
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
    const result = await client.query(
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
}

export const cardRepository = new CardRepository();
