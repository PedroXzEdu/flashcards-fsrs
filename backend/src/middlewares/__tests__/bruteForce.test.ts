import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { bruteForceProtection, _resetAttempts } from "../bruteForce";

beforeEach(() => {
  process.env.NODE_ENV = "development";
  _resetAttempts();
});

afterEach(() => {
  process.env.NODE_ENV = "test";
  vi.useRealTimers();
});

function createReq(ip = "127.0.0.1") {
  return {
    ip,
    socket: { remoteAddress: ip },
  } as any;
}

function createRes() {
  let finishHandler: () => void = () => {};
  const res: any = {
    statusCode: 200,
  };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn().mockReturnValue(res);
  res.on = vi.fn((_event: string, handler: () => void) => {
    finishHandler = handler;
  });
  res.emitFinish = (statusCode?: number) => {
    if (statusCode !== undefined) {
      res.statusCode = statusCode;
    }
    finishHandler();
  };
  return res;
}

describe("bruteForceProtection", () => {
  it("deve bloquear após 5 tentativas falhas consecutivas (401)", () => {
    const middleware = bruteForceProtection();
    const ip = "1.2.3.4";

    for (let i = 0; i < 5; i++) {
      const req = createReq(ip);
      const res = createRes();
      const next = vi.fn();
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      res.emitFinish(401);
    }

    const blockedReq = createReq(ip);
    const blockedRes = createRes();
    const blockedNext = vi.fn();
    middleware(blockedReq, blockedRes, blockedNext);

    expect(blockedRes.status).toHaveBeenCalledWith(429);
    expect(blockedRes.json).toHaveBeenCalledWith({
      success: false,
      error:
        "Conta temporariamente bloqueada devido a muitas tentativas de login. Tente novamente em 30 minutos.",
    });
    expect(blockedNext).not.toHaveBeenCalled();
  });

  it("IPs diferentes não devem se afetar", () => {
    const middleware = bruteForceProtection();

    for (let i = 0; i < 5; i++) {
      const req = createReq("1.1.1.1");
      const res = createRes();
      const next = vi.fn();
      middleware(req, res, next);
      res.emitFinish(401);
    }

    const req2 = createReq("2.2.2.2");
    const res2 = createRes();
    const next2 = vi.fn();
    middleware(req2, res2, next2);

    expect(res2.status).not.toHaveBeenCalled();
    expect(next2).toHaveBeenCalled();
  });

  it("login bem-sucedido (200) deve resetar contagem", () => {
    const middleware = bruteForceProtection();
    const ip = "1.2.3.4";

    for (let i = 0; i < 4; i++) {
      const req = createReq(ip);
      const res = createRes();
      const next = vi.fn();
      middleware(req, res, next);
      res.emitFinish(401);
    }

    const successReq = createReq(ip);
    const successRes = createRes();
    const successNext = vi.fn();
    middleware(successReq, successRes, successNext);
    successRes.emitFinish(200);

    for (let i = 0; i < 5; i++) {
      const req = createReq(ip);
      const res = createRes();
      const next = vi.fn();
      middleware(req, res, next);
      res.emitFinish(401);
    }

    const blockedReq = createReq(ip);
    const blockedRes = createRes();
    const blockedNext = vi.fn();
    middleware(blockedReq, blockedRes, blockedNext);

    expect(blockedRes.status).toHaveBeenCalledWith(429);
    expect(blockedRes.json).toHaveBeenCalledWith({
      success: false,
      error:
        "Conta temporariamente bloqueada devido a muitas tentativas de login. Tente novamente em 30 minutos.",
    });
    expect(blockedNext).not.toHaveBeenCalled();
  });

  it("404 também deve contar como tentativa falha", () => {
    const middleware = bruteForceProtection();
    const ip = "1.2.3.4";

    for (let i = 0; i < 5; i++) {
      const req = createReq(ip);
      const res = createRes();
      const next = vi.fn();
      middleware(req, res, next);
      res.emitFinish(404);
    }

    const blockedReq = createReq(ip);
    const blockedRes = createRes();
    const blockedNext = vi.fn();
    middleware(blockedReq, blockedRes, blockedNext);

    expect(blockedRes.status).toHaveBeenCalledWith(429);
  });

  it("cleanup periódico deve remover registros expirados", () => {
    vi.useFakeTimers();
    _resetAttempts();
    const middleware = bruteForceProtection();
    const ip = "9.9.9.9";

    const req1 = createReq(ip);
    const res1 = createRes();
    middleware(req1, res1, vi.fn());
    res1.emitFinish(401);

    vi.advanceTimersByTime(16 * 60 * 1000);

    const req2 = createReq(ip);
    const res2 = createRes();
    const next2 = vi.fn();
    middleware(req2, res2, next2);
    res2.emitFinish(401);

    for (let i = 0; i < 4; i++) {
      const req = createReq(ip);
      const res = createRes();
      const next = vi.fn();
      middleware(req, res, next);
      res.emitFinish(401);
    }

    const blockedReq = createReq(ip);
    const blockedRes = createRes();
    const blockedNext = vi.fn();
    middleware(blockedReq, blockedRes, blockedNext);

    expect(blockedRes.status).toHaveBeenCalledWith(429);
  });

  it("deve usar socket.remoteAddress quando req.ip é undefined", () => {
    const middleware = bruteForceProtection();
    const req = { ip: undefined, socket: { remoteAddress: "10.0.0.1" } } as any;
    const res = createRes();
    const next = vi.fn();
    middleware(req, res, next);
    res.emitFinish(401);

    const req2 = { ip: undefined, socket: { remoteAddress: "10.0.0.2" } } as any;
    const res2 = createRes();
    const next2 = vi.fn();
    middleware(req2, res2, next2);

    expect(res2.status).not.toHaveBeenCalled();
    expect(next2).toHaveBeenCalled();
  });

  it("deve ignorar proteção quando NODE_ENV é test", () => {
    process.env.NODE_ENV = "test";
    const middleware = bruteForceProtection();
    const req = createReq("1.2.3.4");
    const res = createRes();
    const next = vi.fn();
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.on).not.toHaveBeenCalled();
  });

  it("_resetAttempts deve limpar todo o estado", () => {
    const middleware = bruteForceProtection();
    const ip = "1.2.3.4";

    for (let i = 0; i < 5; i++) {
      const req = createReq(ip);
      const res = createRes();
      const next = vi.fn();
      middleware(req, res, next);
      res.emitFinish(401);
    }

    _resetAttempts();

    const req = createReq(ip);
    const res = createRes();
    const next = vi.fn();
    middleware(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
