import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { createCardSchema, updateCardSchema } from "../cardSchema";

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
