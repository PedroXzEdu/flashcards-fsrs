import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DailyQueue } from "../DailyQueue";
import { getDailyQueue } from "../../services/analyticsApi";

vi.mock("../../services/analyticsApi", () => ({
  getDailyQueue: vi.fn(),
}));

describe("DailyQueue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve mostrar esqueleto de carregamento inicialmente", () => {
    vi.mocked(getDailyQueue).mockReturnValue(new Promise(() => {}));
    render(<DailyQueue />);
    const skeletons = document.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("deve mostrar que não há cards quando a fila está vazia", async () => {
    vi.mocked(getDailyQueue).mockResolvedValue([]);
    render(<DailyQueue />);
    await waitFor(() => {
      expect(
        screen.getByText("Nenhum card para revisar hoje!"),
      ).toBeInTheDocument();
    });
  });

  it("deve mostrar cards da fila quando há dados", async () => {
    vi.mocked(getDailyQueue).mockResolvedValue([
      { id: 1, front: "Frente 1", predicted_recall: 85 },
      { id: 2, front: "Frente 2", predicted_recall: 45 },
    ]);
    render(<DailyQueue />);
    await waitFor(() => {
      expect(screen.getByText("Frente 1")).toBeInTheDocument();
      expect(screen.getByText("85%")).toBeInTheDocument();
      expect(screen.getByText("Frente 2")).toBeInTheDocument();
      expect(screen.getByText("45%")).toBeInTheDocument();
    });
  });

  it("deve mostrar erro quando a requisição falha", async () => {
    vi.mocked(getDailyQueue).mockRejectedValue(new Error("Erro de rede"));
    render(<DailyQueue />);
    await waitFor(() => {
      expect(
        screen.getByText("Não foi possível carregar a fila do dia."),
      ).toBeInTheDocument();
    });
  });

  it("deve mostrar contagem de cards pendentes", async () => {
    vi.mocked(getDailyQueue).mockResolvedValue([
      { id: 1, front: "Card A", predicted_recall: 90 },
      { id: 2, front: "Card B", predicted_recall: 70 },
    ]);
    render(<DailyQueue />);
    await waitFor(() => {
      expect(screen.getByText("2 cards")).toBeInTheDocument();
    });
  });
});
