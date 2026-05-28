import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createDeck,
  getDecks,
  getDeck,
  updateDeck,
  deleteDeck,
  getDeckStats,
  updateDeckSettings,
  shareDeck,
  unshareDeck,
  importSharedDeck,
  getSharedDeckPreview,
} from "../deckController";
import { deckService } from "../../services/deckService";
import { deckImportService } from "../../services/deckImportService";
import { AppError } from "../../utils/AppError";

vi.mock("../../services/deckService", () => ({
  deckService: {
    create: vi.fn(),
    list: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getStats: vi.fn(),
    updateSettings: vi.fn(),
    share: vi.fn(),
    unshare: vi.fn(),
    previewSharedDeck: vi.fn(),
  },
}));

vi.mock("../../services/deckImportService", () => ({
  deckImportService: {
    importSharedDeck: vi.fn(),
  },
}));

const mockDeck = { id: 1, title: "Meu Baralho", description: "Descrição" };
const mockDecks = [mockDeck];
const mockShareResult = { token: "abc123" };
const mockUnshareResult = { message: "Compartilhamento desativado." };
const mockImportResult = {
  deck: { id: 1, title: "Baralho (cópia)", description: "Descrição" },
  cards_count: 5,
  message: "5 cards importados com sucesso!",
};
const mockPreview = {
  title: "Baralho Compartilhado",
  description: "Descrição",
  card_count: 5,
};
const mockStats = {
  cards: {
    total: 10,
    new_cards: 2,
    learning: 1,
    reviewing: 7,
    due_today: 3,
    avg_difficulty: 5.5,
    avg_stability: 3.2,
    lapses: 0,
  },
  reviews: {
    total_reviews: 20,
    again_count: 3,
    hard_count: 2,
    good_count: 10,
    easy_count: 5,
    retention_rate: 85.0,
  },
};

function createAuthReq(
  params: Record<string, string> = {},
  body: Record<string, unknown> = {},
) {
  return { params, body, userId: 1 } as any;
}

function createPublicReq(params: Record<string, string> = {}) {
  return { params } as any;
}

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

