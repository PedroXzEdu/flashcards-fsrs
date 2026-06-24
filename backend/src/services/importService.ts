import { createEmptyCard } from "ts-fsrs";
import { deckRepository } from "../repositories/deckRepository";
import { cardRepository } from "../repositories/cardRepository";
import { collector } from "../middlewares/metrics";
import { sanitizeHtml } from "../utils/sanitizeHtml";
import { AppError } from "../utils/AppError";

interface NoteInput {
  front: string;
  back: string;
}

class ImportService {
  async importFromCsvTxt(
    userId: number,
    deckId: number,
    content: string,
    ext: string,
  ) {
    const deck = await deckRepository.findById(deckId, userId);
    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const pairs = ext === ".csv" ? parseCsv(content) : parseTxt(content);

    if (pairs.length === 0) {
      throw new AppError("Nenhum par frente/verso encontrado no arquivo.", 400);
    }

    const emptyCard = createEmptyCard();
    let imported = 0;
    let skipped = 0;

    for (const pair of pairs) {
      if (!pair.front || !pair.back) {
        skipped++;
        continue;
      }

      await cardRepository.create({
        deck_id: deckId,
        front: sanitizeHtml(pair.front),
        back: sanitizeHtml(pair.back),
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

    if (imported === 0) {
      throw new AppError("Nenhum card válido foi importado.", 400);
    }

    collector.incrementBusiness("importsCompleted");

    return { deck, imported, skipped };
  }

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

function parseTxt(content: string): { front: string; back: string }[] {
  return content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l)
    .map((l) => {
      const sep = l.includes("\t") ? "\t" : "|";
      const [front, ...rest] = l.split(sep);
      return { front: front?.trim() || "", back: rest.join(sep).trim() };
    })
    .filter((p) => p.front && p.back);
}

function parseCsv(content: string): { front: string; back: string }[] {
  const lines = content.split("\n").map((l) => l.trim()).filter((l) => l);
  if (lines.length === 0) return [];

  const headerKeywords = ["front", "frente", "pergunta", "question", "back", "verso", "resposta", "answer"];
  const firstLine = lines[0].toLowerCase().trim();
  const hasHeader = headerKeywords.some((kw) => firstLine.startsWith(kw));
  const dataLines = hasHeader ? lines.slice(1) : lines;

  function parseLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  return dataLines
    .map((line) => {
      const cols = parseLine(line);
      return {
        front: cols[0] || "",
        back: cols[1] || cols.slice(1).join(" ") || "",
      };
    })
    .filter((p) => p.front && p.back);
}
