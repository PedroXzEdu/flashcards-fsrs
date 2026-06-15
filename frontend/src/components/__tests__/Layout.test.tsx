import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Layout from "../Layout";
import { AuthProvider } from "../../contexts/AuthContext";
import { ThemeProvider } from "../../contexts/ThemeContext";

vi.mock("../../contexts/AuthContext", async () => {
  const actual = await vi.importActual("../../contexts/AuthContext");
  return {
    ...actual,
    AuthProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="auth-wrapper">{children}</div>
    ),
    useAuth: () => ({
      user: { id: 1, name: "Teste", email: "teste@test.com" },
      token: "token-123",
      logout: vi.fn(),
      isAuthenticated: true,
    }),
  };
});

vi.mock("../../contexts/ThemeContext", async () => {
  const actual = await vi.importActual("../../contexts/ThemeContext");
  return {
    ...actual,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="theme-wrapper">{children}</div>
    ),
    useTheme: () => ({
      theme: "dark",
      toggle: vi.fn(),
    }),
  };
});

function renderLayout(backTo?: string, backLabel?: string, title?: string) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider>
        <ThemeProvider>
          <Layout backTo={backTo} backLabel={backLabel} title={title}>
            <div data-testid="children">Conteúdo</div>
          </Layout>
        </ThemeProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("Layout", () => {
  it("deve renderizar children", () => {
    renderLayout();
    expect(screen.getByTestId("children")).toHaveTextContent("Conteúdo");
  });

  it("deve mostrar logo FlashFSRS quando não tem backTo", () => {
    renderLayout();
    expect(screen.getByText("FlashFSRS")).toBeInTheDocument();
  });

  it("deve mostrar botão de voltar quando backTo é fornecido", () => {
    renderLayout("/decks", "Baralhos");
    expect(screen.getByLabelText("Voltar para Baralhos")).toBeInTheDocument();
  });

  it("deve mostrar título quando fornecido", () => {
    renderLayout(undefined, undefined, "Meu Deck");
    expect(screen.getByText("/ Meu Deck")).toBeInTheDocument();
  });

  it("deve mostrar nome do usuário logado", () => {
    renderLayout();
    expect(screen.getByText("Teste")).toBeInTheDocument();
  });

  it("deve mostrar botão de toggle de tema", () => {
    renderLayout();
    expect(screen.getByLabelText("Modo claro")).toBeInTheDocument();
  });
});
