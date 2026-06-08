import { createEmptyCard } from "ts-fsrs";
import { cardRepository } from "../repositories/cardRepository";
import { deckRepository } from "../repositories/deckRepository";
import { AppError } from "../utils/AppError";
import { collector } from "../middlewares/metrics";

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
    const card = await cardRepository.create({
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

    collector.incrementBusiness("cardsCreated");

    return card;
  }

  async createBatch(
    deckId: string,
    userId: number,
    cards: { front: string; back: string }[],
  ) {
    const deck = await deckRepository.findById(deckId, userId);
    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const emptyCard = createEmptyCard();
    const cardsData = cards.map((c) => ({
      front: c.front,
      back: c.back,
      stability: emptyCard.stability,
      difficulty: emptyCard.difficulty,
      elapsed_days: emptyCard.elapsed_days,
      scheduled_days: emptyCard.scheduled_days,
      reps: emptyCard.reps,
      lapses: emptyCard.lapses,
      state: emptyCard.state,
      due: emptyCard.due,
    }));

    const created = await cardRepository.createBatch(
      parseInt(deckId),
      cardsData,
    );

    for (let i = 0; i < created.length; i++) {
      collector.incrementBusiness("cardsCreated");
    }

    return created;
  }

  async list(deckId: string, userId: number, page = 1, limit = 20) {
    const deck = await deckRepository.findById(deckId, userId);
    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const clampedLimit = Math.min(Math.max(limit, 1), 100);
    const result = await cardRepository.findByDeckIdPaginated(
      deckId,
      page,
      clampedLimit,
    );

    return {
      cards: result.rows,
      pagination: {
        total: result.total,
        page,
        limit: clampedLimit,
        totalPages: Math.ceil(result.total / clampedLimit),
      },
    };
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
