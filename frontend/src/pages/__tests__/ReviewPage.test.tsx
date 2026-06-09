import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReviewPage from "../review/ReviewPage";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { cardsApi } from "../../api/cards";

vi.mock("../../api/cards", () => ({
  cardsApi: {
    forReview: vi.fn(),
    preview: vi.fn(),
    review: vi.fn(),
  },
}));

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

const mockPreview = {
  again: { due: new Date().toISOString(), scheduled_days: 0 },
  hard: { due: new Date().toISOString(), scheduled_days: 1 },
  good: { due: new Date().toISOString(), scheduled_days: 3 },
  easy: { due: new Date().toISOString(), scheduled_days: 7 },
};

const mockReviewResponse = {
  card: { ...mockCard, stability: 3.0 },
  next_review: new Date().toISOString(),
  scheduled_days: 3,
};

function renderReviewPage() {
  return render(
    <MemoryRouter initialEntries={["/decks/1/review"]}>
      <ThemeProvider>
        <Routes>
          <Route path="/decks/:id/review" element={<ReviewPage />} />
        </Routes>
      </ThemeProvider>
    </MemoryRouter>,
  );
}

describe("ReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cardsApi.forReview).mockResolvedValue({
      cards: [mockCard],
      total: 1,
    });
    vi.mocked(cardsApi.preview).mockResolvedValue(mockPreview);
    vi.mocked(cardsApi.review).mockResolvedValue(mockReviewResponse);
  });

  it("renderiza skeleton durante carregamento", () => {
    vi.mocked(cardsApi.forReview).mockReturnValue(new Promise(() => {}));
    const { container } = renderReviewPage();
    const skeletons = container.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("mostra empty state quando não há cards", async () => {
    vi.mocked(cardsApi.forReview).mockResolvedValue({
      cards: [],
      total: 0,
    });
    renderReviewPage();
    await waitFor(() => {
      expect(
        screen.getByText("Nenhum card disponível para revisão hoje"),
      ).toBeInTheDocument();
    });
  });

  it("exibe o front do card e permite virar", async () => {
    renderReviewPage();
    await waitFor(() => {
      expect(screen.getByText("FRENTE")).toBeInTheDocument();
    });
    expect(screen.getByText("Qual a capital do Brasil?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Clique para virar/i }),
    ).toBeInTheDocument();
  });

  it("ao virar o card, mostra preview e botões de rating", async () => {
    renderReviewPage();
    await waitFor(() => {
      expect(screen.getByText("FRENTE")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(/Clique para virar/i));

    await waitFor(() => {
      expect(screen.getByText("VERSO")).toBeInTheDocument();
    });
    expect(screen.getByText("Brasília")).toBeInTheDocument();
    expect(screen.getByText("De novo")).toBeInTheDocument();
    expect(screen.getByText("Difícil")).toBeInTheDocument();
    expect(screen.getByText("Bom")).toBeInTheDocument();
    expect(screen.getByText("Fácil")).toBeInTheDocument();
    expect(cardsApi.preview).toHaveBeenCalledWith(1, 1);
  });

  it("ao clicar em Bom (rating 3), avança e chama review API", async () => {
    renderReviewPage();
    await waitFor(() => {
      expect(screen.getByText("FRENTE")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(/Clique para virar/i));

    await waitFor(() => {
      expect(screen.getByText("VERSO")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Bom"));

    await waitFor(() => {
      expect(cardsApi.review).toHaveBeenCalledWith(1, 1, 3);
    });
  });

  it("mostra tela de conclusão após revisar último card", async () => {
    renderReviewPage();
    await waitFor(() => {
      expect(screen.getByText("FRENTE")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(/Clique para virar/i));
    await waitFor(() => {
      expect(screen.getByText("VERSO")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Bom"));

    await waitFor(() => {
      expect(screen.getByText("Sessão concluída!")).toBeInTheDocument();
    });
    expect(screen.getByText(/Você revisou/)).toBeInTheDocument();
    expect(
      screen.getByText("O FSRS agendou as próximas revisões automaticamente."),
    ).toBeInTheDocument();
  });

  it("mostra mensagem de erro quando review falha", async () => {
    vi.mocked(cardsApi.review).mockRejectedValue(
      new Error("Erro ao salvar revisão."),
    );
    renderReviewPage();
    await waitFor(() => {
      expect(screen.getByText("FRENTE")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(/Clique para virar/i));
    await waitFor(() => {
      expect(screen.getByText("VERSO")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Bom"));

    await waitFor(() => {
      expect(screen.getByText("Erro ao salvar revisão.")).toBeInTheDocument();
    });
  });
});
