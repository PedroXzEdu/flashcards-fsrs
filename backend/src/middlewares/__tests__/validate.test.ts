import { describe, it, expect, vi, beforeEach } from "vitest";
import { z, ZodError } from "zod";

import { validate } from "../validate";

function createReq(body: unknown = {}) {
  return { body } as any;
}

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("Validate middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve substituir req.body com dados parseados e chamar next()", () => {
    const schema = { parse: vi.fn().mockReturnValue({ name: "Teste" }) } as any;
    const req = createReq({ name: "Teste" });
    const res = createRes();
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(schema.parse).toHaveBeenCalledWith({ name: "Teste" });
    expect(req.body).toEqual({ name: "Teste" });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("deve propagar ZodError sem chamar next()", () => {
    const zodError = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["name"],
        message: "Required",
      },
    ]);
    const schema = {
      parse: vi.fn(() => {
        throw zodError;
      }),
    } as any;
    const req = createReq({});
    const res = createRes();
    const next = vi.fn();

    expect(() => validate(schema)(req, res, next)).toThrow(zodError);
    expect(next).not.toHaveBeenCalled();
  });

  it("deve passar validação com schema zod real", () => {
    const schema = z.object({ name: z.string() });
    const req = createReq({ name: "Válido" });
    const res = createRes();
    const next = vi.fn();

    validate(schema)(req, res, next);

    expect(req.body).toEqual({ name: "Válido" });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("deve propagar erro com schema zod real para body inválido", () => {
    const schema = z.object({ name: z.string() });
    const req = createReq({});
    const res = createRes();
    const next = vi.fn();

    expect(() => validate(schema)(req, res, next)).toThrow(ZodError);
    expect(next).not.toHaveBeenCalled();
  });
});
