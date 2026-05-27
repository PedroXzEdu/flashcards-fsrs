import { describe, it, expect, beforeEach } from "vitest";
import { Card, State, Rating, Grade } from "ts-fsrs";

import { fsrsService } from "../fsrsService";

function createNewCard(): Card {
  return {
    due: new Date("2025-01-01"),
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    state: State.New,
    last_review: undefined,
    learning_steps: 0,
  };
}

describe("FsrsService", () => {
  let newCard: Card;

  beforeEach(() => {
    newCard = createNewCard();
  });

  describe("preview", () => {
    it("deve retornar 4 ratings (Again, Hard, Good, Easy)", () => {
      const preview = fsrsService.preview(newCard);

      expect(preview[Rating.Again]).toBeDefined();
      expect(preview[Rating.Hard]).toBeDefined();
      expect(preview[Rating.Good]).toBeDefined();
      expect(preview[Rating.Easy]).toBeDefined();
    });

    it("cada item deve conter card, log e campos esperados", () => {
      const preview = fsrsService.preview(newCard);

      const grades = [
        Rating.Again,
        Rating.Hard,
        Rating.Good,
        Rating.Easy,
      ] as const;

      for (const grade of grades) {
        const item = preview[grade as Grade];

        expect(item).toHaveProperty("card");
        expect(item).toHaveProperty("log");

        expect(item).toHaveProperty("card.due");
        expect(item).toHaveProperty("card.stability");
        expect(item).toHaveProperty("card.difficulty");
        expect(item).toHaveProperty("card.scheduled_days");
      }
    });
  });

  describe("review", () => {
    it.each([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy])(
      "deve retornar RecordLogItem válido para rating %i",
      (rating) => {
        const result = fsrsService.review(newCard, rating as Grade);

        expect(result.card.stability).toBeTypeOf("number");
        expect(result.card.difficulty).toBeTypeOf("number");
        expect(result.card.elapsed_days).toBeTypeOf("number");
        expect(result.card.scheduled_days).toBeTypeOf("number");
        expect(result.card.reps).toBeTypeOf("number");
        expect(result.card.lapses).toBeTypeOf("number");
        expect(result.card.state).toBeTypeOf("number");
        expect(result.card.due).toBeInstanceOf(Date);
        expect(result.log.review).toBeInstanceOf(Date);
        expect(result.log.rating).toBeTypeOf("number");
      },
    );
  });

  describe("scheduling invariant", () => {
    it("Again <= Hard <= Good <= Easy em scheduled_days", () => {
      const preview = fsrsService.preview(newCard);

      const again = preview[Rating.Again].card.scheduled_days;
      const hard = preview[Rating.Hard].card.scheduled_days;
      const good = preview[Rating.Good].card.scheduled_days;
      const easy = preview[Rating.Easy].card.scheduled_days;

      expect(again).toBeLessThanOrEqual(hard);
      expect(hard).toBeLessThanOrEqual(good);
      expect(good).toBeLessThanOrEqual(easy);
    });
  });
});
