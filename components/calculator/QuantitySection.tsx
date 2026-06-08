"use client";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

interface QuantitySectionProps {
  pieceCount: number;
  customPriceEnabled: boolean;
  customPricePerPiece: number;
  onPieceCountChange: (v: number) => void;
  onCustomPriceEnabledChange: (v: boolean) => void;
  onCustomPricePerPieceChange: (v: number) => void;
}

export function QuantitySection({
  pieceCount,
  customPriceEnabled,
  customPricePerPiece,
  onPieceCountChange,
  onCustomPriceEnabledChange,
  onCustomPricePerPieceChange,
}: QuantitySectionProps) {
  return (
    <section className="bg-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <QuantityIcon />
        <h2 className="text-sm font-semibold text-slate-200">Quantity</h2>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-slate-400">Number of pieces</label>
        <div className="relative">
          <input
            type="number"
            min={1}
            step={1}
            value={pieceCount}
            onChange={(e) => {
              const raw = parseInt(e.target.value, 10);
              onPieceCountChange(Number.isInteger(raw) && raw >= 1 ? Math.min(raw, 100000) : 1);
            }}
            onWheel={(e) => e.currentTarget.blur()}
            className="w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-right pr-12 pl-3 text-slate-50 text-base focus:outline-none focus:border-indigo-500 tabular text-2xl font-semibold"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">pcs</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Custom price per piece</span>
        <ToggleSwitch checked={customPriceEnabled} onChange={onCustomPriceEnabledChange} />
      </div>

      {customPriceEnabled && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-400">Price per piece</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">€</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={customPricePerPiece === 0 ? "" : customPricePerPiece}
              placeholder="0.00"
              onChange={(e) => {
                const raw = parseFloat(e.target.value);
                onCustomPricePerPieceChange(Number.isFinite(raw) && raw >= 0 ? Math.min(raw, 1e7) : 0);
              }}
              onWheel={(e) => e.currentTarget.blur()}
              className="w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-right pr-3 pl-8 text-slate-50 text-base focus:outline-none focus:border-indigo-500 tabular text-2xl font-semibold placeholder:text-slate-500"
            />
          </div>
          <p className="text-xs text-slate-500">Overrides markup / margin calculation</p>
        </div>
      )}
    </section>
  );
}

function QuantityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
}
