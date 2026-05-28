import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

import { requestId } from "../requestId";

function createReq() {
  return {} as any;
}

function createRes() {
  const res: any = {};
  res.setHeader = vi.fn().mockReturnValue(res);
  return res;
}

describe("RequestId middleware", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "00000000-0000-0000-0000-000000000000",
    );
  });

  it("deve definir req.requestId com UUID", () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    requestId(req, res, next);

    expect(req.requestId).toBe("00000000-0000-0000-0000-000000000000");
  });

  it("deve definir header X-Request-Id na resposta", () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    requestId(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      "X-Request-Id",
      "00000000-0000-0000-0000-000000000000",
    );
  });

  it("deve chamar next() uma vez", () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    requestId(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("deve usar o mesmo UUID no req e no header", () => {
    const req = createReq();
    const res = createRes();
    const next = vi.fn();

    requestId(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith("X-Request-Id", req.requestId);
  });
});
