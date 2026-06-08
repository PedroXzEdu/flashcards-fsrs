import { describe, it, expect, vi } from "vitest";
import request from "supertest";

vi.mock("../../routes/importRoutes", () => ({ default: require("express").Router() }));

import { app } from "../../app";
import { collector } from "../../middlewares/metrics";

describe("GET /metrics", () => {
  it("deve retornar 200 com formato { success, data }", async () => {
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it("deve incluir uptime, totalRequests, requestsByRoute, errorRate", async () => {
    const res = await request(app).get("/metrics");
    expect(res.body.data.uptime).toBeTypeOf("number");
    expect(res.body.data.totalRequests).toBeTypeOf("number");
    expect(res.body.data.totalErrors).toBeTypeOf("number");
    expect(res.body.data.errorRate).toBeTypeOf("number");
    expect(res.body.data.requestsByRoute).toBeTypeOf("object");
    expect(res.body.data.memoryUsage).toBeTypeOf("object");
  });

  it("deve incluir business metrics", async () => {
    const res = await request(app).get("/metrics");
    expect(res.body.data.business).toBeDefined();
    expect(res.body.data.business.decksCreated).toBeTypeOf("number");
    expect(res.body.data.business.cardsCreated).toBeTypeOf("number");
    expect(res.body.data.business.reviewsSubmitted).toBeTypeOf("number");
    expect(res.body.data.business.importsCompleted).toBeTypeOf("number");
  });

  it("deve refletir métricas de requisições anteriores", async () => {
    await request(app).get("/health");
    await request(app).get("/metrics");

    const res = await request(app).get("/metrics");
    expect(res.body.data.totalRequests).toBeGreaterThanOrEqual(3);
    expect(res.body.data.requestsByRoute["GET:/health"]).toBeDefined();
  });

  it("não exige autenticação", async () => {
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
  });

  it("deve retornar estrutura correta do snapshot", () => {
    const snap = collector.snapshot();
    const expectedKeys = [
      "totalRequests",
      "totalErrors",
      "errorRate",
      "requestsByRoute",
      "business",
    ];
    expect(Object.keys(snap)).toEqual(expect.arrayContaining(expectedKeys));
  });
});
