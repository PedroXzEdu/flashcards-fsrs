import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import { achievementService } from "../services/achievementService";

export async function getAchievements(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const achievements = await achievementService.getUserAchievements(req.userId!);
    res.json({ success: true, data: achievements });
  } catch (err) {
    next(err);
  }
}
