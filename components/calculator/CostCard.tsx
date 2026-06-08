"use client";
import type { CalcResult } from "@/types";

interface CostCardProps {
  result: CalcResult;
  pieceCount: number;
  effectiveSellingPrice: number;
  pricingMode: "markup" | "margin";
  labourEnabled: boolean;
  onSave: () => void;
  saving: boolean;
}

const COLORS = {
  material: "#00d4b4",
  electricity: "#f59e0b",
  depreciation: "#64748b",
  labour: "#22c55e",
  waste: "#ef4444",
};

export function CostCard({ result, pieceCount, effectiveSellingPrice, labourEnabled, onSave, saving }: CostCardProps) {
  const safePieces = Math.max(1, pieceCount);
  const profit = effectiveSellingPrice - result.totalCost;
  const multiPiece = safePieces > 1;
  const sellingPricePerPiece = effectiveSellingPrice / safePieces;
  const costPerPiece = result.totalCost / safePieces;
  const profitPerPiece = profit / safePieces;
  const effectiveMarginPct = effectiveSellingPrice > 0
    ? ((effectiveSellingPrice - result.totalCost) / effectiveSellingPrice) * 100
    : 0;

  const rows = [
    { label: "Material", value: result.materialCost, color: COLORS.material },
    { label: "Electricity", value: result.electricityCost, color: COLORS.electricity },
    { label: "Depreciation", value: result.depreciationCost, color: COLORS.depreciation },
    ...(labourEnabled ? [{ label: "Labour", value: result.labourCost, color: COLORS.labour }] : []),
    { label: "Waste buffer", value: result.wasteCost, color: COLORS.waste },
  ];

  const total = rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="bg-slate-800 rounded-2xl border border-indigo-500/30 shadow-[0_0_24px_-4px_rgba(99,102,241,0.2)] p-4 flex flex-col gap-4">
      {/* Selling price header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          {multiPiece ? (
            <>
              <p className="text-xs text-slate-400 mb-0.5">Selling price / piece</p>
              <p className="text-4xl font-semibold text-slate-50 tabular leading-none">
                €{sellingPricePerPiece.toFixed(2)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {safePieces} pcs · <span className="text-slate-200 tabular">€{result.totalCost.toFixed(2)}</span> cost · <span className="text-slate-200 tabular">€{effectiveSellingPrice.toFixed(2)}</span> sell
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Cost <span className="text-slate-200 tabular">€{costPerPiece.toFixed(2)}</span>/pc · Profit <span className="text-slate-200 tabular">€{profitPerPiece.toFixed(2)}</span>/pc
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-400 mb-0.5">Selling price</p>
              <p className="text-4xl font-semibold text-slate-50 tabular leading-none">
                €{effectiveSellingPrice.toFixed(2)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Profit <span className="text-slate-200 tabular">€{profit.toFixed(2)}</span> per print
              </p>
            </>
          )}
        </div>
        <span className="flex-shrink-0 flex items-center gap-1.5 bg-green-900/40 border border-green-800/50 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          {effectiveMarginPct.toFixed(0)} % margin
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-700" />

      {/* Cost breakdown rows */}
      <div className="flex flex-col gap-3">
        {multiPiece && (
          <p className="text-xs text-slate-500 -mb-1">Total job cost breakdown</p>
        )}
        {rows.map((row) => {
          const pct = total > 0.001 ? (row.value / total) * 100 : 0;
          return (
            <div key={row.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-slate-300">{row.label}</span>
                <span className="text-sm font-medium text-slate-100 tabular">€{row.value.toFixed(2)}</span>
              </div>
              <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: row.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-action hover:bg-action-hover disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-xl px-4 py-3.5 transition-colors min-h-[52px] text-base"
      >
        {saving ? (
          <>
            <Spinner />
            Saving…
          </>
        ) : (
          <>
            <SaveIcon />
            Save job
          </>
        )}
      </button>
    </div>
  );
}

function SaveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
