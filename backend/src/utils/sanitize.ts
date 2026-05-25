// Removes control characters (except \n, \t) and trims whitespace.
// Rich text fields (card front/back) do NOT pass through this function,
// so HTML markup is preserved. XSS prevention is handled at render time
// by the frontend.
export function sanitizeInput(value: string): string {
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}
