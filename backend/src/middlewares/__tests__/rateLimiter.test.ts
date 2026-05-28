import { describe, it, expect, vi, beforeAll } from "vitest";
import rateLimit from "express-rate-limit";

import {
  authRateLimiter,
  createDeckRateLimiter,
  createCardRateLimiter,
  importRateLimiter,
} from "../rateLimiter";

vi.mock("express-rate-limit", () => ({
  default: vi.fn(() => vi.fn((_req: any, _res: any, next: any) => next())),
}));

describe("RateLimiter", () => {
  let rateLimitCalls: readonly any[];

  beforeAll(() => {
    rateLimitCalls = vi.mocked(rateLimit).mock.calls;
  });

  it("authRateLimiter deve ser uma função middleware", () => {
    expect(authRateLimiter).toBeInstanceOf(Function);
  });

  it("createDeckRateLimiter deve ser uma função middleware", () => {
    expect(createDeckRateLimiter).toBeInstanceOf(Function);
  });

  it("createCardRateLimiter deve ser uma função middleware", () => {
    expect(createCardRateLimiter).toBeInstanceOf(Function);
  });

  it("importRateLimiter deve ser uma função middleware", () => {
    expect(importRateLimiter).toBeInstanceOf(Function);
  });

  it("deve chamar rateLimit 4 vezes", () => {
    expect(rateLimitCalls).toHaveLength(4);
  });

  it("authRateLimiter: max 10, janela 15min, mensagem de erro", () => {
    expect(rateLimitCalls[0][0]).toMatchObject({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: "Muitas tentativas de login. Tente novamente mais tarde.",
      },
    });
  });

  it("createDeckRateLimiter: max 20, janela 15min", () => {
    expect(rateLimitCalls[1][0]).toMatchObject({
      windowMs: 15 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error:
          "Muitas tentativas de criação de baralhos. Tente novamente mais tarde.",
      },
    });
  });

  it("createCardRateLimiter: max 100, janela 15min", () => {
    expect(rateLimitCalls[2][0]).toMatchObject({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: "Muitos cartões criados. Tente novamente mais tarde.",
      },
    });
  });

  it("importRateLimiter: max 5, janela 15min", () => {
    expect(rateLimitCalls[3][0]).toMatchObject({
      windowMs: 15 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: "Muitas importações. Tente novamente mais tarde.",
      },
    });
  });

  it("deve executar next() quando middleware é chamado", async () => {
    const next = vi.fn();
    await authRateLimiter({} as any, {} as any, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
