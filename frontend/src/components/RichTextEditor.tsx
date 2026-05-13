import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Code,
  Minus,
} from "lucide-react";
import { useEffect } from "react";

interface Props {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        background: active ? "var(--accent)" : "none",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        padding: "4px 6px",
        display: "flex",
        alignItems: "center",
        color: active ? "var(--bg)" : "var(--text-muted)",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--bg-hover)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "none";
      }}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: placeholder || "Digite aqui...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: [
          "outline: none",
          "min-height: 80px",
          "color: var(--text)",
          "font-family: Outfit, sans-serif",
          "font-size: 14px",
          "line-height: 1.6",
        ].join("; "),
      },
    },
  });

  // Sincroniza conteúdo externo (ex: ao editar um card existente)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, {
        emitUpdate: false,
      });
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "10px",
        overflow: "hidden",
        background: "var(--bg)",
        transition: "border-color 0.2s",
      }}
      onFocus={() => {
        const el = document.activeElement?.closest("[data-rte]") as HTMLElement;
        if (el) el.style.borderColor = "var(--accent)";
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          padding: "6px 8px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-alt)",
          flexWrap: "wrap",
        }}
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Negrito (Ctrl+B)"
        >
          <Bold size={13} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Itálico (Ctrl+I)"
        >
          <Italic size={13} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Sublinhado (Ctrl+U)"
        >
          <UnderlineIcon size={13} />
        </ToolbarButton>

        <div
          style={{
            width: "1px",
            height: "16px",
            background: "var(--border)",
            margin: "0 4px",
          }}
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Código inline"
        >
          <Code size={13} />
        </ToolbarButton>

        <div
          style={{
            width: "1px",
            height: "16px",
            background: "var(--border)",
            margin: "0 4px",
          }}
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Lista"
        >
          <List size={13} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Lista numerada"
        >
          <ListOrdered size={13} />
        </ToolbarButton>

        <div
          style={{
            width: "1px",
            height: "16px",
            background: "var(--border)",
            margin: "0 4px",
          }}
        />

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Linha divisória"
        >
          <Minus size={13} />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div style={{ padding: "10px 14px" }}>
        <EditorContent editor={editor} />
      </div>

      {/* CSS do Tiptap */}
      <style>{`
        .tiptap p { margin: 0 0 6px; }
        .tiptap p:last-child { margin-bottom: 0; }
        .tiptap ul, .tiptap ol { padding-left: 20px; margin: 4px 0; }
        .tiptap li { margin: 2px 0; }
        .tiptap code {
          background: var(--bg-hover);
          border-radius: 4px;
          padding: 1px 5px;
          font-family: JetBrains Mono, monospace;
          font-size: 12px;
          color: var(--accent);
        }
        .tiptap hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 8px 0;
        }
        .tiptap strong { color: var(--text); }
        .tiptap em { color: var(--text-sub); }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--text-muted);
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
    </div>
  );
}
