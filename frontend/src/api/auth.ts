import { api } from "./client";
import type { User } from "../types";

interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>("/auth/register", { name, email, password }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
};
