import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import RatingButtons from "../RatingButtons";

const mockPreview = {
  again: { due: new Date().toISOString(), scheduled_days: 0 },
  hard: { due: new Date().toISOString(), scheduled_days: 1 },
  good: { due: new Date().toISOString(), scheduled_days: 3 },
  easy: { due: new Date().toISOString(), scheduled_days: 7 },
};

describe("RatingButtons", () => {
  it("renderiza dicas de teclado quando não virado", () => {
    render(
      <RatingButtons
        preview={null}
        submitting={false}
        onRate={vi.fn()}
        flipped={false}
        error=""
      />,
    );
    expect(screen.getByText(/para virar/i)).toBeInTheDocument();
  });

  it("não renderiza botões de rating quando não virado", () => {
    render(
      <RatingButtons
        preview={null}
        submitting={false}
        onRate={vi.fn()}
        flipped={false}
        error=""
      />,
    );
    expect(screen.queryByText("De novo")).not.toBeInTheDocument();
    expect(screen.queryByText("Bom")).not.toBeInTheDocument();
  });

  it("renderiza 4 botões de rating quando virado", () => {
    render(
      <RatingButtons
        preview={null}
        submitting={false}
        onRate={vi.fn()}
        flipped={true}
        error=""
      />,
    );
    expect(screen.getByText("De novo")).toBeInTheDocument();
    expect(screen.getByText("Difícil")).toBeInTheDocument();
    expect(screen.getByText("Bom")).toBeInTheDocument();
    expect(screen.getByText("Fácil")).toBeInTheDocument();
  });

  it("mostra scheduled_days no preview", () => {
    render(
      <RatingButtons
        preview={mockPreview}
        submitting={false}
        onRate={vi.fn()}
        flipped={true}
        error=""
      />,
    );
    expect(screen.getByText("≤1m")).toBeInTheDocument();
    expect(screen.getByText("1d")).toBeInTheDocument();
    expect(screen.getByText("3d")).toBeInTheDocument();
    expect(screen.getByText("7d")).toBeInTheDocument();
  });

  it("chama onRate com valor correto ao clicar", async () => {
    const onRate = vi.fn();
    render(
      <RatingButtons
        preview={null}
        submitting={false}
        onRate={onRate}
        flipped={true}
        error=""
      />,
    );
    await userEvent.click(screen.getByText("Bom"));
    expect(onRate).toHaveBeenCalledWith(3);
  });

  it("mostra mensagem de erro quando error não é vazio", () => {
    render(
      <RatingButtons
        preview={null}
        submitting={false}
        onRate={vi.fn()}
        flipped={true}
        error="Erro ao salvar"
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Erro ao salvar");
  });

  it("desabilita botões quando submitting", () => {
    render(
      <RatingButtons
        preview={null}
        submitting={true}
        onRate={vi.fn()}
        flipped={true}
        error=""
      />,
    );
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
