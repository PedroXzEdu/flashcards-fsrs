import { describe, it, expect } from "vitest";
import reviewRoutes from "../reviewRoutes";

function getRoutes() {
  return reviewRoutes.stack.filter((l: any) => l.route);
}

function getRoute(path: string, method: string) {
  return getRoutes().find(
    (l: any) => l.route?.path === path && l.route?.methods?.[method],
  ) as any;
}

describe("reviewRoutes", () => {
  it("deve registrar 3 rotas", () => {
    expect(getRoutes()).toHaveLength(3);
  });

  it("GET / tem 1 middleware", () => {
    expect(getRoute("/", "get").route.stack).toHaveLength(1);
  });

  it("GET /:cardId/preview tem 1 middleware", () => {
    expect(getRoute("/:cardId/preview", "get").route.stack).toHaveLength(1);
  });

  it("POST /:cardId tem 2 middlewares (validate + controller)", () => {
    expect(getRoute("/:cardId", "post").route.stack).toHaveLength(2);
  });
});
