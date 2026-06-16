import { Grade, Rating, RecordLogItem } from "ts-fsrs";

import { fsrsService } from "./fsrsService";

import { cardRepository } from "../repositories/cardRepository";

import { reviewLogRepository } from "../repositories/reviewLogRepository";

import { deckRepository } from "../repositories/deckRepository";

import { AppError } from "../utils/AppError";

import { withTransaction } from "../utils/transaction";

import { logger } from "../config/logger";

import { collector } from "../middlewares/metrics";

class ReviewService {
  async getDueCards(deckId: number, userId: number) {
    const [cards, deck] = await Promise.all([
      cardRepository.findDueByDeck(deckId, userId),
      deckRepository.findByIdRaw(deckId, userId),
    ]);

    const newCardsPerDay = deck?.new_cards_per_day ?? 20;

    const reviewCards = cards.filter((c) => c.state !== 0);
    const newCards = cards
      .filter((c) => c.state === 0)
      .slice(0, newCardsPerDay);

    const result = [...reviewCards, ...newCards];

    return {
      cards: result,
      total: result.length,
    };
  }

  async previewReview(cardId: number, userId: number) {
    const card = await cardRepository.findById(cardId, userId);

    if (!card) {
      throw new AppError("Card não encontrado.", 404);
    }

    const preview = fsrsService.preview(card);

    return {
      again: this.formatPreview(preview[Rating.Again]),
      hard: this.formatPreview(preview[Rating.Hard]),
      good: this.formatPreview(preview[Rating.Good]),
      easy: this.formatPreview(preview[Rating.Easy]),
    };
  }

  async submitReview(cardId: number, userId: number, rating: Rating) {
    const card = await cardRepository.findById(cardId, userId);

    if (!card) {
      throw new AppError("Card não encontrado.", 404);
    }

    const scheduling = fsrsService.review(card, rating as Grade);

    const result = await withTransaction(async (client) => {
      const updatedCard = await cardRepository.updateFsrsData(
        client,
        cardId,
        scheduling.card,
      );

      logger.info(
        {
          cardId,
          due_antes: card.due,
          scheduling_due: scheduling.card.due,
          updated_due: updatedCard.due,
          stability: updatedCard.stability,
          state: updatedCard.state,
          scheduled_days: updatedCard.scheduled_days,
          rating: Number(rating),
        },
        "submitReview — card atualizado",
      );

      await reviewLogRepository.create(client, {
        user_id: userId,
        card_id: cardId,
        rating,
        state: scheduling.log.state,
        stability: scheduling.log.stability,
        difficulty: scheduling.log.difficulty,
        elapsed_days: scheduling.log.elapsed_days,
        scheduled_days: scheduling.log.scheduled_days,
        review: scheduling.log.review,
      });

      collector.incrementBusiness("reviewsSubmitted");

      return {
        card: updatedCard,
        review: scheduling.log,
        next_review: updatedCard.due,
        scheduled_days: updatedCard.scheduled_days,
      };
    });

    return result;
  }

  private formatPreview(item: RecordLogItem) {
    return {
      due: item.card.due,
      scheduled_days: item.card.scheduled_days,
    };
  }
}

export const reviewService = new ReviewService();
