import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";

describe("PasswordStrengthIndicator", () => {
  it("não mostra label quando senha está vazia", () => {
    render(<PasswordStrengthIndicator password="" />);
    expect(screen.queryByText("Fraca")).not.toBeInTheDocument();
  });

  it("mostra 'Fraca' para senha de 6 caracteres sem maiúscula", () => {
    render(<PasswordStrengthIndicator password="abcdef" />);
    expect(screen.getByText("Fraca")).toBeInTheDocument();
  });

  it("mostra 'Média' para senha com 6+ caracteres e maiúscula", () => {
    render(<PasswordStrengthIndicator password="Abcdef" />);
    expect(screen.getByText("Média")).toBeInTheDocument();
  });

  it("mostra 'Forte' para senha com 6+ caracteres, maiúscula e número", () => {
    render(<PasswordStrengthIndicator password="Abcde1" />);
    expect(screen.getByText("Forte")).toBeInTheDocument();
  });

  it("mostra 'Muito forte' para senha com 8+ caracteres, maiúscula, minúscula, número e especial", () => {
    render(<PasswordStrengthIndicator password="Abcd@123" />);
    expect(screen.getByText("Muito forte")).toBeInTheDocument();
  });
});
