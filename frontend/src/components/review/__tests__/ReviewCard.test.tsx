import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ReviewCard from "../ReviewCard";

const mockCard = {
  id: 1,
  deck_id: 1,
  front: "<p>Qual a capital do Brasil?</p>",
  back: "<p>Brasília</p>",
  stability: 2.5,
  difficulty: 0.5,
  elapsed_days: 0,
  scheduled_days: 0,
  reps: 0,
  lapses: 0,
  state: 0,
  due: new Date().toISOString(),
  last_review: null,
  created_at: new Date().toISOString(),
};

describe("ReviewCard", () => {
  it("renderiza o front do card", () => {
    render(<ReviewCard card={mockCard} flipped={false} onFlip={vi.fn()} />);
    expect(screen.getByText("FRENTE")).toBeInTheDocument();
    expect(screen.getByText("Qual a capital do Brasil?")).toBeInTheDocument();
  });

  it("mostra hint para virar quando não está virado", () => {
    render(<ReviewCard card={mockCard} flipped={false} onFlip={vi.fn()} />);
    expect(screen.getByText(/Clique para virar/i)).toBeInTheDocument();
  });

  it("mostra o verso quando flipped=true", () => {
    render(<ReviewCard card={mockCard} flipped={true} onFlip={vi.fn()} />);
    expect(screen.getByText("VERSO")).toBeInTheDocument();
    expect(screen.getByText("Brasília")).toBeInTheDocument();
  });

  it("não mostra hint para virar quando já virado", () => {
    render(<ReviewCard card={mockCard} flipped={true} onFlip={vi.fn()} />);
    expect(screen.queryByText(/Clique para virar/i)).not.toBeInTheDocument();
  });

  it("chama onFlip ao clicar no card", async () => {
    const onFlip = vi.fn();
    render(<ReviewCard card={mockCard} flipped={false} onFlip={onFlip} />);
    await userEvent.click(screen.getByText("FRENTE"));
    expect(onFlip).toHaveBeenCalledOnce();
  });
});
