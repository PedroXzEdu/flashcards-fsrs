import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { useFocusTrap } from "../useFocusTrap";

function TrapTest({ active = true }: { active?: boolean }) {
  const ref = useFocusTrap(active);
  return (
    <div ref={ref}>
      <button type="button" data-testid="first">Primeiro</button>
      <button type="button" data-testid="last">Último</button>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("deve focar o primeiro elemento quando ativo", () => {
    render(<TrapTest active={true} />);
    expect(screen.getByTestId("first")).toHaveFocus();
  });

  it("não deve focar quando inativo", () => {
    render(<TrapTest active={false} />);
    expect(screen.getByTestId("first")).not.toHaveFocus();
    expect(document.body).toHaveFocus();
  });

  it("deve navegar para o último ao pressionar Tab no último", async () => {
    render(<TrapTest active={true} />);
    screen.getByTestId("last").focus();

    await userEvent.tab();

    expect(screen.getByTestId("first")).toHaveFocus();
  });

  it("deve navegar para o primeiro ao pressionar Shift+Tab no primeiro", async () => {
    render(<TrapTest active={true} />);
    screen.getByTestId("first").focus();

    await userEvent.tab({ shift: true });

    expect(screen.getByTestId("last")).toHaveFocus();
  });
});
