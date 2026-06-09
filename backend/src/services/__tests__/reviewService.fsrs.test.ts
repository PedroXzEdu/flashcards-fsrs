import { describe, it, expect } from "vitest";
import {
  State,
  Rating,
  Grade,
  generatorParameters,
  createEmptyCard,
  fsrs,
} from "ts-fsrs";

// Mesma configuração usada pela aplicação (fsrsService.ts)
const f = fsrs(generatorParameters());

function newCard() {
  return createEmptyCard(new Date("2025-01-01"));
}

function cardInReview() {
  // New → Good (Learning) → Good (Review)
  let card = newCard();
  card = f.repeat(card, Rating.Good as Grade)[Rating.Good].card;
  card = f.repeat(card, Rating.Good as Grade)[Rating.Good].card;
  return card;
}

function cardInRelearning() {
  const review = cardInReview();
  return f.repeat(review, Rating.Again as Grade)[Rating.Again].card;
}

function cardInLearning() {
  const card = newCard();
  return f.repeat(card, Rating.Again as Grade)[Rating.Again].card;
}

describe("FSRS State Transitions (default config)", () => {
  it("New + Again -> State.Learning (learning step 1)", () => {
    const result = f.repeat(newCard(), Rating.Again as Grade);
    expect(result[Rating.Again].card.state).toBe(State.Learning);
  });

  it("New + Good -> State.Learning", () => {
    const result = f.repeat(newCard(), Rating.Good as Grade);
    expect(result[Rating.Good].card.state).toBe(State.Learning);
  });

  it("New + Easy -> State.Review", () => {
    const result = f.repeat(newCard(), Rating.Easy as Grade);
    expect(result[Rating.Easy].card.state).toBe(State.Review);
    expect(result[Rating.Easy].card.scheduled_days).toBeGreaterThan(0);
  });

  it("Learning + Good -> State.Review (completa learning steps)", () => {
    const learning = f.repeat(newCard(), Rating.Good as Grade);
    const result = f.repeat(learning[Rating.Good].card, Rating.Good as Grade);
    expect(result[Rating.Good].card.state).toBe(State.Review);
    expect(result[Rating.Good].card.scheduled_days).toBeGreaterThan(0);
  });

  it("Learning + Again -> State.Learning (reset)", () => {
    const learning = f.repeat(newCard(), Rating.Good as Grade);
    const result = f.repeat(learning[Rating.Good].card, Rating.Again as Grade);
    expect(result[Rating.Again].card.state).toBe(State.Learning);
  });

  it("Learning + Easy -> State.Review", () => {
    const card = cardInLearning();
    const result = f.repeat(card, Rating.Easy as Grade);
    expect(result[Rating.Easy].card.state).toBe(State.Review);
    expect(result[Rating.Easy].card.scheduled_days).toBeGreaterThan(0);
  });

  it("Review + Again -> State.Relearning", () => {
    const card = cardInReview();
    const result = f.repeat(card, Rating.Again as Grade);
    expect(result[Rating.Again].card.state).toBe(State.Relearning);
    expect(result[Rating.Again].card.lapses).toBe(1);
  });

  it("Review + Good -> State.Review (permanece)", () => {
    const card = cardInReview();
    const result = f.repeat(card, Rating.Good as Grade);
    expect(result[Rating.Good].card.state).toBe(State.Review);
  });

  it("Review + Hard -> scheduled_days entre Again e Good", () => {
    const card = cardInReview();
    const again = f.repeat(card, Rating.Again as Grade);
    const hard = f.repeat(card, Rating.Hard as Grade);
    const good = f.repeat(card, Rating.Good as Grade);
    expect(hard[Rating.Hard].card.scheduled_days).toBeGreaterThanOrEqual(
      again[Rating.Again].card.scheduled_days,
    );
    expect(hard[Rating.Hard].card.scheduled_days).toBeLessThanOrEqual(
      good[Rating.Good].card.scheduled_days,
    );
  });

  it("Review + Easy -> scheduled_days >= Good", () => {
    const card = cardInReview();
    const easy = f.repeat(card, Rating.Easy as Grade);
    const good = f.repeat(card, Rating.Good as Grade);
    expect(easy[Rating.Easy].card.scheduled_days).toBeGreaterThanOrEqual(
      good[Rating.Good].card.scheduled_days,
    );
  });

  it("Relearning + Again -> State.Relearning (permanece)", () => {
    const card = cardInRelearning();
    const result = f.repeat(card, Rating.Again as Grade);
    expect(result[Rating.Again].card.state).toBe(State.Relearning);
  });

  it("Relearning + Good -> State.Review (recupera)", () => {
    const card = cardInRelearning();
    const result = f.repeat(card, Rating.Good as Grade);
    expect(result[Rating.Good].card.state).toBe(State.Review);
    expect(result[Rating.Good].card.scheduled_days).toBeGreaterThan(0);
  });

  it("Relearning + Easy -> State.Review com scheduled_days maior", () => {
    const card = cardInRelearning();
    const result = f.repeat(card, Rating.Easy as Grade);
    expect(result[Rating.Easy].card.state).toBe(State.Review);
    expect(result[Rating.Easy].card.scheduled_days).toBeGreaterThan(0);
  });
});

describe("FSRS Scheduling Fields (default config)", () => {
  it("stability, difficulty, scheduled_days são números válidos", () => {
    const card = cardInReview();
    const result = f.repeat(card, Rating.Good as Grade);
    expect(result[Rating.Good].card.stability).toBeTypeOf("number");
    expect(result[Rating.Good].card.difficulty).toBeTypeOf("number");
    expect(result[Rating.Good].card.scheduled_days).toBeTypeOf("number");
    expect(result[Rating.Good].card.due).toBeInstanceOf(Date);
  });

  it("reps aumenta a cada review", () => {
    const card = newCard();
    expect(card.reps).toBe(0);
    const r1 = f.repeat(card, Rating.Good as Grade);
    expect(r1[Rating.Good].card.reps).toBe(1);
    const r2 = f.repeat(r1[Rating.Good].card, Rating.Good as Grade);
    expect(r2[Rating.Good].card.reps).toBe(2);
  });

  it("scheduling invariant: Again <= Hard <= Good <= Easy", () => {
    const card = cardInReview();
    const result = f.repeat(card, Rating.Good as Grade);
    expect(result[Rating.Again].card.scheduled_days).toBeLessThanOrEqual(
      result[Rating.Hard].card.scheduled_days,
    );
    expect(result[Rating.Hard].card.scheduled_days).toBeLessThanOrEqual(
      result[Rating.Good].card.scheduled_days,
    );
    expect(result[Rating.Good].card.scheduled_days).toBeLessThanOrEqual(
      result[Rating.Easy].card.scheduled_days,
    );
  });

  it("lapses não incrementa em Relearning no mesmo lapse", () => {
    const card = cardInRelearning();
    const result = f.repeat(card, Rating.Again as Grade);
    expect(result[Rating.Again].card.lapses).toBe(1);
  });
});
