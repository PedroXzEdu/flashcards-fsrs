import { describe, it, expect } from "vitest";
import analyticsRoutes from "../analyticsRoutes";

function getRoutes() {
  return analyticsRoutes.stack.filter((l: any) => l.route);
}

function getRoute(path: string, method: string) {
  return getRoutes().find(
    (l: any) => l.route?.path === path && l.route?.methods?.[method],
  ) as any;
}

describe("analyticsRoutes", () => {
  it("deve registrar 6 rotas", () => {
    expect(getRoutes()).toHaveLength(6);
  });

  it("GET /retention-rate tem 1 middleware", () => {
    expect(getRoute("/retention-rate", "get").route.stack).toHaveLength(1);
  });

  it("GET /review-heatmap tem 1 middleware", () => {
    expect(getRoute("/review-heatmap", "get").route.stack).toHaveLength(1);
  });

  it("GET /forgetting-curve tem 1 middleware", () => {
    expect(getRoute("/forgetting-curve", "get").route.stack).toHaveLength(1);
  });

  it("GET /predicted-recall tem 1 middleware", () => {
    expect(getRoute("/predicted-recall", "get").route.stack).toHaveLength(1);
  });

  it("GET /workload-forecast tem 1 middleware", () => {
    expect(getRoute("/workload-forecast", "get").route.stack).toHaveLength(1);
  });

  it("GET /daily-queue tem 1 middleware", () => {
    expect(getRoute("/daily-queue", "get").route.stack).toHaveLength(1);
  });
});
