import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ConfirmModal from "./ConfirmModal";

describe("ConfirmModal", () => {
  it("renders title and message", () => {
    render(
      <ConfirmModal
        title="Excluir baralho"
        message="Tem certeza?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("Excluir baralho")).toBeInTheDocument();
    expect(screen.getByText("Tem certeza?")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmModal
        title="Excluir"
        message="Confirma?"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /excluir/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        title="Excluir"
        message="Confirma?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when backdrop is clicked", async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        title="Excluir"
        message="Confirma?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    const backdrop = screen.getByText("Confirma?").closest(".modal-overlay")!;
    await userEvent.click(backdrop);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Escape is pressed", async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        title="Excluir"
        message="Confirma?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await userEvent.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("renders with custom confirm text", () => {
    render(
      <ConfirmModal
        title="Excluir"
        message="Confirma?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        confirmText="Sim, excluir"
      />,
    );
    expect(screen.getByRole("button", { name: /sim, excluir/i })).toBeInTheDocument();
  });

  it("uses danger variant for confirm button by default", () => {
    render(
      <ConfirmModal
        title="Excluir"
        message="Confirma?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    const confirmBtn = screen.getByRole("button", { name: /excluir/i });
    expect(confirmBtn).toBeInTheDocument();
  });

  it("disables confirm button when loading", () => {
    render(
      <ConfirmModal
        title="Excluir"
        message="Confirma?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        loading={true}
      />,
    );
    const confirmBtn = screen.getByRole("button", { name: /excluir/i });
    expect(confirmBtn).toBeDisabled();
  });

  it("does not close on backdrop click when loading", async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmModal
        title="Excluir"
        message="Confirma?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
        loading={true}
      />,
    );
    const backdrop = screen.getByText("Confirma?").closest(".modal-overlay")!;
    await userEvent.click(backdrop);
    expect(onCancel).not.toHaveBeenCalled();
  });
});
