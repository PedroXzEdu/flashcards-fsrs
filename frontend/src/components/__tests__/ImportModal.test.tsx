import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ImportModal from "../ImportModal";
import { ToastProvider } from "../../contexts/ToastContext";

vi.mock("../../api/decks", () => ({
  importApi: {
    importApkg: vi.fn(),
  },
}));

vi.mock("../../hooks/useFocusTrap", () => ({
  useFocusTrap: () => ({ current: document.createElement("div") }),
}));

import { importApi } from "../../api/decks";

function renderModal() {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  const result = render(
    <ToastProvider>
      <ImportModal onClose={onClose} onSuccess={onSuccess} />
    </ToastProvider>,
  );
  return { onClose, onSuccess, ...result };
}

describe("ImportModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve mostrar título e drop zone inicialmente", () => {
    renderModal();
    expect(screen.getByText("Importar baralho Anki")).toBeInTheDocument();
    expect(screen.getByText("Arraste o arquivo aqui")).toBeInTheDocument();
  });

  it("deve mostrar erro se importar sem arquivo selecionado", async () => {
    renderModal();
    await userEvent.click(screen.getByText("Importar"));
    expect(
      screen.getByText("Selecione um arquivo .apkg primeiro."),
    ).toBeInTheDocument();
  });

  it("deve mostrar estado de loading durante importação", async () => {
    vi.mocked(importApi.importApkg).mockReturnValue(new Promise(() => {}));
    const { container } = renderModal();

    const input = container.querySelector('input[type="file"]')!;
    const file = new File(["dummy"], "deck.apkg", { type: "application/octet-stream" });
    Object.defineProperty(input, "files", { value: [file] });
    input.dispatchEvent(new Event("change", { bubbles: true }));

    await userEvent.click(screen.getByText("Importar"));

    await waitFor(() => {
      expect(screen.getByText("Importando...")).toBeInTheDocument();
    });
  });

  it("deve mostrar resultado após importação bem-sucedida", async () => {
    vi.mocked(importApi.importApkg).mockResolvedValue({
      deck: { id: 1, title: "Meu Deck" },
      imported: 15,
      skipped: 2,
      message: "Sucesso",
    });

    const { container } = renderModal();

    const input = container.querySelector('input[type="file"]')!;
    const file = new File(["dummy"], "deck.apkg", { type: "application/octet-stream" });
    Object.defineProperty(input, "files", { value: [file] });
    input.dispatchEvent(new Event("change", { bubbles: true }));

    await userEvent.click(screen.getByText("Importar"));

    await waitFor(() => {
      expect(screen.getByText("Importação concluída!")).toBeInTheDocument();
      expect(screen.getByText("15")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("deve mostrar erro quando importação falha", async () => {
    vi.mocked(importApi.importApkg).mockRejectedValue(
      new Error("Arquivo inválido"),
    );

    const { container } = renderModal();

    const input = container.querySelector('input[type="file"]')!;
    const file = new File(["dummy"], "deck.apkg", { type: "application/octet-stream" });
    Object.defineProperty(input, "files", { value: [file] });
    input.dispatchEvent(new Event("change", { bubbles: true }));

    await userEvent.click(screen.getByText("Importar"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Arquivo inválido",
      );
    });
  });

  it("deve rejeitar arquivo que não é .apkg", async () => {
    renderModal();

    const input = document.querySelector('input[type="file"]')!;
    const file = new File(["dummy"], "teste.txt", { type: "text/plain" });
    Object.defineProperty(input, "files", { value: [file] });
    input.dispatchEvent(new Event("change", { bubbles: true }));

    await userEvent.click(screen.getByText("Importar"));
    expect(
      screen.getByText("Selecione um arquivo .apkg primeiro."),
    ).toBeInTheDocument();
  });
});
