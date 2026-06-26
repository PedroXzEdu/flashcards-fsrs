import { api } from "./client";
import type { Achievement } from "../types";

export const achievementsApi = {
  list: () => api.get<Achievement[]>("/achievements"),
};
