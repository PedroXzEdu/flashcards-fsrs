import { createEmptyCard } from "ts-fsrs";
import { deckRepository } from "../repositories/deckRepository";
import { cardRepository } from "../repositories/cardRepository";
import { collector } from "../middlewares/metrics";
import { sanitizeHtml } from "../utils/sanitizeHtml";

interface NoteInput {
  front: string;
  back: string;
}

class ImportService {
  async createDeckFromAnki(
    userId: number,
    deckName: string,
    notes: NoteInput[],
  ) {
    const deck = await deckRepository.create({
      userId,
      title: deckName,
      description: "Importado do Anki",
      is_public: false,
    });

    const emptyCard = createEmptyCard();
    let imported = 0;
    let skipped = 0;

    for (const note of notes) {
      if (!note.front || !note.back) {
        skipped++;
        continue;
      }

      await cardRepository.create({
        deck_id: deck.id,
        front: sanitizeHtml(note.front),
        back: sanitizeHtml(note.back),
        stability: emptyCard.stability,
        difficulty: emptyCard.difficulty,
        elapsed_days: emptyCard.elapsed_days,
        scheduled_days: emptyCard.scheduled_days,
        reps: emptyCard.reps,
        lapses: emptyCard.lapses,
        state: emptyCard.state,
        due: emptyCard.due,
      });
      imported++;
    }

    collector.incrementBusiness("importsCompleted");

    return { deck, imported, skipped };
  }
}

export const importService = new ImportService();
