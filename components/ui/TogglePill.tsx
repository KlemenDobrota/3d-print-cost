"use client";

import { cn } from "./cn";

interface TogglePillProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  fullWidth?: boolean;
}

export function TogglePill<T extends string>({
  options,
  value,
  onChange,
  className,
  fullWidth,
}: TogglePillProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full bg-slate-700 p-1 gap-1",
        fullWidth && "flex w-full",
        className
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-semibold transition-colors",
            fullWidth && "flex-1",
            value === opt.value
              ? "bg-[#00d4b4] text-slate-900"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
