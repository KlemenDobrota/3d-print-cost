"use client";
import { TimeInput } from "@/components/ui/TimeInput";

interface PrintDetailsSectionProps {
  printTimeMinutes: number;
  failureRate: number;
  onPrintTimeChange: (v: number) => void;
  onFailureRateChange: (v: number) => void;
}

export function PrintDetailsSection({
  printTimeMinutes,
  failureRate,
  onPrintTimeChange,
  onFailureRateChange,
}: PrintDetailsSectionProps) {
  return (
    <section className="bg-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <DetailsIcon />
        <h2 className="text-sm font-semibold text-slate-200">Print details</h2>
      </div>

      <TimeInput
        label="Print time"
        valueMinutes={printTimeMinutes}
        onChange={onPrintTimeChange}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-slate-400">Failure / waste rate</label>
        <div className="relative">
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={failureRate === 0 ? "" : failureRate}
            placeholder="0"
            onChange={(e) => onFailureRateChange(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
            onWheel={(e) => e.currentTarget.blur()}
            className="w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-right pr-10 pl-3 text-slate-50 text-base focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">%</span>
        </div>
      </div>
    </section>
  );
}

function DetailsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
