import { createEmptyCard } from "ts-fsrs";
import { cardRepository } from "../repositories/cardRepository";
import { deckRepository } from "../repositories/deckRepository";
import { AppError } from "../utils/AppError";
import { collector } from "../middlewares/metrics";
import { sanitizeHtml } from "../utils/sanitizeHtml";

class CardService {
  async create(
    deckId: number,
    userId: number,
    data: { front: string; back: string; tags?: string[] },
  ) {
    const deck = await deckRepository.findById(deckId, userId);
    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const emptyCard = createEmptyCard();
    const card = await cardRepository.create({
      deck_id: deckId,
      front: sanitizeHtml(data.front),
      back: sanitizeHtml(data.back),
      stability: emptyCard.stability,
      difficulty: emptyCard.difficulty,
      elapsed_days: emptyCard.elapsed_days,
      scheduled_days: emptyCard.scheduled_days,
      reps: emptyCard.reps,
      lapses: emptyCard.lapses,
      state: emptyCard.state,
      due: emptyCard.due,
      tags: data.tags,
    });

    collector.incrementBusiness("cardsCreated");

    return card;
  }

  async createBatch(
    deckId: number,
    userId: number,
    cards: { front: string; back: string; tags?: string[] }[],
  ) {
    const deck = await deckRepository.findById(deckId, userId);
    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const emptyCard = createEmptyCard();
    const cardsData = cards.map((c) => ({
      front: sanitizeHtml(c.front),
      back: sanitizeHtml(c.back),
      stability: emptyCard.stability,
      difficulty: emptyCard.difficulty,
      elapsed_days: emptyCard.elapsed_days,
      scheduled_days: emptyCard.scheduled_days,
      reps: emptyCard.reps,
      lapses: emptyCard.lapses,
      state: emptyCard.state,
      due: emptyCard.due,
      tags: c.tags,
    }));

    const created = await cardRepository.createBatch(
      deckId,
      cardsData,
    );

    for (let i = 0; i < created.length; i++) {
      collector.incrementBusiness("cardsCreated");
    }

    return created;
  }

  async list(deckId: number, userId: number, page = 1, limit = 20) {
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
    deckId: number,
    cardId: number,
    userId: number,
    data: { front: string; back: string; tags?: string[] },
  ) {
    const deck = await deckRepository.findById(deckId, userId);
    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const card = await cardRepository.update(
      deckId,
      cardId,
      sanitizeHtml(data.front),
      sanitizeHtml(data.back),
      data.tags,
    );
    if (!card) {
      throw new AppError("Card não encontrado.", 404);
    }

    return card;
  }

  async delete(deckId: number, cardId: number, userId: number) {
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
