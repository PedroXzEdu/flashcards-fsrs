import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProgressBar from "./ProgressBar";

describe("ProgressBar", () => {
  it("renders current and total", () => {
    render(<ProgressBar current={3} total={10} />);
    expect(screen.getByText("Cartão 4 de 10")).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes("30") && t.includes("%"))).toBeInTheDocument();
  });

  it("renders 0% when current is 0", () => {
    render(<ProgressBar current={0} total={5} />);
    expect(screen.getByText("Cartão 1 de 5")).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes("0") && t.includes("%"))).toBeInTheDocument();
  });

  it("renders 100% when current equals total", () => {
    render(<ProgressBar current={5} total={5} />);
    expect(screen.getByText("Cartão 6 de 5")).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes("100") && t.includes("%"))).toBeInTheDocument();
  });

  it("handles zero total gracefully", () => {
    render(<ProgressBar current={0} total={0} />);
    expect(screen.getByText("Cartão 1 de 0")).toBeInTheDocument();
    expect(screen.getByText((t) => t.includes("0") && t.includes("%"))).toBeInTheDocument();
  });
});
