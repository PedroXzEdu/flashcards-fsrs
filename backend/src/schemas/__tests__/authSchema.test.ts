import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { registerSchema, loginSchema } from "../authSchema";

describe("registerSchema", () => {
  it("aceita dados válidos", () => {
    const data = registerSchema.parse({
      name: "Usuário Teste",
      email: "teste@email.com",
      password: "senha123",
    });
    expect(data.name).toBe("Usuário Teste");
    expect(data.email).toBe("teste@email.com");
    expect(data.password).toBe("senha123");
  });

  it("rejeita name vazio após trim", () => {
    expect(() =>
      registerSchema.parse({
        name: "   ",
        email: "teste@email.com",
        password: "senha123",
      }),
    ).toThrow(ZodError);
  });

  it("rejeita name maior que 100 caracteres", () => {
    expect(() =>
      registerSchema.parse({
        name: "a".repeat(101),
        email: "teste@email.com",
        password: "senha123",
      }),
    ).toThrow(ZodError);
  });

  it("rejeita email inválido", () => {
    expect(() =>
      registerSchema.parse({
        name: "Teste",
        email: "invalido",
        password: "senha123",
      }),
    ).toThrow(ZodError);
  });

  it("rejeita email maior que 254 caracteres", () => {
    expect(() =>
      registerSchema.parse({
        name: "Teste",
        email: `${"a".repeat(250)}@b.com`,
        password: "senha123",
      }),
    ).toThrow(ZodError);
  });

  it("rejeita password menor que 6 caracteres", () => {
    expect(() =>
      registerSchema.parse({
        name: "Teste",
        email: "teste@email.com",
        password: "12345",
      }),
    ).toThrow(ZodError);
  });

  it("rejeita password maior que 128 caracteres", () => {
    expect(() =>
      registerSchema.parse({
        name: "Teste",
        email: "teste@email.com",
        password: "a".repeat(129),
      }),
    ).toThrow(ZodError);
  });

  it("aceita password com exatamente 6 caracteres (boundary)", () => {
    const data = registerSchema.parse({
      name: "Teste",
      email: "teste@email.com",
      password: "123456",
    });
    expect(data.password).toBe("123456");
  });

  it("aceita password com exatamente 128 caracteres (boundary)", () => {
    const pwd = "a".repeat(128);
    const data = registerSchema.parse({
      name: "Teste",
      email: "teste@email.com",
      password: pwd,
    });
    expect(data.password).toBe(pwd);
  });

  it("faz trim automático em name e email", () => {
    const data = registerSchema.parse({
      name: "  Teste  ",
      email: "  teste@email.com  ",
      password: "senha123",
    });
    expect(data.name).toBe("Teste");
    expect(data.email).toBe("teste@email.com");
  });

  it("rejeita objeto vazio", () => {
    expect(() => registerSchema.parse({})).toThrow(ZodError);
  });
});

describe("loginSchema", () => {
  it("aceita dados válidos", () => {
    const data = loginSchema.parse({
      email: "teste@email.com",
      password: "senha123",
    });
    expect(data.email).toBe("teste@email.com");
    expect(data.password).toBe("senha123");
  });

  it("rejeita email inválido", () => {
    expect(() =>
      loginSchema.parse({ email: "invalido", password: "senha123" }),
    ).toThrow(ZodError);
  });

  it("rejeita password vazio", () => {
    expect(() =>
      loginSchema.parse({ email: "teste@email.com", password: "" }),
    ).toThrow(ZodError);
  });

  it("rejeita objeto vazio", () => {
    expect(() => loginSchema.parse({})).toThrow(ZodError);
  });

  it("faz trim em email", () => {
    const data = loginSchema.parse({
      email: "  teste@email.com  ",
      password: "senha123",
    });
    expect(data.email).toBe("teste@email.com");
  });
});
