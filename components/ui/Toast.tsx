"use client";
import { useEffect, useState } from "react";
import { cn } from "./cn";

interface ToastProps {
  message: string;
  type?: "success" | "error";
  onDismiss: () => void;
  durationMs?: number;
}

export function Toast({ message, type = "success", onDismiss, durationMs = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, durationMs);
    return () => {
      cancelAnimationFrame(show);
      clearTimeout(hide);
    };
  }, [durationMs, onDismiss]);

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300",
        type === "success"
          ? "bg-green-900 border border-green-700 text-green-100"
          : "bg-red-900 border border-red-700 text-red-100",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}
    >
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function show(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
  }

  function dismiss() {
    setToast(null);
  }

  return { toast, show, dismiss };
}
