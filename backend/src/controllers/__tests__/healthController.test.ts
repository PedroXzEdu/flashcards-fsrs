import { describe, it, expect, vi, beforeEach } from "vitest";
import { healthCheck } from "../healthController";

vi.mock("../../database/db", () => ({
  ping: vi.fn(),
}));

vi.mock("fs", () => ({
  default: {
    readFileSync: vi.fn(() =>
      JSON.stringify({
        dependencies: { "ts-fsrs": "5.3.2" },
      }),
    ),
  },
  readFileSync: vi.fn(() =>
    JSON.stringify({
      dependencies: { "ts-fsrs": "5.3.2" },
    }),
  ),
}));

function createReq() {
  return {} as any;
}

function createRes() {
  const res: any = {};
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("healthCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar status ok quando banco está conectado", async () => {
    const { ping } = await import("../../database/db");
    (ping as any).mockResolvedValue(true);

    const req = createReq();
    const res = createRes();

    await healthCheck(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        status: "ok",
        db: "connected",
        fsrs: "5.3.2",
        uptime: expect.any(Number),
        memoryUsage: {
          rss: expect.any(Number),
          heapTotal: expect.any(Number),
          heapUsed: expect.any(Number),
        },
      },
    });
  });

  it("deve retornar status degraded quando banco está desconectado", async () => {
    const { ping } = await import("../../database/db");
    (ping as any).mockResolvedValue(false);

    const req = createReq();
    const res = createRes();

    await healthCheck(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        status: "degraded",
        db: "disconnected",
        fsrs: "5.3.2",
        uptime: expect.any(Number),
        memoryUsage: {
          rss: expect.any(Number),
          heapTotal: expect.any(Number),
          heapUsed: expect.any(Number),
        },
      },
    });
  });

  it("deve retornar uptime como número positivo", async () => {
    const { ping } = await import("../../database/db");
    (ping as any).mockResolvedValue(true);

    const req = createReq();
    const res = createRes();

    await healthCheck(req, res);

    const call = res.json.mock.calls[0][0];
    expect(call.data.uptime).toBeGreaterThan(0);
  });

  it("deve incluir memoryUsage com rss e heap", async () => {
    const { ping } = await import("../../database/db");
    (ping as any).mockResolvedValue(true);

    const req = createReq();
    const res = createRes();

    await healthCheck(req, res);

    const call = res.json.mock.calls[0][0];
    expect(call.data.memoryUsage.rss).toBeGreaterThan(0);
    expect(call.data.memoryUsage.heapTotal).toBeGreaterThan(0);
    expect(call.data.memoryUsage.heapUsed).toBeGreaterThan(0);
  });
});
