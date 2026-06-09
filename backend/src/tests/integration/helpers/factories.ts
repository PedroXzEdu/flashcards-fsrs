import bcrypt from "bcryptjs";
import { getTestPool } from "./db";

export async function createUser(overrides: Record<string, unknown> = {}) {
  const p = getTestPool();
  const password = await bcrypt.hash("password123", 10);
  const result = await p.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [
      overrides.name || "Test User",
      overrides.email || "test@test.com",
      overrides.password || password,
    ],
  );
  return result.rows[0];
}

export async function createDeck(
  userId: number,
  overrides: Record<string, unknown> = {},
) {
  const p = getTestPool();
  const result = await p.query(
    `INSERT INTO decks (user_id, title, description, is_public)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      userId,
      overrides.title || "Test Deck",
      overrides.description || null,
      overrides.is_public ?? false,
    ],
  );
  return result.rows[0];
}

export async function createCard(
  deckId: number,
  overrides: Record<string, unknown> = {},
) {
  const p = getTestPool();
  const result = await p.query(
    `INSERT INTO cards (deck_id, front, back, stability, difficulty, elapsed_days, scheduled_days, reps, lapses, state, due)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      deckId,
      overrides.front || "Test Front",
      overrides.back || "Test Back",
      overrides.stability ?? 0,
      overrides.difficulty ?? 0,
      overrides.elapsed_days ?? 0,
      overrides.scheduled_days ?? 0,
      overrides.reps ?? 0,
      overrides.lapses ?? 0,
      overrides.state ?? 0,
      overrides.due || new Date(),
    ],
  );
  return result.rows[0];
}

export async function createReviewLog(
  cardId: number,
  userId: number,
  overrides: Record<string, unknown> = {},
) {
  const p = getTestPool();
  const result = await p.query(
    `INSERT INTO review_logs (card_id, user_id, rating, state, stability, difficulty, elapsed_days, scheduled_days)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      cardId,
      userId,
      overrides.rating ?? 3,
      overrides.state ?? 2,
      overrides.stability ?? 5,
      overrides.difficulty ?? 0,
      overrides.elapsed_days ?? 1,
      overrides.scheduled_days ?? 1,
    ],
  );
  return result.rows[0];
}
