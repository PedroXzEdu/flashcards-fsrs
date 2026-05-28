import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";

function TestComponent() {
  const { user, token, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? "logado" : "deslogado"}</span>
      <span data-testid="token">{token ?? "null"}</span>
      <span data-testid="user">{user ? user.name : "null"}</span>
      <button
        type="button"
        onClick={() =>
          login({ id: 1, name: "Teste", email: "teste@test.com" }, "abc123")
        }
      >
        Login
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  it("starts unauthenticated", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(screen.getByTestId("auth")).toHaveTextContent("deslogado");
    expect(screen.getByTestId("token")).toHaveTextContent("null");
  });

  it("login sets user and token", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText("Login"));
    expect(screen.getByTestId("auth")).toHaveTextContent("logado");
    expect(screen.getByTestId("token")).toHaveTextContent("abc123");
    expect(screen.getByTestId("user")).toHaveTextContent("Teste");
  });

  it("login persists to localStorage", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText("Login"));
    expect(localStorage.setItem).toHaveBeenCalledWith("token", "abc123");
    expect(localStorage.setItem).toHaveBeenCalledWith(
      "user",
      JSON.stringify({ id: 1, name: "Teste", email: "teste@test.com" }),
    );
  });

  it("logout clears auth state", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText("Login"));
    await userEvent.click(screen.getByText("Logout"));
    expect(screen.getByTestId("auth")).toHaveTextContent("deslogado");
    expect(screen.getByTestId("token")).toHaveTextContent("null");
  });

  it("logout removes items from localStorage", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    await userEvent.click(screen.getByText("Login"));
    await userEvent.click(screen.getByText("Logout"));
    expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("user");
  });

  it("restores auth from localStorage on mount", () => {
    localStorage.setItem("token", "restored-token");
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 2, name: "Restaurado", email: "r@test.com" }),
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    expect(screen.getByTestId("auth")).toHaveTextContent("logado");
    expect(screen.getByTestId("token")).toHaveTextContent("restored-token");
    expect(screen.getByTestId("user")).toHaveTextContent("Restaurado");
  });

  it("useAuth throws outside AuthProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      "useAuth deve ser usado dentro de AuthProvider",
    );
    consoleSpy.mockRestore();
  });
});
