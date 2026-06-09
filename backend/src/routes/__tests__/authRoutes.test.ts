import { describe, it, expect } from "vitest";
import authRoutes from "../authRoutes";

function getRoutes() {
  return authRoutes.stack.filter((l: any) => l.route);
}

function getRoute(path: string, method: string) {
  return getRoutes().find(
    (l: any) => l.route?.path === path && l.route?.methods?.[method],
  ) as any;
}

describe("authRoutes", () => {
  it("deve registrar 2 rotas", () => {
    expect(getRoutes()).toHaveLength(2);
  });

  it("POST /register com 3 middlewares", () => {
    expect(getRoute("/register", "post").route.stack).toHaveLength(3);
  });

  it("POST /login com 4 middlewares (rateLimiter, bruteForce, validate, controller)", () => {
    expect(getRoute("/login", "post").route.stack).toHaveLength(4);
  });
});
