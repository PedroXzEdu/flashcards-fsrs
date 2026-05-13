import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { AppError } from "../utils/AppError";
import { userRepository } from "../repositories/userRepository";

class AuthService {
  private generateToken(userId: number) {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
  }

  async register(name: string, email: string, password: string) {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError("Email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepository.create(name, email, hashedPassword);

    return {
      token: this.generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError("Invalid password", 401);
    }

    return {
      token: this.generateToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}

export const authService = new AuthService();
