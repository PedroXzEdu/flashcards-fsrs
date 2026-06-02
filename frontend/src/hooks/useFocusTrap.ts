import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const el = ref.current;
    const prev = document.activeElement as HTMLElement | null;

    const focusable = el.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const focused = document.activeElement;
      if (e.shiftKey) {
        if (focused === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (focused === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    el.addEventListener("keydown", handleKey);
    return () => {
      el.removeEventListener("keydown", handleKey);
      prev?.focus();
    };
  }, [active]);

  return ref;
}
