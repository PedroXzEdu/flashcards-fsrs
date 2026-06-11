/* eslint-disable react-refresh/only-export-components -- hook useToast + componente ToastProvider no mesmo arquivo */
import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";

type Toast = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

type ToastContextType = {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
    networkError: (msg: string) => void;
  };
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast["type"], message: string, duration?: number) => {
    const id = Date.now() + Math.random();
    const added = { id, type, message };
    setToasts((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].message === message && prev[prev.length - 1].type === type) {
        return prev;
      }
      return [...prev, added];
    });
    const ms = duration ?? (type === "error" ? 8000 : 2000);
    setTimeout(() => {
      setToasts((p) => p.filter((t) => t.id !== id));
    }, ms);
  }, []);

  const toast = {
    success: (msg: string) => addToast("success", msg),
    error: (msg: string) => addToast("error", msg),
    info: (msg: string) => addToast("info", msg),
    networkError: (msg: string) => addToast("error", msg, 8000),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            {" "}
            {t.message}{" "}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx.toast;
};
