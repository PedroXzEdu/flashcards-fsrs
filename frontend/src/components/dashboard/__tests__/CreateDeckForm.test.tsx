import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CreateDeckForm from "../CreateDeckForm";

describe("CreateDeckForm", () => {
  it("renderiza título do formulário", () => {
    render(
      <CreateDeckForm
        onSave={vi.fn()}
        onCancel={vi.fn()}
        saving={false}
      />,
    );
    expect(screen.getByText("Novo baralho")).toBeInTheDocument();
  });

  it("chama onSave com título e descrição ao submeter", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <CreateDeckForm
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
      <CreateDeckForm
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

  it("chama onCancel ao clicar em Cancelar", async () => {
    const onCancel = vi.fn();
    render(
      <CreateDeckForm
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
      <CreateDeckForm
        onSave={vi.fn()}
        onCancel={vi.fn()}
        saving={true}
      />,
    );
    expect(screen.getByRole("button", { name: /Criar/i })).toBeDisabled();
  });

  it("não submete com título vazio", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <CreateDeckForm
        onSave={onSave}
        onCancel={vi.fn()}
        saving={false}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /Criar/i }));
    // O form tem required no input, então a submissão nativa não acontece
    expect(onSave).not.toHaveBeenCalled();
  });
});
