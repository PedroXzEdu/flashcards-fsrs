import { pool } from "../database/db";

class UserRepository {
  async findByEmail(email: string) {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email],
    );

    return result.rows[0];
  }

  async create(name: string, email: string, password: string) {
    const result = await pool.query(
      `
      INSERT INTO users (
        name,
        email,
        password
      )
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [name, email, password],
    );

    return result.rows[0];
  }
}

export const userRepository = new UserRepository();
