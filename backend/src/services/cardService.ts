import { createEmptyCard } from "ts-fsrs";
import { cardRepository } from "../repositories/cardRepository";
import { deckRepository } from "../repositories/deckRepository";
import { AppError } from "../utils/AppError";

class CardService {
  async create(
    deckId: string,
    userId: number,
    data: { front: string; back: string },
  ) {
    const deck = await deckRepository.findById(deckId, userId);
    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const emptyCard = createEmptyCard();
    const card = await cardRepository.createDirect({
      deck_id: parseInt(deckId),
      front: data.front,
      back: data.back,
      stability: emptyCard.stability,
      difficulty: emptyCard.difficulty,
      elapsed_days: emptyCard.elapsed_days,
      scheduled_days: emptyCard.scheduled_days,
      reps: emptyCard.reps,
      lapses: emptyCard.lapses,
      state: emptyCard.state,
      due: emptyCard.due,
    });

    return card;
  }

  async list(deckId: string, userId: number) {
    const deck = await deckRepository.findById(deckId, userId);
    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    return cardRepository.findByDeckId(deckId);
  }

  async update(
    deckId: string,
    cardId: string,
    userId: number,
    data: { front: string; back: string },
  ) {
    const deck = await deckRepository.findById(deckId, userId);
    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const card = await cardRepository.update(
      deckId,
      cardId,
      data.front,
      data.back,
    );
    if (!card) {
      throw new AppError("Card não encontrado.", 404);
    }

    return card;
  }

  async delete(deckId: string, cardId: string, userId: number) {
    const deck = await deckRepository.findById(deckId, userId);
    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const result = await cardRepository.delete(deckId, cardId);
    if (!result) {
      throw new AppError("Card não encontrado.", 404);
    }
  }
}

export const cardService = new CardService();
