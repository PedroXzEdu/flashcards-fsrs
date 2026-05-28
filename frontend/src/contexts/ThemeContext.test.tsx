import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";

function TestComponent() {
  const { theme, toggle } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggle}>
        Toggle
      </button>
    </div>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to light when no preference is set", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("toggles between dark and light", async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByText("Toggle"));
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");

    await userEvent.click(screen.getByText("Toggle"));
    expect(screen.getByTestId("theme")).toHaveTextContent("light");
  });

  it("persists theme to localStorage on toggle", async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByText("Toggle"));
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
  });

  it("sets data-theme attribute on documentElement", async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    await userEvent.click(screen.getByText("Toggle"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("restores theme from localStorage", () => {
    localStorage.setItem("theme", "dark");

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
  });

  it("useTheme throws outside ThemeProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      "useTheme deve ser usado dentro de ThemeProvider",
    );
    consoleSpy.mockRestore();
  });
});
