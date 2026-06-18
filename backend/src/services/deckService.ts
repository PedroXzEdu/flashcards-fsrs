import crypto from "crypto";

import { deckRepository, CreateDeckInput, UpdateDeckInput } from "../repositories/deckRepository";
import { AppError } from "../utils/AppError";
import { sanitizeInput } from "../utils/sanitize";
import { collector } from "../middlewares/metrics";

interface CreateDeckServiceInput {
  title: string;
  description?: string;
  is_public?: boolean;
  userId: number;
}

interface UpdateDeckServiceInput {
  title?: string;
  description?: string | null;
  is_public?: boolean;
}

class DeckService {
  async create(data: CreateDeckServiceInput) {
    if (!data.title) {
      throw new AppError("O título é obrigatório.", 400);
    }

    const repoInput: CreateDeckInput = {
      userId: data.userId,
      title: sanitizeInput(data.title),
      description: data.description ? sanitizeInput(data.description) : null,
      is_public: data.is_public ?? false,
    };

    const deck = await deckRepository.create(repoInput);

    collector.incrementBusiness("decksCreated");

    return deck;
  }

  async list(userId: number) {
    return deckRepository.findByUser(userId);
  }

  async get(id: number, userId: number) {
    const deck = await deckRepository.findById(id, userId);

    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    return deck;
  }

  async update(id: number, userId: number, data: UpdateDeckServiceInput) {
    const repoInput: UpdateDeckInput = {
      title: sanitizeInput(data.title ?? ""),
      description: data.description ? sanitizeInput(data.description) : null,
      is_public: data.is_public ?? false,
    };

    const deck = await deckRepository.update(id, userId, repoInput);

    if (!deck) {
      throw new AppError("Baralho não encontrado.", 404);
    }

    return deck;
  }

  async delete(id: number, userId: number) {
    const deleted = await deckRepository.delete(id, userId);

    if (!deleted) {
      throw new AppError("Baralho não encontrado.", 404);
    }
  }

  generateShareToken() {
    return crypto.randomBytes(24).toString("hex");
  }

  async getStats(deckId: number, userId: number) {
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

  async updateSettings(deckId: number, userId: number, data: { new_cards_per_day: number }) {
    const { new_cards_per_day } = data;

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

  async share(deckId: number, userId: number) {
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

  async unshare(deckId: number, userId: number) {
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
