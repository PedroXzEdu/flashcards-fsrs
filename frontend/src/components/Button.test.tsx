import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Clique aqui</Button>);
    expect(
      screen.getByRole("button", { name: /clique aqui/i }),
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Click
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when loading", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} loading>
        Click
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders spinner when loading", () => {
    const { container } = render(<Button loading>Salvar</Button>);
    const button = container.querySelector("button");
    const spans = button?.querySelectorAll("span");
    expect(spans?.length).toBeGreaterThanOrEqual(1);
  });

  it("renders icon when provided", () => {
    render(<Button icon={<span data-testid="icon" />}>Com ícone</Button>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies disabled attribute", () => {
    render(<Button disabled>Desabilitado</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders with different variants without error", () => {
    const variants = ["primary", "secondary", "danger", "ghost"] as const;
    for (const variant of variants) {
      const { unmount } = render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
      unmount();
    }
  });

  it("renders with different sizes without error", () => {
    const sizes = ["sm", "md", "lg"] as const;
    for (const size of sizes) {
      const { unmount } = render(<Button size={size}>{size}</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
      unmount();
    }
  });

  it("forwards additional html button props", () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
