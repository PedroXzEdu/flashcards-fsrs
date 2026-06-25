import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import EditDeckModal from "./EditDeckModal";

const mockDeck = {
  title: "Biologia",
  description: "Deck de biologia celular",
};

describe("EditDeckModal", () => {
  it("renderiza com dados do deck", () => {
    render(
      <EditDeckModal
        deck={mockDeck}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        saving={false}
      />,
    );
    expect(screen.getByText("Renomear baralho")).toBeInTheDocument();
    const titleInput = screen.getByPlaceholderText("Título do baralho") as HTMLInputElement;
    expect(titleInput.value).toBe("Biologia");
  });

  it("chama onSave com título atualizado", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <EditDeckModal
        deck={mockDeck}
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />,
    );
    const user = userEvent.setup();
    const titleInput = screen.getByPlaceholderText("Título do baralho");
    await user.clear(titleInput);
    await user.type(titleInput, "Biologia Celular");
    await user.click(screen.getByRole("button", { name: /Salvar/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("Biologia Celular", "Deck de biologia celular");
    });
  });

  it("não submete com título vazio", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <EditDeckModal
        deck={mockDeck}
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />,
    );
    const user = userEvent.setup();
    const titleInput = screen.getByPlaceholderText("Título do baralho");
    await user.clear(titleInput);
    await user.click(screen.getByRole("button", { name: /Salvar/i }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("chama onCancel ao clicar em Cancelar", async () => {
    const onCancel = vi.fn();
    render(
      <EditDeckModal
        deck={mockDeck}
        onSave={vi.fn()}
        onCancel={onCancel}
        saving={false}
      />,
    );
    await userEvent.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("desabilita botão Salvar durante salvamento", () => {
    render(
      <EditDeckModal
        deck={mockDeck}
        onSave={vi.fn()}
        onCancel={vi.fn()}
        saving={true}
      />,
    );
    expect(screen.getByRole("button", { name: /Salvar/i })).toBeDisabled();
  });
});
