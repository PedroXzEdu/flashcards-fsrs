import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../api/client", () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from "../../api/client";
import {
  getRetentionRate,
  getHeatmap,
  getForgettingCurve,
  getPredictedRecall,
  getWorkloadForecast,
  getDailyQueue,
} from "../analyticsApi";

describe("analyticsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getRetentionRate deve chamar api.get com meses", () => {
    getRetentionRate(6);
    expect(api.get).toHaveBeenCalledWith("/analytics/retention-rate?months=6");
  });

  it("getHeatmap deve chamar api.get com meses", () => {
    getHeatmap(3);
    expect(api.get).toHaveBeenCalledWith("/analytics/review-heatmap?months=3");
  });

  it("getForgettingCurve deve chamar api.get", () => {
    getForgettingCurve();
    expect(api.get).toHaveBeenCalledWith("/analytics/forgetting-curve");
  });

  it("getPredictedRecall deve chamar api.get", () => {
    getPredictedRecall();
    expect(api.get).toHaveBeenCalledWith("/analytics/predicted-recall");
  });

  it("getWorkloadForecast deve chamar api.get com dias", () => {
    getWorkloadForecast(7);
    expect(api.get).toHaveBeenCalledWith("/analytics/workload-forecast?days=7");
  });

  it("getDailyQueue deve chamar api.get", () => {
    getDailyQueue();
    expect(api.get).toHaveBeenCalledWith("/analytics/daily-queue");
  });
});
