import crypto from "crypto";

import { deckRepository } from "../repositories/deckRepository";
import { AppError } from "../utils/AppError";
import { sanitizeInput } from "../utils/sanitize";

class DeckService {
  async create(data: any) {
    if (!data.title) {
      throw new AppError("O título é obrigatório.", 400);
    }

    return deckRepository.create({
      ...data,
      title: sanitizeInput(data.title),
      description: data.description ? sanitizeInput(data.description) : null,
      is_public: data.is_public || false,
    });
  }

  async list(userId: number) {
    return deckRepository.findByUser(userId);
  }

  async get(id: string, userId: number) {
    const deck = await deckRepository.findById(id, userId);

    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    return deck;
  }

  async update(id: string, userId: number, data: any) {
    if (!data.title) {
      throw new AppError("O título é obrigatório.", 400);
    }

    const deck = await deckRepository.update(id, userId, {
      ...data,
      title: sanitizeInput(data.title),
      description: data.description ? sanitizeInput(data.description) : null,
      is_public: data.is_public || false,
    });

    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    return deck;
  }

  async delete(id: string, userId: number) {
    const deleted = await deckRepository.delete(id, userId);

    if (!deleted) {
      throw new AppError("Baralho não encontrado.", 404);
    }
  }

  generateShareToken() {
    return crypto.randomBytes(24).toString("hex");
  }

  async getStats(deckId: string, userId: number) {
    const deckExists = await deckRepository.exists(deckId, userId);

    if (!deckExists) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    const cards = await deckRepository.getCardStats(deckId);

    const reviews = await deckRepository.getReviewStats(deckId, userId);

    return {
      cards,
      reviews,
    };
  }

  async updateSettings(deckId: string, userId: number, data: any) {
    const { new_cards_per_day } = data;

    if (typeof new_cards_per_day !== "number" || new_cards_per_day < 0) {
      throw new AppError("Valor inválido para new_cards_per_day.", 400);
    }

    const deck = await deckRepository.updateSettings(
      deckId,
      userId,
      new_cards_per_day,
    );

    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    return deck;
  }

  async share(deckId: string, userId: number) {
    const deck = await deckRepository.findByIdRaw(deckId, userId);

    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    if (deck.share_token) {
      return {
        token: deck.share_token,
      };
    }

    const token = crypto.randomBytes(24).toString("hex");

    await deckRepository.updateShareToken(deckId, token);

    return { token };
  }

  async unshare(deckId: string, userId: number) {
    const result = await deckRepository.removeShareToken(deckId, userId);

    if (!result) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    return {
      message: "Compartilhamento desativado.",
    };
  }

  async previewSharedDeck(token: string) {
    const deck = await deckRepository.getSharedDeckPreview(token);

    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    return deck;
  }
}

export const deckService = new DeckService();
