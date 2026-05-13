import { PoolClient } from "pg";

class ReviewLogRepository {
  async create(client: PoolClient, data: any) {
    const result = await client.query(
      `INSERT INTO review_logs
        (
          user_id,
          card_id,
          rating,
          state,
          stability,
          difficulty,
          elapsed_days,
          scheduled_days,
          review
        )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.user_id,
        data.card_id,
        data.rating,
        data.state,
        data.stability,
        data.difficulty,
        data.elapsed_days,
        data.scheduled_days,
        data.review,
      ],
    );

    return result.rows[0];
  }
}

export const reviewLogRepository = new ReviewLogRepository();
