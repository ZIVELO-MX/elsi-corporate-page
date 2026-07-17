"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type ToastVariant = "success" | "error" | "default";
type ToastItem = { id: number; title: string; variant: ToastVariant; leaving?: boolean };

type ToastContextValue = {
  toast: (input: { title: string; variant?: ToastVariant }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems(prev => prev.map(t => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 200);
  }, []);

  const toast = useCallback(
    ({ title, variant = "default" }: { title: string; variant?: ToastVariant }) => {
      const id = (idRef.current += 1);
      setItems(prev => [...prev, { id, title, variant }]);
      setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="admin-toast-viewport" role="region" aria-label="Notificaciones">
        {items.map(t => (
          <div key={t.id} className="admin-toast" data-variant={t.variant} data-leaving={t.leaving ? "true" : undefined} role="status">
            {t.variant === "success" && <CheckCircle2 size={16} aria-hidden="true" />}
            {t.variant === "error" && <AlertCircle size={16} aria-hidden="true" />}
            <span style={{ flex: 1 }}>{t.title}</span>
            <button type="button" className="admin-toast-close" aria-label="Cerrar notificación" onClick={() => dismiss(t.id)}>
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
}
