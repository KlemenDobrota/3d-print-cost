"use client";

import { cn } from "./cn";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  className,
}: ToggleSwitchProps) {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer", className)}>
      {label && (
        <span className="text-sm font-semibold text-slate-200">{label}</span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00d4b4]",
          checked ? "bg-[#00d4b4]" : "bg-slate-600"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </label>
  );
}
