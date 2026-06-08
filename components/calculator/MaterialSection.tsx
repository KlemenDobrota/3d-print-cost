"use client";
import type { Material, DraftMaterial } from "@/types";
import { createDraftMaterial } from "@/hooks/useCalculatorStore";

interface MaterialSectionProps {
  printerType: "FDM" | "Resin";
  materials: Material[];
  draftMaterials: DraftMaterial[];
  onDraftMaterialsChange: (materials: DraftMaterial[]) => void;
}

export function MaterialSection({
  printerType,
  materials,
  draftMaterials,
  onDraftMaterialsChange,
}: MaterialSectionProps) {
  const filtered = materials.filter((m) => m.type === printerType);
  const usageUnit = printerType === "FDM" ? "g" : "ml";
  const priceLabel = printerType === "FDM" ? "/kg" : "/litre";

  function updateEntry(id: string, patch: Partial<DraftMaterial>) {
    onDraftMaterialsChange(draftMaterials.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function removeEntry(id: string) {
    onDraftMaterialsChange(draftMaterials.filter((m) => m.id !== id));
  }

  function addEntry() {
    onDraftMaterialsChange([...draftMaterials, createDraftMaterial()]);
  }

  return (
    <section className="bg-slate-800 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <MaterialIcon />
        <h2 className="text-sm font-semibold text-slate-200">
          {draftMaterials.length > 1 ? "Materials" : "Material"}
        </h2>
      </div>

      {draftMaterials.map((dm, idx) => {
        const selected = filtered.find((m) => m.id === dm.materialId);
        const priceValue = selected
          ? printerType === "FDM" ? selected.pricePerKg : selected.pricePerLitre
          : undefined;
        const usageValue = printerType === "FDM" ? dm.filamentUsedGrams : dm.resinUsedMl;

        return (
          <div key={dm.id} className="flex flex-col gap-2.5">
            {draftMaterials.length > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Material {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeEntry(dm.id)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors"
                  aria-label={`Remove material ${idx + 1}`}
                >
                  <RemoveIcon />
                  Remove
                </button>
              </div>
            )}

            {/* Material selector */}
            <div className="relative">
              <select
                value={dm.materialId}
                onChange={(e) => updateEntry(dm.id, { materialId: e.target.value })}
                className="w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 pl-3 pr-8 text-base focus:outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="">— Enter price manually —</option>
                {filtered.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            {/* Price display / manual input */}
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
                    value={dm.manualMaterialPrice === 0 ? "" : dm.manualMaterialPrice}
                    placeholder="0"
                    onChange={(e) => updateEntry(dm.id, { manualMaterialPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-right pr-14 pl-7 text-slate-50 text-base focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
                    {priceLabel}
                  </span>
                </div>
              </div>
            )}

            {/* Usage input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-slate-400">
                {printerType === "FDM" ? "Filament used" : "Resin used"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={usageValue === 0 ? "" : usageValue}
                  placeholder="0"
                  onChange={(e) => {
                    const v = Math.max(0, parseFloat(e.target.value) || 0);
                    updateEntry(dm.id, printerType === "FDM" ? { filamentUsedGrams: v } : { resinUsedMl: v });
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-right pr-10 pl-3 text-slate-50 text-base focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
                  {usageUnit}
                </span>
              </div>
            </div>

            {/* Divider between entries */}
            {idx < draftMaterials.length - 1 && (
              <div className="border-t border-slate-700/60 mt-1" />
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addEntry}
        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg border border-dashed border-slate-600 text-sm text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
      >
        <PlusIcon />
        Add material
      </button>
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

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
