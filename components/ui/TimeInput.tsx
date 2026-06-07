"use client";

import { cn } from "./cn";

interface TimeInputProps {
  valueMinutes: number;
  onChange: (totalMinutes: number) => void;
  label?: string;
  className?: string;
}

export function TimeInput({
  valueMinutes,
  onChange,
  label,
  className,
}: TimeInputProps) {
  const hrs = Math.floor(valueMinutes / 60);
  const mins = valueMinutes % 60;

  function handleHrs(e: React.ChangeEvent<HTMLInputElement>) {
    const h = Math.max(0, parseInt(e.target.value || "0", 10));
    onChange(h * 60 + mins);
  }

  function handleMins(e: React.ChangeEvent<HTMLInputElement>) {
    const m = Math.min(59, Math.max(0, parseInt(e.target.value || "0", 10)));
    onChange(hrs * 60 + m);
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm text-slate-400">{label}</label>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            min={0}
            value={hrs === 0 ? "" : hrs}
            placeholder="0"
            onChange={handleHrs}
            className="w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-right pr-10 pl-3 text-slate-50 text-base focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
            hrs
          </span>
        </div>
        <div className="relative flex-1">
          <input
            type="number"
            min={0}
            max={59}
            value={mins === 0 ? "" : mins}
            placeholder="0"
            onChange={handleMins}
            className="w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-right pr-10 pl-3 text-slate-50 text-base focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
            min
          </span>
        </div>
      </div>
    </div>
  );
}
