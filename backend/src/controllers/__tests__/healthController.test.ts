import { describe, it, expect, vi } from "vitest";
import { healthCheck } from "../healthController";

function createReq() {
  return {} as any;
}

function createRes() {
  const res: any = {};
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("healthCheck", () => {
  it("deve retornar status ok", () => {
    const req = createReq();
    const res = createRes();

    healthCheck(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { status: "ok" },
    });
  });
});
