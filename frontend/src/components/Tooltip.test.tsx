import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import Tooltip from "./Tooltip";

describe("Tooltip", () => {
  it("does not show tooltip text by default", () => {
    render(
      <Tooltip text="Dica útil">
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    expect(screen.queryByText("Dica útil")).not.toBeInTheDocument();
  });

  it("shows tooltip text on hover", async () => {
    render(
      <Tooltip text="Dica útil">
        <button type="button">Hover me</button>
      </Tooltip>,
    );
    await userEvent.hover(screen.getByText("Hover me"));
    expect(screen.getByText("Dica útil")).toBeInTheDocument();
  });

  it("hides tooltip text on mouse leave", async () => {
    render(
      <Tooltip text="Dica útil">
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText("Hover me");
    await userEvent.hover(trigger);
    expect(screen.getByText("Dica útil")).toBeInTheDocument();

    await userEvent.unhover(trigger);
    expect(screen.queryByText("Dica útil")).not.toBeInTheDocument();
  });
});
