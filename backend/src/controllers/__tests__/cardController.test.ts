import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createCard,
  createCardsBatch,
  getCards,
  updateCard,
  deleteCard,
} from "../cardController";
import { cardService } from "../../services/cardService";
import { AppError } from "../../utils/AppError";

vi.mock("../../services/cardService", () => ({
  cardService: {
    create: vi.fn(),
    createBatch: vi.fn(),
    list: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockCard = {
  id: 1,
  deck_id: 1,
  front: "Frente",
  back: "Verso",
};

function createReq(
  params: Record<string, string> = {},
  body: Record<string, unknown> = {},
  query: Record<string, string> = {},
) {
  return { params, body, query, userId: 1 } as any;
}

function createRes() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
}

describe("CardController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createCard", () => {
    it("deve criar card e retornar 201 com success/data", async () => {
      vi.mocked(cardService.create).mockResolvedValue(mockCard);

      const req = createReq(
        { deck_id: "1" },
        { front: "Frente", back: "Verso" },
      );
      const res = createRes();
      const next = vi.fn();

      await createCard(req, res, next);

      expect(cardService.create).toHaveBeenCalledWith("1", 1, {
        front: "Frente",
        back: "Verso",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCard,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se cardService.create lançar erro", async () => {
      const error = new AppError("Baralho não encontrado.", 404);
      vi.mocked(cardService.create).mockRejectedValue(error);

      const req = createReq(
        { deck_id: "999" },
        { front: "Frente", back: "Verso" },
      );
      const res = createRes();
      const next = vi.fn();

      await createCard(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("createCardsBatch", () => {
    it("deve criar cards em lote e retornar 201 com success/data array", async () => {
      const mockCards = [
        { id: 1, deck_id: 1, front: "F1", back: "B1" },
        { id: 2, deck_id: 1, front: "F2", back: "B2" },
      ];
      vi.mocked(cardService.createBatch).mockResolvedValue(mockCards);

      const req = createReq(
        { deck_id: "1" },
        { cards: [{ front: "F1", back: "B1" }, { front: "F2", back: "B2" }] },
      );
      const res = createRes();
      const next = vi.fn();

      await createCardsBatch(req, res, next);

      expect(cardService.createBatch).toHaveBeenCalledWith("1", 1, [
        { front: "F1", back: "B1" },
        { front: "F2", back: "B2" },
      ]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCards,
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se cardService.createBatch lançar erro", async () => {
      const error = new AppError("Baralho não encontrado.", 404);
      vi.mocked(cardService.createBatch).mockRejectedValue(error);

      const req = createReq(
        { deck_id: "999" },
        { cards: [{ front: "F1", back: "B1" }] },
      );
      const res = createRes();
      const next = vi.fn();

      await createCardsBatch(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("getCards", () => {
    it("deve listar cards e retornar 200 com success/data/pagination", async () => {
      const paginatedResult = {
        cards: [mockCard],
        pagination: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      vi.mocked(cardService.list).mockResolvedValue(paginatedResult);

      const req = createReq({ deck_id: "1" });
      const res = createRes();
      const next = vi.fn();

      await getCards(req, res, next);

      expect(cardService.list).toHaveBeenCalledWith("1", 1, 1, 20);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: paginatedResult,
      });
      expect(res.status).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se cardService.list lançar erro", async () => {
      const error = new AppError("Baralho não encontrado.", 404);
      vi.mocked(cardService.list).mockRejectedValue(error);

      const req = createReq({ deck_id: "999" });
      const res = createRes();
      const next = vi.fn();

      await getCards(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("updateCard", () => {
    it("deve atualizar card e retornar 200 com success/data", async () => {
      vi.mocked(cardService.update).mockResolvedValue(mockCard);

      const req = createReq(
        { deck_id: "1", card_id: "1" },
        { front: "Nova Frente", back: "Novo Verso" },
      );
      const res = createRes();
      const next = vi.fn();

      await updateCard(req, res, next);

      expect(cardService.update).toHaveBeenCalledWith("1", "1", 1, {
        front: "Nova Frente",
        back: "Novo Verso",
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCard,
      });
      expect(res.status).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se cardService.update lançar erro", async () => {
      const error = new AppError("Card não encontrado.", 404);
      vi.mocked(cardService.update).mockRejectedValue(error);

      const req = createReq({ deck_id: "1", card_id: "999" });
      const res = createRes();
      const next = vi.fn();

      await updateCard(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("deleteCard", () => {
    it("deve deletar card e retornar 204 sem body", async () => {
      vi.mocked(cardService.delete).mockResolvedValue(undefined);

      const req = createReq({ deck_id: "1", card_id: "1" });
      const res = createRes();
      const next = vi.fn();

      await deleteCard(req, res, next);

      expect(cardService.delete).toHaveBeenCalledWith("1", "1", 1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it("deve chamar next(err) se cardService.delete lançar erro", async () => {
      const error = new AppError("Card não encontrado.", 404);
      vi.mocked(cardService.delete).mockRejectedValue(error);

      const req = createReq({ deck_id: "1", card_id: "999" });
      const res = createRes();
      const next = vi.fn();

      await deleteCard(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });
});
