import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ShareModal from "../ShareModal";
import { ToastProvider } from "../../contexts/ToastContext";
import type { Deck } from "../../types";

vi.mock("../../api/decks", () => ({
  decksApi: {
    share: vi.fn(),
    unshare: vi.fn(),
  },
}));

vi.mock("../../hooks/useFocusTrap", () => ({
  useFocusTrap: () => ({ current: document.createElement("div") }),
}));

import { decksApi } from "../../api/decks";

const mockDeck: Deck = {
  id: 1,
  title: "Meu Baralho",
  description: "Descrição teste",
  card_count: 10,
  user_id: 1,
  is_public: false,
  created_at: "2025-01-01",
  new_cards_per_day: 20,
  share_token: null,
};

function renderModal(deck = mockDeck) {
  const onClose = vi.fn();
  const onUpdate = vi.fn();
  const result = render(
    <ToastProvider>
      <ShareModal deck={deck} onClose={onClose} onUpdate={onUpdate} />
    </ToastProvider>,
  );
  return { onClose, onUpdate, ...result };
}

describe("ShareModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve mostrar título do baralho", () => {
    renderModal();
    expect(screen.getByText("Meu Baralho")).toBeInTheDocument();
  });

  it("deve mostrar botão Gerar link quando não compartilhado", () => {
    renderModal();
    expect(screen.getByText("Gerar link")).toBeInTheDocument();
  });

  it("deve chamar decksApi.share ao clicar em Gerar link", async () => {
    vi.mocked(decksApi.share).mockResolvedValue({ token: "abc-123" });
    const { onUpdate } = renderModal();

    await userEvent.click(screen.getByText("Gerar link"));

    await waitFor(() => {
      expect(decksApi.share).toHaveBeenCalledWith(1);
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it("deve mostrar link quando compartilhado", () => {
    const sharedDeck = { ...mockDeck, share_token: "token-123" };
    renderModal(sharedDeck);
    expect(screen.getByText(/token-123/)).toBeInTheDocument();
    expect(screen.getByText("Copiar")).toBeInTheDocument();
    expect(screen.getByText("Desativar link")).toBeInTheDocument();
  });

  it("deve mostrar erro quando share falha", async () => {
    vi.mocked(decksApi.share).mockRejectedValue(new Error("Erro ao compartilhar"));
    renderModal();

    await userEvent.click(screen.getByText("Gerar link"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Erro ao compartilhar",
      );
    });
  });

  it("deve fechar ao clicar no overlay", async () => {
    const { onClose } = renderModal();
    const overlay = document.querySelector(".modal-overlay")!;
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });
});
