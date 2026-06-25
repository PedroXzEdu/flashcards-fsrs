import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import AddDeckModal from "./AddDeckModal";

describe("AddDeckModal", () => {
  it("renderiza título e campos", () => {
    render(
      <AddDeckModal
        onSave={vi.fn()}
        onCancel={vi.fn()}
        saving={false}
      />,
    );
    expect(screen.getByText("Novo baralho")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Título do baralho")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Descrição (opcional)")).toBeInTheDocument();
  });

  it("chama onSave com título e descrição ao submeter", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <AddDeckModal
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />,
    );
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Título do baralho"), "Biologia");
    await user.type(
      screen.getByPlaceholderText("Descrição (opcional)"),
      "Deck de biologia celular",
    );
    await user.click(screen.getByRole("button", { name: /Criar/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("Biologia", "Deck de biologia celular");
    });
  });

  it("chama onSave com descrição vazia quando não preenchida", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <AddDeckModal
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />,
    );
    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText("Título do baralho"), "Matemática");
    await user.click(screen.getByRole("button", { name: /Criar/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith("Matemática", "");
    });
  });

  it("não submete com título vazio", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <AddDeckModal
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Criar/i }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("chama onCancel ao clicar em Cancelar", async () => {
    const onCancel = vi.fn();
    render(
      <AddDeckModal
        onSave={vi.fn()}
        onCancel={onCancel}
        saving={false}
      />,
    );
    await userEvent.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("desabilita botão Criar durante salvamento", () => {
    render(
      <AddDeckModal
        onSave={vi.fn()}
        onCancel={vi.fn()}
        saving={true}
      />,
    );
    expect(screen.getByRole("button", { name: /Criar/i })).toBeDisabled();
  });
});
