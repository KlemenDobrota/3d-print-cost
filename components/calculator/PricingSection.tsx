"use client";
import { TogglePill } from "@/components/ui/TogglePill";

interface PricingSectionProps {
  pricingMode: "markup" | "margin";
  markupOrMargin: number;
  onPricingModeChange: (v: "markup" | "margin") => void;
  onMarkupOrMarginChange: (v: number) => void;
}

const MODE_OPTIONS = [
  { label: "Markup %", value: "markup" as const },
  { label: "Margin %", value: "margin" as const },
];

export function PricingSection({
  pricingMode,
  markupOrMargin,
  onPricingModeChange,
  onMarkupOrMarginChange,
}: PricingSectionProps) {
  const label = pricingMode === "markup" ? "Markup on cost" : "Target margin";
  const marginError = pricingMode === "margin" && markupOrMargin >= 100;
  const markupError = pricingMode === "markup" && (!Number.isFinite(markupOrMargin) || markupOrMargin < 0);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = parseFloat(e.target.value);
    const v = Number.isFinite(raw) ? Math.max(0, raw) : 0;
    onMarkupOrMarginChange(v);
  }

  return (
    <section className="bg-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <PricingIcon />
        <h2 className="text-sm font-semibold text-slate-200">Pricing</h2>
      </div>

      <TogglePill options={MODE_OPTIONS} value={pricingMode} onChange={onPricingModeChange} />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-slate-400">{label}</label>
        <div className="relative">
          <input
            type="number"
            min={0}
            max={pricingMode === "margin" ? 99.99 : undefined}
            step={1}
            value={markupOrMargin === 0 ? "" : markupOrMargin}
            placeholder="0"
            onChange={handleChange}
            onWheel={(e) => e.currentTarget.blur()}
            className="w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-right pr-10 pl-3 text-slate-50 text-base focus:outline-none focus:border-indigo-500 tabular text-2xl font-semibold placeholder:text-slate-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">%</span>
        </div>
        {marginError && (
          <p className="text-xs text-red-400">Margin must be below 100 % — selling price would be infinite.</p>
        )}
        {markupError && (
          <p className="text-xs text-red-400">Markup must be 0 % or higher.</p>
        )}
      </div>
    </section>
  );
}

function PricingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
