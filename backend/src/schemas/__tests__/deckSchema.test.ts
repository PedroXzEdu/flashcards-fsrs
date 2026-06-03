import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import {
  createDeckSchema,
  updateDeckSchema,
  settingsSchema,
} from "../deckSchema";

describe("createDeckSchema", () => {
  it("aceita dados válidos com todos os campos", () => {
    const data = createDeckSchema.parse({
      title: "Meu Baralho",
      description: "Descrição legal",
      is_public: true,
    });
    expect(data.title).toBe("Meu Baralho");
    expect(data.description).toBe("Descrição legal");
    expect(data.is_public).toBe(true);
  });

  it("aceita apenas title (mínimo)", () => {
    const data = createDeckSchema.parse({ title: "Meu Baralho" });
    expect(data.title).toBe("Meu Baralho");
    expect(data.description).toBeUndefined();
    expect(data.is_public).toBeUndefined();
  });

  it("rejeita title vazio", () => {
    expect(() => createDeckSchema.parse({ title: "" })).toThrow(ZodError);
  });

  it("rejeita title maior que 100 caracteres", () => {
    expect(() =>
      createDeckSchema.parse({ title: "a".repeat(101) }),
    ).toThrow(ZodError);
  });

  it("rejeita description maior que 500 caracteres", () => {
    expect(() =>
      createDeckSchema.parse({
        title: "Baralho",
        description: "a".repeat(501),
      }),
    ).toThrow(ZodError);
  });

  it("aceita is_public false", () => {
    const data = createDeckSchema.parse({
      title: "Baralho",
      is_public: false,
    });
    expect(data.is_public).toBe(false);
  });

  it("rejeita is_public como string", () => {
    expect(() =>
      createDeckSchema.parse({
        title: "Baralho",
        is_public: "true",
      }),
    ).toThrow(ZodError);
  });

  it("rejeita objeto vazio", () => {
    expect(() => createDeckSchema.parse({})).toThrow(ZodError);
  });
});

describe("updateDeckSchema", () => {
  it("aceita dados válidos com todos os campos", () => {
    const data = updateDeckSchema.parse({
      title: "Baralho Atualizado",
      description: "Nova descrição",
      is_public: true,
    });
    expect(data.title).toBe("Baralho Atualizado");
    expect(data.description).toBe("Nova descrição");
    expect(data.is_public).toBe(true);
  });

  it("rejeita is_public como string", () => {
    expect(() =>
      updateDeckSchema.parse({
        title: "Baralho",
        is_public: "true",
      }),
    ).toThrow(ZodError);
  });

  it("aceita is_public false", () => {
    const data = updateDeckSchema.parse({
      title: "Baralho",
      is_public: false,
    });
    expect(data.is_public).toBe(false);
  });

  it("aceita description como null", () => {
    const data = updateDeckSchema.parse({
      title: "Baralho",
      description: null,
    });
    expect(data.description).toBeNull();
  });

  it("aceita description como undefined", () => {
    const data = updateDeckSchema.parse({
      title: "Baralho",
    });
    expect(data.description).toBeUndefined();
  });

  it("rejeita title vazio", () => {
    expect(() =>
      updateDeckSchema.parse({ title: "", description: "desc" }),
    ).toThrow(ZodError);
  });

  it("rejeita title maior que 100", () => {
    expect(() =>
      updateDeckSchema.parse({ title: "a".repeat(101) }),
    ).toThrow(ZodError);
  });

  it("rejeita description maior que 500", () => {
    expect(() =>
      updateDeckSchema.parse({
        title: "Baralho",
        description: "a".repeat(501),
      }),
    ).toThrow(ZodError);
  });

  it("rejeita objeto vazio", () => {
    expect(() => updateDeckSchema.parse({})).toThrow(ZodError);
  });
});

describe("settingsSchema", () => {
  it("aceita new_cards_per_day válido", () => {
    const data = settingsSchema.parse({ new_cards_per_day: 10 });
    expect(data.new_cards_per_day).toBe(10);
  });

  it("aceita 0 como mínimo", () => {
    const data = settingsSchema.parse({ new_cards_per_day: 0 });
    expect(data.new_cards_per_day).toBe(0);
  });

  it("aceita 100 como máximo", () => {
    const data = settingsSchema.parse({ new_cards_per_day: 100 });
    expect(data.new_cards_per_day).toBe(100);
  });

  it("rejeita valor negativo", () => {
    expect(() =>
      settingsSchema.parse({ new_cards_per_day: -1 }),
    ).toThrow(ZodError);
  });

  it("rejeita valor maior que 100", () => {
    expect(() =>
      settingsSchema.parse({ new_cards_per_day: 101 }),
    ).toThrow(ZodError);
  });

  it("rejeita valor não inteiro", () => {
    expect(() =>
      settingsSchema.parse({ new_cards_per_day: 1.5 }),
    ).toThrow(ZodError);
  });

  it("rejeita string", () => {
    expect(() =>
      settingsSchema.parse({ new_cards_per_day: "10" }),
    ).toThrow(ZodError);
  });
});
