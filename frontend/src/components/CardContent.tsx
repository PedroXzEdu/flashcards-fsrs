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

export default function CardContent({ html, style }: Props) {
  const rendered = renderLatex(html);

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
