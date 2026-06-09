import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CardContent from "../CardContent";

describe("CardContent — XSS sanitization", () => {
  it("deve renderizar texto simples sem alterações", () => {
    render(<CardContent html="Hello world" />);
    const container = screen.getByText("Hello world");
    expect(container).toBeInTheDocument();
  });

  it("deve remover tags script", () => {
    const { container } = render(
      <CardContent html='<script>alert("xss")</script>Safe' />,
    );
    expect(container.innerHTML).not.toContain("<script>");
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain("Safe");
  });

  it("deve remover event handlers", () => {
    const { container } = render(
      <CardContent html='<img src="x" onerror="alert(1)" />' />,
    );
    expect(container.innerHTML).not.toContain("onerror");
  });

  it("deve remover atributos href com javascript:", () => {
    const { container } = render(
      <CardContent html='<a href="javascript:alert(1)">click</a>' />,
    );
    const anchor = container.querySelector("a");
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute("href")).toBeNull();
  });

  it("deve permitir tags HTML seguras", () => {
    const { container } = render(
      <CardContent html="<strong>bold</strong><em>italic</em>" />,
    );
    expect(container.querySelector("strong")).not.toBeNull();
    expect(container.querySelector("em")).not.toBeNull();
  });

  it("deve permitir imagens com src seguro", () => {
    const { container } = render(
      <CardContent html='<img src="/media/image.png" alt="test" />' />,
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("/media/image.png");
  });

  it("deve permitir imagens com src http", () => {
    const { container } = render(
      <CardContent html='<img src="http://example.com/img.jpg" />' />,
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("http://example.com/img.jpg");
  });

  it("deve renderizar conteúdo vazio como string vazia", () => {
    render(<CardContent html="" />);
    expect(document.body.textContent).toBe("");
  });
});
