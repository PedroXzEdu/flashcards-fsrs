import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import {
  createCardSchema,
  updateCardSchema,
  createCardsBatchSchema,
} from "../cardSchema";

describe("createCardSchema", () => {
  it("aceita dados válidos", () => {
    const data = createCardSchema.parse({
      front: "<p>Frente</p>",
      back: "<p>Verso</p>",
    });
    expect(data.front).toBe("<p>Frente</p>");
    expect(data.back).toBe("<p>Verso</p>");
  });

  it("rejeita front vazio após trim", () => {
    expect(() =>
      createCardSchema.parse({ front: "   ", back: "<p>Verso</p>" }),
    ).toThrow(ZodError);
  });

  it("rejeita back vazio após trim", () => {
    expect(() =>
      createCardSchema.parse({ front: "<p>Frente</p>", back: "   " }),
    ).toThrow(ZodError);
  });

  it("rejeita front maior que 10.000 caracteres", () => {
    expect(() =>
      createCardSchema.parse({
        front: "a".repeat(10_001),
        back: "<p>Verso</p>",
      }),
    ).toThrow(ZodError);
  });

  it("rejeita back maior que 10.000 caracteres", () => {
    expect(() =>
      createCardSchema.parse({
        front: "<p>Frente</p>",
        back: "a".repeat(10_001),
      }),
    ).toThrow(ZodError);
  });

  it("rejeita objeto vazio", () => {
    expect(() => createCardSchema.parse({})).toThrow(ZodError);
  });

  it("faz trim automático em front e back", () => {
    const data = createCardSchema.parse({
      front: "  texto  ",
      back: "  texto  ",
    });
    expect(data.front).toBe("texto");
    expect(data.back).toBe("texto");
  });
});

describe("updateCardSchema", () => {
  it("aceita dados válidos", () => {
    const data = updateCardSchema.parse({
      front: "<p>Nova frente</p>",
      back: "<p>Novo verso</p>",
    });
    expect(data.front).toBe("<p>Nova frente</p>");
    expect(data.back).toBe("<p>Novo verso</p>");
  });

  it("rejeita front vazio", () => {
    expect(() =>
      updateCardSchema.parse({ front: "", back: "<p>Verso</p>" }),
    ).toThrow(ZodError);
  });

  it("rejeita back vazio", () => {
    expect(() =>
      updateCardSchema.parse({ front: "<p>Frente</p>", back: "" }),
    ).toThrow(ZodError);
  });

  it("rejeita front maior que 10.000 caracteres", () => {
    expect(() =>
      updateCardSchema.parse({
        front: "a".repeat(10_001),
        back: "<p>Verso</p>",
      }),
    ).toThrow(ZodError);
  });

  it("rejeita back maior que 10.000 caracteres", () => {
    expect(() =>
      updateCardSchema.parse({
        front: "<p>Frente</p>",
        back: "a".repeat(10_001),
      }),
    ).toThrow(ZodError);
  });

  it("rejeita objeto vazio", () => {
    expect(() => updateCardSchema.parse({})).toThrow(ZodError);
  });

  it("faz trim automático em front e back", () => {
    const data = updateCardSchema.parse({
      front: "  texto  ",
      back: "  texto  ",
    });
    expect(data.front).toBe("texto");
    expect(data.back).toBe("texto");
  });
});

describe("createCardsBatchSchema", () => {
  it("aceita array de cards válidos", () => {
    const data = createCardsBatchSchema.parse({
      cards: [
        { front: "Front 1", back: "Back 1" },
        { front: "Front 2", back: "Back 2" },
      ],
    });
    expect(data.cards).toHaveLength(2);
    expect(data.cards[0].front).toBe("Front 1");
    expect(data.cards[1].back).toBe("Back 2");
  });

  it("rejeita array vazio", () => {
    expect(() => createCardsBatchSchema.parse({ cards: [] })).toThrow(ZodError);
  });

  it("rejeita mais de 50 cards", () => {
    const cards = Array.from({ length: 51 }, (_, i) => ({
      front: `Front ${i}`,
      back: `Back ${i}`,
    }));
    expect(() => createCardsBatchSchema.parse({ cards })).toThrow(ZodError);
  });

  it("rejeita card com front vazio no array", () => {
    expect(() =>
      createCardsBatchSchema.parse({
        cards: [{ front: "", back: "Back" }],
      }),
    ).toThrow(ZodError);
  });

  it("rejeita card com front acima de 10K caracteres no array", () => {
    expect(() =>
      createCardsBatchSchema.parse({
        cards: [{ front: "a".repeat(10_001), back: "Back" }],
      }),
    ).toThrow(ZodError);
  });

  it("faz trim nos cards do array", () => {
    const data = createCardsBatchSchema.parse({
      cards: [{ front: "  text  ", back: "  other  " }],
    });
    expect(data.cards[0].front).toBe("text");
    expect(data.cards[0].back).toBe("other");
  });
});
