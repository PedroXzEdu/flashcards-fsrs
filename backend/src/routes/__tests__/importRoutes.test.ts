import { describe, it, expect } from "vitest";
import importRoutes from "../importRoutes";

function getRoutes() {
  return importRoutes.stack.filter((l: any) => l.route);
}

function getRoute(path: string, method: string) {
  return getRoutes().find(
    (l: any) => l.route?.path === path && l.route?.methods?.[method],
  ) as any;
}

describe("importRoutes", () => {
  it("deve registrar 1 rota", () => {
    expect(getRoutes()).toHaveLength(1);
  });

  it("POST / tem 3 middlewares (rateLimiter + upload + controller)", () => {
    expect(getRoute("/", "post").route.stack).toHaveLength(3);
  });
});
