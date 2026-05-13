import { Rating } from "ts-fsrs";

import { pool } from "../database/db";

import { fsrsService } from "./fsrsService";

import { cardRepository } from "../repositories/cardRepository";

import { reviewLogRepository } from "../repositories/reviewLogRepository";

import { AppError } from "../utils/AppError";

class ReviewService {
  async getDueCards(deckId: string, userId: number) {
    const cards = await cardRepository.findDueByDeck(deckId, userId);

    return {
      cards,
      total: cards.length,
    };
  }

  async previewReview(cardId: string, userId: number) {
    const card = await cardRepository.findById(cardId, userId);

    if (!card) {
      throw new AppError("Card nÃ£o encontrado.", 404);
    }

    const preview = fsrsService.preview(card);

    return {
      again: this.formatPreview(preview[Rating.Again]),
      hard: this.formatPreview(preview[Rating.Hard]),
      good: this.formatPreview(preview[Rating.Good]),
      easy: this.formatPreview(preview[Rating.Easy]),
    };
  }

  async submitReview(cardId: string, userId: number, rating: Rating) {
    if (![Rating.Again, Rating.Hard, Rating.Good, Rating.Easy].includes(rating)) {
      throw new AppError("Rating invÃ¡lido.", 400);
    }

    const card = await cardRepository.findById(cardId, userId);

    if (!card) {
      throw new AppError("Card não encontrado.", 404);
    }

    const scheduling = fsrsService.review(card, rating);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const updatedCard = await cardRepository.updateFsrsData(
        client,
        cardId,
        scheduling.card,
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

      await client.query("COMMIT");

      return {
        card: updatedCard,
        review: scheduling.log,
        next_review: updatedCard.due,
        scheduled_days: updatedCard.scheduled_days,
      };
    } catch (err) {
      await client.query("ROLLBACK");

      throw err;
    } finally {
      client.release();
    }
  }

  private formatPreview(item: any) {
    return {
      due: item.card.due,
      scheduled_days: item.card.scheduled_days,
    };
  }
}

export const reviewService = new ReviewService();
