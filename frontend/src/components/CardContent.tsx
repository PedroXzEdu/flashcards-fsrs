import "katex/dist/katex.min.css";
import katex from "katex";

interface Props {
  html: string;
  style?: React.CSSProperties;
}

function renderLatex(text: string): string {
  // Renderiza \[...\] como bloco e \(...\) como inline
  let result = text;

  // Bloco: \[...\]
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (_, expr) => {
    try {
      return katex.renderToString(expr.trim(), {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return _;
    }
  });

  // Inline: \(...\)
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (_, expr) => {
    try {
      return katex.renderToString(expr.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return _;
    }
  });

  // Bloco: $$...$$
  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr.trim(), {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return _;
    }
  });

  // Inline: $...$
  result = result.replace(/\$([^\$\n]+?)\$/g, (_, expr) => {
    try {
      return katex.renderToString(expr.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return _;
    }
  });

  return result;
}

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim().toLowerCase();

  return (
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/")
  );
}

function sanitizeHtml(html: string): string {
  if (typeof document === "undefined") return "";

  const allowedTags = new Set([
    "a",
    "annotation",
    "audio",
    "blockquote",
    "br",
    "code",
    "div",
    "em",
    "hr",
    "img",
    "li",
    "math",
    "mfrac",
    "mi",
    "mn",
    "mo",
    "mrow",
    "msup",
    "ol",
    "p",
    "pre",
    "semantics",
    "span",
    "strong",
    "sub",
    "sup",
    "u",
    "ul",
  ]);
  const allowedAttrs = new Set([
    "alt",
    "aria-hidden",
    "class",
    "controls",
    "height",
    "href",
    "src",
    "title",
    "width",
    "xmlns",
  ]);
  const urlAttrs = new Set(["href", "src"]);
  const template = document.createElement("template");
  template.innerHTML = html;

  const cleanNode = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (!allowedTags.has(tag)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();

      if (
        name.startsWith("on") ||
        !allowedAttrs.has(name) ||
        (urlAttrs.has(name) && !isSafeUrl(attr.value))
      ) {
        element.removeAttribute(attr.name);
      }
    }

    Array.from(element.childNodes).forEach(cleanNode);
  };

  Array.from(template.content.childNodes).forEach(cleanNode);

  return template.innerHTML;
}

export default function CardContent({ html, style }: Props) {
  const rendered = sanitizeHtml(renderLatex(html));

  return (
    <div
      dangerouslySetInnerHTML={{ __html: rendered }}
      style={{
        lineHeight: 1.6,
        ...style,
      }}
    />
  );
}
