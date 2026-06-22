import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import DeckCard from "../DeckCard";

const mockDeck = {
  id: 1,
  title: "Biologia",
  description: "Deck de biologia celular",
  card_count: 10,
  user_id: 1,
  is_public: false,
  created_at: "2025-01-01",
  new_cards_per_day: 20,
  share_token: null,
};

describe("DeckCard", () => {
  it("renderiza título e descrição", () => {
    render(
      <DeckCard
        deck={mockDeck}
        due={0}
        index={0}
        onNavigate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Biologia")).toBeInTheDocument();
    expect(screen.getByText("Deck de biologia celular")).toBeInTheDocument();
  });

  it("mostra contagem de cards", () => {
    render(
      <DeckCard
        deck={mockDeck}
        due={0}
        index={0}
        onNavigate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("10 cards")).toBeInTheDocument();
  });

  it("mostra badge de due quando due > 0", () => {
    render(
      <DeckCard
        deck={mockDeck}
        due={5}
        index={0}
        onNavigate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("5 hoje")).toBeInTheDocument();
  });

  it("não mostra badge de due quando due é 0", () => {
    render(
      <DeckCard
        deck={mockDeck}
        due={0}
        index={0}
        onNavigate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.queryByText(/hoje/)).not.toBeInTheDocument();
  });

  it("chama onNavigate ao clicar no card", async () => {
    const onNavigate = vi.fn();
    render(
      <DeckCard
        deck={mockDeck}
        due={0}
        index={0}
        onNavigate={onNavigate}
        onDelete={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByText("Biologia"));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it("chama onDelete ao clicar no botão de excluir", async () => {
    const onDelete = vi.fn();
    render(
      <DeckCard
        deck={mockDeck}
        due={0}
        index={0}
        onNavigate={vi.fn()}
        onDelete={onDelete}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Excluir baralho/i }));
    expect(onDelete).toHaveBeenCalledWith(mockDeck);
  });

  it("não mostra descrição quando é null", () => {
    const deckSemDescricao = { ...mockDeck, description: null };
    render(
      <DeckCard
        deck={deckSemDescricao}
        due={0}
        index={0}
        onNavigate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("Biologia")).toBeInTheDocument();
  });
});
