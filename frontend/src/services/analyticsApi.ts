import { api } from "../api/client";

interface RetentionRate {
  retention_rate: string | number | null;
  successful_reviews: string | number;
  total_reviews: string | number;
}

interface ForgettingCurve {
  stability: number;
  curve: { day: number; retention: number }[];
}

interface HeatmapDay {
  day: string;
  reviews: number;
}

interface PredictedRecall {
  card_id: number;
  front: string;
  predicted_recall: number;
}

interface DailyQueueCard {
  id: number;
  front: string;
  predicted_recall: number;
}

export async function getRetentionRate() {
  return api.get<RetentionRate>("/analytics/retention-rate");
}

export async function getHeatmap() {
  return api.get<HeatmapDay[]>("/analytics/review-heatmap");
}

export async function getForgettingCurve() {
  return api.get<ForgettingCurve>("/analytics/forgetting-curve");
}

export async function getPredictedRecall() {
  return api.get<PredictedRecall[]>("/analytics/predicted-recall");
}

export async function getDailyQueue() {
  return api.get<DailyQueueCard[]>("/analytics/daily-queue");
}
