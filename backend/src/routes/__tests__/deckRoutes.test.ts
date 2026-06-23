import { describe, it, expect } from "vitest";
import deckRoutes from "../deckRoutes";

function getRoutes() {
  return deckRoutes.stack.filter((l: any) => l.route);
}

function getRoute(path: string, method: string) {
  return getRoutes().find(
    (l: any) => l.route?.path === path && l.route?.methods?.[method],
  ) as any;
}

describe("deckRoutes", () => {
  it("deve registrar 12 rotas", () => {
    expect(getRoutes()).toHaveLength(12);
  });

  it("GET /shared/:token/preview é pública (1 middleware)", () => {
    expect(getRoute("/shared/:token/preview", "get").route.stack).toHaveLength(1);
  });

  it("POST / tem 3 middlewares (rateLimiter + validate + controller)", () => {
    expect(getRoute("/", "post").route.stack).toHaveLength(3);
  });

  it("GET / tem 1 middleware (controller)", () => {
    expect(getRoute("/", "get").route.stack).toHaveLength(1);
  });

  it("POST /shared/:token/import tem 1 middleware", () => {
    expect(getRoute("/shared/:token/import", "post").route.stack).toHaveLength(1);
  });

  it("GET /:id tem 1 middleware", () => {
    expect(getRoute("/:id", "get").route.stack).toHaveLength(1);
  });

  it("GET /:id/stats tem 1 middleware", () => {
    expect(getRoute("/:id/stats", "get").route.stack).toHaveLength(1);
  });

  it("GET /:id/fsrs-params tem 1 middleware", () => {
    expect(getRoute("/:id/fsrs-params", "get").route.stack).toHaveLength(1);
  });

  it("PUT /:id tem 2 middlewares (validate + controller)", () => {
    expect(getRoute("/:id", "put").route.stack).toHaveLength(2);
  });

  it("PUT /:id/settings tem 2 middlewares", () => {
    expect(getRoute("/:id/settings", "put").route.stack).toHaveLength(2);
  });

  it("DELETE /:id tem 1 middleware", () => {
    expect(getRoute("/:id", "delete").route.stack).toHaveLength(1);
  });

  it("POST /:id/share tem 1 middleware", () => {
    expect(getRoute("/:id/share", "post").route.stack).toHaveLength(1);
  });

  it("DELETE /:id/share tem 1 middleware", () => {
    expect(getRoute("/:id/share", "delete").route.stack).toHaveLength(1);
  });
});
