import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EmptyState from "../EmptyState";

describe("EmptyState", () => {
  it("deve renderizar título e ícone", () => {
    render(<EmptyState icon={<span data-testid="icon">🔍</span>} title="Nada aqui" />);
    expect(screen.getByText("Nada aqui")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("deve renderizar descrição quando fornecida", () => {
    render(
      <EmptyState
        icon={<span>📭</span>}
        title="Sem resultados"
        description="Tente alterar os filtros."
      />,
    );
    expect(screen.getByText("Sem resultados")).toBeInTheDocument();
    expect(screen.getByText("Tente alterar os filtros.")).toBeInTheDocument();
  });

  it("não deve renderizar descrição quando omitida", () => {
    render(<EmptyState icon={<span>📭</span>} title="Vazio" />);
    expect(screen.getByText("Vazio")).toBeInTheDocument();
    expect(screen.queryByText("Tente alterar os filtros.")).not.toBeInTheDocument();
  });
});
