import { describe, it, expect } from "vitest";
import cardRoutes from "../cardRoutes";

function getRoutes() {
  return cardRoutes.stack.filter((l: any) => l.route);
}

function getRoute(path: string, method: string) {
  return getRoutes().find(
    (l: any) => l.route?.path === path && l.route?.methods?.[method],
  ) as any;
}

describe("cardRoutes", () => {
  it("deve registrar 4 rotas", () => {
    expect(getRoutes()).toHaveLength(4);
  });

  it("POST / tem 3 middlewares (rateLimiter + validate + controller)", () => {
    expect(getRoute("/", "post").route.stack).toHaveLength(3);
  });

  it("GET / tem 1 middleware", () => {
    expect(getRoute("/", "get").route.stack).toHaveLength(1);
  });

  it("PUT /:card_id tem 2 middlewares (validate + controller)", () => {
    expect(getRoute("/:card_id", "put").route.stack).toHaveLength(2);
  });

  it("DELETE /:card_id tem 1 middleware", () => {
    expect(getRoute("/:card_id", "delete").route.stack).toHaveLength(1);
  });
});
