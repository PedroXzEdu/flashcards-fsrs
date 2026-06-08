import { describe, it, expect, vi, beforeEach } from "vitest";

import { MetricsCollector, metricsMiddleware, collector, BUCKETS } from "../metrics";

function createReq(opts?: { method?: string; path?: string }) {
  return {
    method: opts?.method || "GET",
    path: opts?.path || "/test",
    route: undefined,
  } as any;
}

function createRes() {
  const res: any = {};
  res.on = vi.fn((_event: string, _cb: () => void) => res);
  res.statusCode = 200;
  return res;
}

describe("MetricsCollector", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve registrar métrica de requisição com sucesso", () => {
    const local = new MetricsCollector();
    local.record("GET", "/test", 200, 100);
    const snap = local.snapshot();

    expect(snap.totalRequests).toBe(1);
    expect(snap.totalErrors).toBe(0);
    expect(snap.requestsByRoute["GET:/test"]).toBeDefined();
    expect(snap.requestsByRoute["GET:/test"].count).toBe(1);
  });

  it("deve contar erros para status >= 400", () => {
    const local = new MetricsCollector();
    local.record("POST", "/decks", 400, 50);
    local.record("POST", "/decks", 500, 30);
    const snap = local.snapshot();

    expect(snap.totalRequests).toBe(2);
    expect(snap.totalErrors).toBe(2);
    expect(snap.requestsByRoute["POST:/decks"].errors).toBe(2);
  });

  it("deve calcular avgDuration corretamente", () => {
    const local = new MetricsCollector();
    local.record("GET", "/health", 200, 100);
    local.record("GET", "/health", 200, 200);
    const snap = local.snapshot();

    expect(snap.requestsByRoute["GET:/health"].avgDuration).toBe(150);
  });

  it("deve distribuir durações nos buckets do histograma", () => {
    const local = new MetricsCollector();
    local.record("GET", "/test", 200, 30);
    local.record("GET", "/test", 200, 120);
    local.record("GET", "/test", 200, 750);
    local.record("GET", "/test", 200, 3000);
    local.record("GET", "/test", 200, 6000);
    const snap = local.snapshot();
    const hist = snap.requestsByRoute["GET:/test"].histogram;

    expect(hist["≤50ms"]).toBe(1);
    expect(hist["≤200ms"]).toBe(1);
    expect(hist["≤1000ms"]).toBe(1);
    expect(hist["≤5000ms"]).toBe(2);
  });

  it("deve incrementar business metrics", () => {
    const local = new MetricsCollector();
    local.incrementBusiness("decksCreated");
    local.incrementBusiness("decksCreated");
    local.incrementBusiness("cardsCreated");

    const business = local.getBusiness();
    expect(business.decksCreated).toBe(2);
    expect(business.cardsCreated).toBe(1);
    expect(business.reviewsSubmitted).toBe(0);
    expect(business.importsCompleted).toBe(0);
  });

  it("deve calcular errorRate corretamente", () => {
    const local = new MetricsCollector();
    local.record("GET", "/ok", 200, 10);
    local.record("GET", "/err", 500, 10);
    local.record("GET", "/err2", 404, 10);
    const snap = local.snapshot();

    expect(snap.errorRate).toBeCloseTo(2 / 3, 2);
  });

  it("deve retornar errorRate 0 quando não há requisições", () => {
    const local = new MetricsCollector();
    const snap = local.snapshot();

    expect(snap.errorRate).toBe(0);
    expect(snap.totalRequests).toBe(0);
    expect(snap.totalErrors).toBe(0);
  });
});

describe("metricsMiddleware", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve chamar next() uma vez", () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    metricsMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("deve registrar evento finish na resposta", () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    metricsMiddleware(req, res, next);

    expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));
  });

  it("deve registrar métrica no finish com rota do req.route.path", () => {
    const req = createReq({ method: "POST" });
    req.route = { path: "/decks/:id/cards" };
    const res = createRes();
    res.statusCode = 201;
    const next = vi.fn();

    metricsMiddleware(req, res, next);

    const finishCb = res.on.mock.calls[0][1];

    const spy = vi.spyOn(collector, "record");
    finishCb();

    expect(spy).toHaveBeenCalledWith("POST", "/decks/:id/cards", 201, expect.any(Number));
  });

  it("deve usar req.path como fallback quando req.route é undefined", () => {
    const req = createReq({ method: "GET", path: "/some/404" });
    const res = createRes();
    res.statusCode = 404;
    const next = vi.fn();

    metricsMiddleware(req, res, next);

    const finishCb = res.on.mock.calls[0][1];

    const spy = vi.spyOn(collector, "record");
    finishCb();

    expect(spy).toHaveBeenCalledWith("GET", "/some/404", 404, expect.any(Number));
  });
});

describe("BUCKETS", () => {
  it("deve conter os buckets esperados", () => {
    expect(BUCKETS).toEqual([50, 100, 200, 500, 1000, 2000, 5000]);
  });

  it("deve estar em ordem crescente", () => {
    for (let i = 1; i < BUCKETS.length; i++) {
      expect(BUCKETS[i]).toBeGreaterThan(BUCKETS[i - 1]);
    }
  });
});
