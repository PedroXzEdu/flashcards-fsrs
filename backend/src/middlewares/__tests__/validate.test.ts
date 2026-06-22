import { describe, it, expect, vi, beforeEach } from "vitest";
import { z, ZodError } from "zod";

import { validate } from "../validate";

function createReq(body: unknown = {}, query: unknown = {}) {
  return { body, query } as any;
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

  describe("querySchema", () => {
    it("deve parsear query params quando querySchema é fornecido", () => {
      const bodySchema = z.object({ name: z.string() });
      const querySchema = z.object({ page: z.coerce.number().int().positive() });
      const req = createReq({ name: "teste" }, { page: "1" });
      const res = createRes();
      const next = vi.fn();

      validate(bodySchema, querySchema)(req, res, next);

      expect(req.body).toEqual({ name: "teste" });
      expect(req.query).toEqual({ page: 1 });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("deve funcionar com apenas querySchema (bodySchema undefined)", () => {
      const querySchema = z.object({ limit: z.coerce.number().default(20) });
      const req = createReq({}, {});
      const res = createRes();
      const next = vi.fn();

      validate(undefined, querySchema)(req, res, next);

      expect(req.query).toEqual({ limit: 20 });
      expect(next).toHaveBeenCalledTimes(1);
    });

    it("deve propagar ZodError quando querySchema falha", () => {
      const querySchema = z.object({ page: z.coerce.number().positive() });
      const req = createReq({}, { page: "-1" });
      const res = createRes();
      const next = vi.fn();

      expect(() => validate(undefined, querySchema)(req, res, next)).toThrow(ZodError);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
