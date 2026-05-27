import { api } from "../api/client";

export interface RetentionRate {
  retention_rate: string | number | null;
  successful_reviews: string | number;
  total_reviews: string | number;
}

export interface ForgettingCurve {
  stability: number;
  curve: { day: number; retention: number }[];
}

export interface HeatmapDay {
  day: string;
  reviews: number;
}

export interface PredictedRecall {
  card_id: number;
  front: string;
  predicted_recall: number;
}

export interface WorkloadForecastDay {
  day: string;
  review_cards: number;
  new_cards: number;
}

export interface DailyQueueCard {
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

export async function getWorkloadForecast(days = 30) {
  return api.get<WorkloadForecastDay[]>(
    `/analytics/workload-forecast?days=${days}`,
  );
}

export async function getDailyQueue() {
  return api.get<DailyQueueCard[]>("/analytics/daily-queue");
}
