import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StatsGlobalPage from "../StatsGlobalPage";
import { AuthProvider } from "../../contexts/AuthContext";
import { ThemeProvider } from "../../contexts/ThemeContext";
import { ToastProvider } from "../../contexts/ToastContext";
import { statsApi } from "../../api/decks";
import { api } from "../../api/client";

vi.mock("../../api/decks", () => ({
  decksApi: {
    list: vi.fn(),
  },
  statsApi: {
    streak: vi.fn(),
    globalStats: vi.fn(),
  },
}));

vi.mock("../../api/achievements", () => ({
  achievementsApi: {
    list: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../../api/client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockGlobalStats = {
  cards: {
    total_cards: "50",
    new_cards: "10",
    learning: "5",
    reviewing: "35",
    due_today: "8",
    avg_difficulty: "0.45",
    avg_stability: "15.3",
  },
  reviews: {
    total_reviews: "200",
    again_count: "20",
    hard_count: "30",
    good_count: "100",
    easy_count: "50",
    retention_rate: "0.75",
  },
  decks: {
    total_decks: "3",
  },
  daily: [
    { date: "2025-01-01", total: "10" },
    { date: "2025-01-02", total: "15" },
  ],
};

function renderStatsGlobal() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <StatsGlobalPage />
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("StatsGlobalPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(statsApi.globalStats).mockResolvedValue(mockGlobalStats);
    vi.mocked(api.get).mockResolvedValue({ activity: [] });
  });

  it("renderiza skeletons durante carregamento", () => {
    vi.mocked(statsApi.globalStats).mockReturnValue(new Promise(() => {}));
    const { container } = renderStatsGlobal();
    const skeletons = container.querySelectorAll(".skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renderiza métricas com dados mockados", async () => {
    renderStatsGlobal();
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("0.75%")).toBeInTheDocument();
    expect(screen.getByText("15.3d")).toBeInTheDocument();
  });

  it("exibe títulos dos gráficos", async () => {
    renderStatsGlobal();
    await waitFor(() => {
      expect(
        screen.getByText("Revisões — últimos 30 dias"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Distribuição de Respostas")).toBeInTheDocument();
    expect(screen.getByText("Estado dos Cards")).toBeInTheDocument();
  });

  it("mostra erro com retry quando API falha", async () => {
    vi.mocked(statsApi.globalStats).mockRejectedValue(
      new Error("Falha ao carregar"),
    );
    renderStatsGlobal();
    await waitFor(() => {
      expect(screen.getByText("Falha ao carregar")).toBeInTheDocument();
    });
    expect(screen.getByText("Tentar novamente")).toBeInTheDocument();
  });

  it("recarrega dados ao clicar em Tentar novamente", async () => {
    vi.mocked(statsApi.globalStats).mockRejectedValueOnce(
      new Error("Falha ao carregar"),
    );
    renderStatsGlobal();
    await waitFor(() => {
      expect(screen.getByText("Falha ao carregar")).toBeInTheDocument();
    });

    vi.mocked(statsApi.globalStats).mockResolvedValue(mockGlobalStats);
    await userEvent.click(screen.getByText("Tentar novamente"));

    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });
});
