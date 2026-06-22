import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
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
];

const ALLOWED_ATTRS = [
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
];

const SANITIZE_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR: ALLOWED_ATTRS,
};

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}
