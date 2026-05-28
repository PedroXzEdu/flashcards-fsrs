import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CardContent from "./CardContent";

vi.mock("katex", () => ({
  default: {
    renderToString: vi.fn(
      (expr: string) => `<span class="katex">${expr}</span>`,
    ),
  },
}));

describe("CardContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders basic HTML safely", () => {
    render(<CardContent html="<p>Olá mundo</p>" />);
    expect(screen.getByText("Olá mundo")).toBeInTheDocument();
  });

  it("strips dangerous tags like script but keeps text", () => {
    render(<CardContent html='<p>texto</p><script>alert("xss")</script>' />);
    expect(screen.getByText("texto")).toBeInTheDocument();
    // script tag is removed, but its text content remains (sanitizer replaces tag with children)
    expect(screen.getByText(/alert/)).toBeInTheDocument();
    // no script element remains
    expect(document.querySelector("script")).not.toBeInTheDocument();
  });

  it("strips onclick handlers", () => {
    render(<CardContent html='<p onclick="alert(1)">seguro</p>' />);
    const p = screen.getByText("seguro");
    expect(p).toBeInTheDocument();
    expect(p).not.toHaveAttribute("onclick");
  });

  it("removes javascript: hrefs", () => {
    render(<CardContent html='<a href="javascript:alert(1)">link</a>' />);
    const link = screen.getByText("link");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).not.toHaveAttribute("href");
  });

  it("allows safe http hrefs", () => {
    render(<CardContent html='<a href="https://exemplo.com">link</a>' />);
    const link = screen.getByText("link");
    expect(link.closest("a")).toHaveAttribute("href", "https://exemplo.com");
  });

  it("transforms inline KaTeX $...$", () => {
    render(<CardContent html="<p>Fórmula $E=mc^2$</p>" />);
    expect(screen.getByText(/E=mc\^2/)).toBeInTheDocument();
  });

  it("transforms block KaTeX $$...$$", () => {
    render(<CardContent html="<p>$$\\int x^2 dx$$</p>" />);
    expect(screen.getByText(/\\int x\^2 dx/)).toBeInTheDocument();
  });

  it("strips unknown tags but preserves their content", () => {
    render(
      <CardContent html="<p>antes</p><custom>conteúdo</custom><p>depois</p>" />,
    );
    expect(screen.getByText("antes")).toBeInTheDocument();
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
    expect(screen.getByText("depois")).toBeInTheDocument();
  });

  it("returns empty div when html is empty", () => {
    const { container } = render(<CardContent html="" />);
    expect(container.querySelector("div")?.innerHTML).toBe("");
  });

  it("accepts custom style prop", () => {
    render(<CardContent html="<p>teste</p>" style={{ color: "red" }} />);
    expect(screen.getByText("teste")).toHaveStyle({ color: "rgb(255, 0, 0)" });
  });
});