describe("DeckController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDeck", () => {
    it("deve criar baralho e retornar 201 com success/data", async () => {
      vi.mocked(deckService.create).mockResolvedValue(mockDeck);

      const req = createAuthReq(
        {},
        { title: "Meu Baralho", description: "Descrição" },
      );
      const res = createRes();
      const next = vi.fn();

      await createDeck(req, res, next);

      expect(deckService.create).toHaveBeenCalledWith({
        userId: 1,
        title: "Meu Baralho",
        description: "Descrição",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDeck,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se deckService.create lançar erro", async () => {
      const error = new AppError("Erro ao criar baralho.", 500);
      vi.mocked(deckService.create).mockRejectedValue(error);

      const req = createAuthReq({}, { title: "Erro" });
      const res = createRes();
      const next = vi.fn();

      await createDeck(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getDecks", () => {
    it("deve listar baralhos com success/data", async () => {
      vi.mocked(deckService.list).mockResolvedValue(mockDecks);

      const req = createAuthReq();
      const res = createRes();
      const next = vi.fn();

      await getDecks(req, res, next);

      expect(deckService.list).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDecks,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se deckService.list lançar erro", async () => {
      const error = new AppError("Erro ao listar.", 500);
      vi.mocked(deckService.list).mockRejectedValue(error);

      const req = createAuthReq();
      const res = createRes();
      const next = vi.fn();

      await getDecks(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getDeck", () => {
    it("deve retornar baralho com success/data", async () => {
      vi.mocked(deckService.get).mockResolvedValue(mockDeck);

      const req = createAuthReq({ id: "1" });
      const res = createRes();
      const next = vi.fn();

      await getDeck(req, res, next);

      expect(deckService.get).toHaveBeenCalledWith("1", 1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDeck,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se deckService.get lançar erro", async () => {
      const error = new AppError("Baralho não encontrado.", 404);
      vi.mocked(deckService.get).mockRejectedValue(error);

      const req = createAuthReq({ id: "999" });
      const res = createRes();
      const next = vi.fn();

      await getDeck(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("updateDeck", () => {
    it("deve atualizar baralho e retornar 200 com success/data", async () => {
      vi.mocked(deckService.update).mockResolvedValue(mockDeck);

      const req = createAuthReq({ id: "1" }, { title: "Novo Título" });
      const res = createRes();
      const next = vi.fn();

      await updateDeck(req, res, next);

      expect(deckService.update).toHaveBeenCalledWith("1", 1, {
        title: "Novo Título",
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDeck,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se deckService.update lançar erro", async () => {
      const error = new AppError("Baralho não encontrado.", 404);
      vi.mocked(deckService.update).mockRejectedValue(error);

      const req = createAuthReq({ id: "999" });
      const res = createRes();
      const next = vi.fn();

      await updateDeck(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("deleteDeck", () => {
    it("deve deletar baralho e retornar 204 sem body", async () => {
      vi.mocked(deckService.delete).mockResolvedValue(undefined);

      const req = createAuthReq({ id: "1" });
      const res = createRes();
      const next = vi.fn();

      await deleteDeck(req, res, next);

      expect(deckService.delete).toHaveBeenCalledWith("1", 1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se deckService.delete lançar erro", async () => {
      const error = new AppError("Baralho não encontrado.", 404);
      vi.mocked(deckService.delete).mockRejectedValue(error);

      const req = createAuthReq({ id: "999" });
      const res = createRes();
      const next = vi.fn();

      await deleteDeck(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe("getDeckStats", () => {
    it("deve retornar estatísticas do baralho com success/data", async () => {
      vi.mocked(deckService.getStats).mockResolvedValue(mockStats);

      const req = createAuthReq({ id: "1" });
      const res = createRes();
      const next = vi.fn();

      await getDeckStats(req, res, next);

      expect(deckService.getStats).toHaveBeenCalledWith("1", 1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se deckService.getStats lançar erro", async () => {
      const error = new AppError("Baralho não encontrado.", 404);
      vi.mocked(deckService.getStats).mockRejectedValue(error);

      const req = createAuthReq({ id: "999" });
      const res = createRes();
      const next = vi.fn();

      await getDeckStats(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("updateDeckSettings", () => {
    it("deve atualizar configurações com success/data", async () => {
      vi.mocked(deckService.updateSettings).mockResolvedValue(mockDeck);

      const req = createAuthReq({ id: "1" }, { new_cards_per_day: 10 });
      const res = createRes();
      const next = vi.fn();

      await updateDeckSettings(req, res, next);

      expect(deckService.updateSettings).toHaveBeenCalledWith("1", 1, {
        new_cards_per_day: 10,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDeck,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se deckService.updateSettings lançar erro", async () => {
      const error = new AppError("Baralho não encontrado.", 404);
      vi.mocked(deckService.updateSettings).mockRejectedValue(error);

      const req = createAuthReq({ id: "999" });
      const res = createRes();
      const next = vi.fn();

      await updateDeckSettings(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("shareDeck", () => {
    it("deve compartilhar baralho e retornar token com success/data", async () => {
      vi.mocked(deckService.share).mockResolvedValue(mockShareResult);

      const req = createAuthReq({ id: "1" });
      const res = createRes();
      const next = vi.fn();

      await shareDeck(req, res, next);

      expect(deckService.share).toHaveBeenCalledWith("1", 1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockShareResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se deckService.share lançar erro", async () => {
      const error = new AppError("Baralho não encontrado.", 404);
      vi.mocked(deckService.share).mockRejectedValue(error);

      const req = createAuthReq({ id: "999" });
      const res = createRes();
      const next = vi.fn();

      await shareDeck(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("unshareDeck", () => {
    it("deve remover compartilhamento com success/data", async () => {
      vi.mocked(deckService.unshare).mockResolvedValue(mockUnshareResult);

      const req = createAuthReq({ id: "1" });
      const res = createRes();
      const next = vi.fn();

      await unshareDeck(req, res, next);

      expect(deckService.unshare).toHaveBeenCalledWith("1", 1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUnshareResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se deckService.unshare lançar erro", async () => {
      const error = new AppError("Baralho não encontrado.", 404);
      vi.mocked(deckService.unshare).mockRejectedValue(error);

      const req = createAuthReq({ id: "999" });
      const res = createRes();
      const next = vi.fn();

      await unshareDeck(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("importSharedDeck", () => {
    it("deve importar baralho compartilhado e retornar 201 com success/data", async () => {
      vi.mocked(deckImportService.importSharedDeck).mockResolvedValue(
        mockImportResult,
      );

      const req = createAuthReq({ token: "abc123" });
      const res = createRes();
      const next = vi.fn();

      await importSharedDeck(req, res, next);

      expect(deckImportService.importSharedDeck).toHaveBeenCalledWith(
        "abc123",
        1,
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockImportResult,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se deckImportService.importSharedDeck lançar erro", async () => {
      const error = new AppError("Link inválido.", 404);
      vi.mocked(deckImportService.importSharedDeck).mockRejectedValue(error);

      const req = createAuthReq({ token: "invalido" });
      const res = createRes();
      const next = vi.fn();

      await importSharedDeck(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getSharedDeckPreview", () => {
    it("deve retornar preview do baralho compartilhado com success/data (rota pública)", async () => {
      vi.mocked(deckService.previewSharedDeck).mockResolvedValue(mockPreview);

      const req = createPublicReq({ token: "abc123" });
      const res = createRes();
      const next = vi.fn();

      await getSharedDeckPreview(req, res, next);

      expect(deckService.previewSharedDeck).toHaveBeenCalledWith("abc123");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPreview,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se deckService.previewSharedDeck lançar erro", async () => {
      const error = new AppError("Baralho não encontrado.", 404);
      vi.mocked(deckService.previewSharedDeck).mockRejectedValue(error);

      const req = createPublicReq({ token: "invalido" });
      const res = createRes();
      const next = vi.fn();

      await getSharedDeckPreview(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
