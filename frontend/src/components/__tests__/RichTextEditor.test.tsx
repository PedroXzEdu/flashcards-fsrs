import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockEditor = {
  getHTML: vi.fn(() => "<p>teste</p>"),
  chain: vi.fn(() => ({
    focus: vi.fn(() => ({
      toggleBold: vi.fn(() => ({ run: vi.fn() })),
      toggleItalic: vi.fn(() => ({ run: vi.fn() })),
      toggleUnderline: vi.fn(() => ({ run: vi.fn() })),
      toggleCode: vi.fn(() => ({ run: vi.fn() })),
      toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
      toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
      setHorizontalRule: vi.fn(() => ({ run: vi.fn() })),
    })),
  })),
  isActive: vi.fn(() => false),
  commands: {
    setContent: vi.fn(),
  },
};

vi.mock("@tiptap/react", () => ({
  useEditor: vi.fn(() => mockEditor),
  EditorContent: ({ editor: _ed }: { editor: Record<string, unknown> }) => (
    <div data-testid="editor-content" />
  ),
}));

vi.mock("@tiptap/starter-kit", () => ({
  default: {},
}));
vi.mock("@tiptap/extension-underline", () => ({
  default: {},
}));
vi.mock("@tiptap/extension-placeholder", () => ({
  default: { configure: vi.fn(() => ({})) },
}));

import RichTextEditor from "../RichTextEditor";

describe("RichTextEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar botões da toolbar", () => {
    render(
      <RichTextEditor content="" onChange={vi.fn()} />,
    );
    expect(screen.getByLabelText("Negrito")).toBeInTheDocument();
    expect(screen.getByLabelText("Itálico")).toBeInTheDocument();
    expect(screen.getByLabelText("Sublinhado")).toBeInTheDocument();
    expect(screen.getByLabelText("Código inline")).toBeInTheDocument();
    expect(screen.getByLabelText("Lista")).toBeInTheDocument();
    expect(screen.getByLabelText("Lista numerada")).toBeInTheDocument();
    expect(screen.getByLabelText("Linha divisória")).toBeInTheDocument();
  });

  it("deve renderizar o editor content", () => {
    render(
      <RichTextEditor content="" onChange={vi.fn()} />,
    );
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("deve sincronizar conteúdo externo via useEffect", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <RichTextEditor content="<p>original</p>" onChange={onChange} />,
    );

    rerender(<RichTextEditor content="<p>atualizado</p>" onChange={onChange} />);

    expect(mockEditor.commands.setContent).toHaveBeenCalledWith(
      "<p>atualizado</p>",
      { emitUpdate: false },
    );
  });
});
