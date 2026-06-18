import { pool } from "../database/db";

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
}

class UserRepository {
  async findByEmail(email: string): Promise<UserRow | undefined> {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email],
    );

    return result.rows[0];
  }

  async create(name: string, email: string, password: string): Promise<UserRow> {
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
