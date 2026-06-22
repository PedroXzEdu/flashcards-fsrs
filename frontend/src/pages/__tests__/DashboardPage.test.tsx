import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardPage from "../decks/DashboardPage";
import { AuthProvider } from "../../contexts/AuthContext";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { ToastProvider } from "../../contexts/ToastContext";
import { decksApi, statsApi } from "../../api/decks";
import { cardsApi } from "../../api/cards";
import {
  getWorkloadForecast,
  getDailyQueue,
} from "../../services/analyticsApi";

vi.mock("../../api/decks", () => ({
  decksApi: {
    list: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  statsApi: {
    streak: vi.fn(),
  },
}));

vi.mock("../../api/cards", () => ({
  cardsApi: {
    forReview: vi.fn(),
    dueCounts: vi.fn(),
  },
}));

vi.mock("../../services/analyticsApi", () => ({
  getWorkloadForecast: vi.fn(),
  getDailyQueue: vi.fn(),
}));

const mockDecks = [
  {
    id: 1,
    title: "Biologia",
    description: "Deck de biologia celular",
    card_count: 10,
    user_id: 1,
    is_public: false,
    created_at: "2025-01-01",
    new_cards_per_day: 20,
    share_token: null,
  },
  {
    id: 2,
    title: "História",
    description: null,
    card_count: 5,
    user_id: 1,
    is_public: false,
    created_at: "2025-01-02",
    new_cards_per_day: 20,
    share_token: null,
  },
];

const mockStreak = {
  streak: 3,
  longest: 10,
  total_days: 30,
  last_review: "2025-01-15",
};

function renderDashboard() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <DashboardPage />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(decksApi.list).mockResolvedValue(mockDecks);
    vi.mocked(cardsApi.dueCounts).mockResolvedValue([]);
    vi.mocked(statsApi.streak).mockResolvedValue(mockStreak);
    vi.mocked(getWorkloadForecast).mockResolvedValue([]);
    vi.mocked(getDailyQueue).mockResolvedValue([]);
  });

  it("renderiza skeletons durante carregamento", () => {
    vi.mocked(decksApi.list).mockReturnValue(new Promise(() => {}));
    vi.mocked(getWorkloadForecast).mockReturnValue(new Promise(() => {}));
    vi.mocked(getDailyQueue).mockReturnValue(new Promise(() => {}));
    const { container } = renderDashboard();
    const skeletons = container.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renderiza lista de baralhos mockados", async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("Biologia")).toBeInTheDocument();
    });
    expect(screen.getByText("História")).toBeInTheDocument();
    expect(screen.getByText("2 baralhos")).toBeInTheDocument();
    expect(screen.getByText("10 cards")).toBeInTheDocument();
    expect(screen.getByText("5 cards")).toBeInTheDocument();
  });

  it("mostra streak quando há dados", async () => {
    vi.mocked(statsApi.streak).mockResolvedValue({
      streak: 5,
      longest: 15,
      total_days: 45,
      last_review: "2025-01-20",
    });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("5 dias")).toBeInTheDocument();
    });
    expect(screen.getByText("15 dias")).toBeInTheDocument();
    expect(screen.getByText("45 dias")).toBeInTheDocument();
  });

  it("mostra empty state quando não há baralhos", async () => {
    vi.mocked(decksApi.list).mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("Nenhum baralho ainda.")).toBeInTheDocument();
    });
  });

  it("mostra erro com retry quando API falha", async () => {
    vi.mocked(decksApi.list).mockRejectedValue(new Error("Erro de rede"));
    renderDashboard();
    await waitFor(() => {
      expect(
        screen.getByText("Erro ao carregar baralhos."),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Tentar novamente")).toBeInTheDocument();
  });

  it("permite criar um novo baralho", async () => {
    const newDeck = {
      id: 3,
      title: "Novo Deck",
      description: "Descrição",
      card_count: 0,
      user_id: 1,
      is_public: false,
      created_at: "2025-01-03",
      new_cards_per_day: 20,
      share_token: null,
    };
    vi.mocked(decksApi.create).mockResolvedValue(newDeck);
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("Biologia")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Novo baralho"));
    const titleInput = screen.getByPlaceholderText("Título do baralho");
    await userEvent.type(titleInput, "Novo Deck");
    const descInput = screen.getByPlaceholderText("Descrição (opcional)");
    await userEvent.type(descInput, "Descrição");
    await userEvent.click(screen.getByText("Criar"));

    await waitFor(() => {
      expect(screen.getByText("Novo Deck")).toBeInTheDocument();
    });
  });

  it("mostra due counts nos baralhos", async () => {
    vi.mocked(cardsApi.dueCounts).mockResolvedValue([
      { deck_id: 1, due_count: 3 },
    ]);
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText("3 hoje")).toBeInTheDocument();
    });
  });
});
