import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { reviewSchema } from "../reviewSchema";

describe("reviewSchema", () => {
  it("aceita rating 1", () => {
    const data = reviewSchema.parse({ rating: 1 });
    expect(data.rating).toBe(1);
  });

  it("aceita rating 2", () => {
    const data = reviewSchema.parse({ rating: 2 });
    expect(data.rating).toBe(2);
  });

  it("aceita rating 3", () => {
    const data = reviewSchema.parse({ rating: 3 });
    expect(data.rating).toBe(3);
  });

  it("aceita rating 4", () => {
    const data = reviewSchema.parse({ rating: 4 });
    expect(data.rating).toBe(4);
  });

  it("rejeita rating 0", () => {
    expect(() => reviewSchema.parse({ rating: 0 })).toThrow(ZodError);
  });

  it("rejeita rating 5", () => {
    expect(() => reviewSchema.parse({ rating: 5 })).toThrow(ZodError);
  });

  it("rejeita rating negativo", () => {
    expect(() => reviewSchema.parse({ rating: -1 })).toThrow(ZodError);
  });

  it("rejeita rating não inteiro", () => {
    expect(() => reviewSchema.parse({ rating: 1.5 })).toThrow(ZodError);
  });

  it("rejeita string no lugar de número", () => {
    expect(() => reviewSchema.parse({ rating: "1" })).toThrow(ZodError);
  });

  it("rejeita objeto vazio", () => {
    expect(() => reviewSchema.parse({})).toThrow(ZodError);
  });
});
