import { api } from "../api/client";

export async function getRetentionRate() {
  return api.get("/analytics/retention-rate");
}

export async function getHeatmap() {
  return api.get("/analytics/review-heatmap");
}

export async function getForgettingCurve() {
  return api.get("/analytics/forgetting-curve");
}

export async function getPredictedRecall() {
  return api.get("/analytics/predicted-recall");
}

export async function getDailyQueue() {
  return api.get("/analytics/daily-queue");
}
