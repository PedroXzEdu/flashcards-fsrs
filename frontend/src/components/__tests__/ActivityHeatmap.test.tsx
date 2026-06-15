import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ActivityHeatmap from "../ActivityHeatmap";

vi.mock("../../api/client", () => ({
  api: {
    get: vi.fn(),
  },
}));

import { api } from "../../api/client";

describe("ActivityHeatmap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve mostrar esqueleto durante carregamento", () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    render(<ActivityHeatmap />);
    const skeleton = document.querySelector(".skeleton");
    expect(skeleton).toBeInTheDocument();
  });

  it("deve mostrar erro quando a requisição falha", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("Erro"));
    render(<ActivityHeatmap />);
    await waitFor(() => {
      expect(
        screen.getByText("Erro ao carregar heatmap de atividade"),
      ).toBeInTheDocument();
    });
  });

  it("deve mostrar estatísticas quando há dados", async () => {
    const today = new Date().toISOString().slice(0, 10);
    vi.mocked(api.get).mockResolvedValue({
      activity: [
        { day: today, count: "10" },
        { day: "2025-01-01", count: "5" },
      ],
    });
    render(<ActivityHeatmap />);
    await waitFor(() => {
      expect(screen.getByText(/^15$/)).toBeInTheDocument();
      expect(screen.getByText(/revisões em/)).toBeInTheDocument();
      expect(screen.getByText(/^2$/)).toBeInTheDocument();
    });
  });
});
