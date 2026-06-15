import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ToastProvider, useToast } from "../ToastContext";

function TestConsumer() {
  const toast = useToast();
  return (
    <div>
      <button type="button" onClick={() => toast.success("Sucesso!")}>
        Success
      </button>
      <button type="button" onClick={() => toast.error("Erro!")}>
        Error
      </button>
      <button type="button" onClick={() => toast.info("Info!")}>
        Info
      </button>
    </div>
  );
}

describe("ToastContext", () => {
  it("deve renderizar children", () => {
    render(
      <ToastProvider>
        <div data-testid="child">ok</div>
      </ToastProvider>,
    );
    expect(screen.getByTestId("child")).toHaveTextContent("ok");
  });

  it("deve adicionar toast de sucesso", () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText("Success"));
    expect(screen.getByText("Sucesso!")).toBeInTheDocument();
  });

  it("deve adicionar toast de erro", () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText("Error"));
    expect(screen.getByText("Erro!")).toBeInTheDocument();
  });

  it("deve adicionar toast de info", () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText("Info"));
    expect(screen.getByText("Info!")).toBeInTheDocument();
  });

  it("deve remover toast após auto-dismiss", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>,
    );
    act(() => {
      fireEvent.click(screen.getByText("Success"));
    });
    expect(screen.getByText("Sucesso!")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText("Sucesso!")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
