import { describe, it, expect } from "vitest";
import reviewLogsRoutes from "../reviewLogsRoutes";

function getRoutes() {
  return reviewLogsRoutes.stack.filter((l: any) => l.route);
}

function getRoute(path: string, method: string) {
  return getRoutes().find(
    (l: any) => l.route?.path === path && l.route?.methods?.[method],
  ) as any;
}

describe("reviewLogsRoutes", () => {
  it("deve registrar 5 rotas", () => {
    expect(getRoutes()).toHaveLength(5);
  });

  it("GET / tem 1 middleware", () => {
    expect(getRoute("/", "get").route.stack).toHaveLength(1);
  });

  it("GET /daily tem 1 middleware", () => {
    expect(getRoute("/daily", "get").route.stack).toHaveLength(1);
  });

  it("GET /streak tem 1 middleware", () => {
    expect(getRoute("/streak", "get").route.stack).toHaveLength(1);
  });

  it("GET /activity tem 1 middleware", () => {
    expect(getRoute("/activity", "get").route.stack).toHaveLength(1);
  });

  it("GET /global-stats tem 1 middleware", () => {
    expect(getRoute("/global-stats", "get").route.stack).toHaveLength(1);
  });
});
