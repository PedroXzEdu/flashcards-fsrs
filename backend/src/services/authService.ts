import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { AppError } from "../utils/AppError";
import { sanitizeInput } from "../utils/sanitize";
import { env } from "../config/env";
import { userRepository } from "../repositories/userRepository";

class AuthService {
  private generateToken(userId: number) {
    return jwt.sign({ userId }, env.jwtSecret, {
      expiresIn: "7d",
    });
  }

  async register(name: string, email: string, password: string) {
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const existingUser = await userRepository.findByEmail(sanitizedEmail);

    if (existingUser) {
      throw new AppError("Email já cadastrado.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepository.create(
      sanitizedName,
      sanitizedEmail,
      hashedPassword,
    );

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
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const user = await userRepository.findByEmail(sanitizedEmail);

    if (!user) {
      throw new AppError("Usuário não encontrado.", 404);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError("Senha inválida.", 401);
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
