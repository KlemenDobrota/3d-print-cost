"use client";
import type { Material } from "@/types";

interface MaterialSectionProps {
  printerType: "FDM" | "Resin";
  materials: Material[];
  materialId: string;
  manualMaterialPrice: number;
  onMaterialIdChange: (id: string) => void;
  onManualMaterialPriceChange: (v: number) => void;
}

export function MaterialSection({
  printerType,
  materials,
  materialId,
  manualMaterialPrice,
  onMaterialIdChange,
  onManualMaterialPriceChange,
}: MaterialSectionProps) {
  const filtered = materials.filter((m) => m.type === printerType);
  const selected = filtered.find((m) => m.id === materialId);

  const priceLabel = printerType === "FDM" ? "/kg" : "/litre";
  const priceValue = selected
    ? printerType === "FDM"
      ? selected.pricePerKg
      : selected.pricePerLitre
    : undefined;

  return (
    <section className="bg-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <MaterialIcon />
        <h2 className="text-sm font-semibold text-slate-200">Material</h2>
      </div>

      <div className="relative">
        <select
          value={materialId}
          onChange={(e) => onMaterialIdChange(e.target.value)}
          className="w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 pl-3 pr-8 text-base focus:outline-none focus:border-indigo-500 appearance-none"
        >
          <option value="">— Enter price manually —</option>
          {filtered.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
      </div>

      {selected ? (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
            <span className="text-sm text-slate-200">{selected.name}</span>
          </div>
          {priceValue != null && (
            <span className="text-sm text-slate-400">€{priceValue.toFixed(2)}{priceLabel}</span>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-400">
            {printerType === "FDM" ? "Price per kg" : "Price per litre"}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">€</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={manualMaterialPrice}
              onChange={(e) => onManualMaterialPriceChange(parseFloat(e.target.value) || 0)}
              className="w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-right pr-14 pl-7 text-slate-50 text-base focus:outline-none focus:border-indigo-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
              {priceLabel}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

function MaterialIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
