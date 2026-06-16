import { createEmptyCard } from "ts-fsrs";

import { deckRepository } from "../repositories/deckRepository";

import { cardRepository } from "../repositories/cardRepository";

import { AppError } from "../utils/AppError";
import { withTransaction } from "../utils/transaction";

class DeckImportService {
  async importSharedDeck(token: string, userId: number) {
    const sourceDeck = await deckRepository.findByShareToken(token);

    if (!sourceDeck) {
      throw new AppError("Baralho não encontrado ou link inválido.", 404);
    }

    if (sourceDeck.user_id === userId) {
      throw new AppError("Você não pode importar seu próprio baralho.", 400);
    }

    const cards = await cardRepository.findByDeckId(sourceDeck.id);

    const emptyCard = createEmptyCard();

    const result = await withTransaction(async (client) => {
      const newDeck = await deckRepository.createCopy(
        client,
        userId,
        `${sourceDeck.title} (cópia)`,
        sourceDeck.description,
      );

      for (const card of cards) {
        await cardRepository.create(
          {
            deck_id: newDeck.id,
            front: card.front,
            back: card.back,

            stability: emptyCard.stability,
            difficulty: emptyCard.difficulty,
            elapsed_days: emptyCard.elapsed_days,
            scheduled_days: emptyCard.scheduled_days,
            reps: emptyCard.reps,
            lapses: emptyCard.lapses,
            state: emptyCard.state,
            due: emptyCard.due,
          },
          client,
        );
      }

      return {
        deck: newDeck,
        cards_count: cards.length,
        message: `${cards.length} cards importados com sucesso!`,
      };
    });

    return result;
  }
}

export const deckImportService = new DeckImportService();
