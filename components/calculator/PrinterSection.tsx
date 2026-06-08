"use client";
import { cn } from "@/components/ui/cn";
import type { Printer } from "@/types";

interface PrinterSectionProps {
  printerType: "FDM" | "Resin";
  printers: Printer[];
  printerId: string;
  manualWattage: number;
  manualPurchasePrice: number;
  manualLifetimeHours: number;
  electricityRate: number;
  onPrinterIdChange: (id: string) => void;
  onManualWattageChange: (v: number) => void;
  onManualPurchasePriceChange: (v: number) => void;
  onManualLifetimeHoursChange: (v: number) => void;
  onElectricityRateChange: (v: number) => void;
}

export function PrinterSection({
  printerType,
  printers,
  printerId,
  manualWattage,
  manualPurchasePrice,
  manualLifetimeHours,
  electricityRate,
  onPrinterIdChange,
  onManualWattageChange,
  onManualPurchasePriceChange,
  onManualLifetimeHoursChange,
  onElectricityRateChange,
}: PrinterSectionProps) {
  const filtered = printers.filter((p) => p.type === printerType);
  const selected = filtered.find((p) => p.id === printerId);
  const isManual = !selected;

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    onPrinterIdChange(e.target.value);
  }

  return (
    <section className="bg-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <PrinterIcon />
        <h2 className="text-sm font-semibold text-slate-200">Printer</h2>
      </div>

      {/* Dropdown */}
      <div className="relative">
        <select
          value={printerId}
          onChange={handleSelect}
          className="w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 pl-3 pr-8 text-base focus:outline-none focus:border-indigo-500 appearance-none"
        >
          <option value="">— Manual mode —</option>
          {filtered.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
      </div>

      {selected ? (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
            <span className="text-sm text-slate-200">{selected.name}</span>
          </div>
          <span className="text-sm text-slate-400">{selected.wattage} W</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <NumField label="Power" value={manualWattage} unit="W" onChange={onManualWattageChange} min={0} />
          <NumField label="Purchase price" value={manualPurchasePrice} unit="€" unitLeft onChange={onManualPurchasePriceChange} min={0} />
          <NumField label="Lifetime hours" value={manualLifetimeHours} unit="hrs" onChange={onManualLifetimeHoursChange} min={1} />
        </div>
      )}

      {/* Electricity rate — always visible */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm text-slate-400">Electricity tariff</label>
          <span className="text-xs text-slate-500">your rate</span>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">€</span>
          <input
            type="number"
            min={0}
            step={0.01}
            value={electricityRate === 0 ? "" : electricityRate}
            placeholder="0"
            onChange={(e) => onElectricityRateChange(Math.max(0, parseFloat(e.target.value) || 0))}
            onWheel={(e) => e.currentTarget.blur()}
            className="w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-right pr-14 pl-7 text-slate-50 text-base focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">/kWh</span>
        </div>
      </div>
    </section>
  );
}

interface NumFieldProps {
  label: string;
  value: number;
  unit: string;
  unitLeft?: boolean;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}

function NumField({ label, value, unit, unitLeft, onChange, min = 0, step = 1 }: NumFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400">{label}</label>
      <div className="relative">
        {unitLeft && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">{unit}</span>
        )}
        <input
          type="number"
          min={min}
          step={step}
          value={value === 0 ? "" : value}
          placeholder="0"
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          onWheel={(e) => e.currentTarget.blur()}
          className={cn(
            "w-full h-12 rounded-lg bg-slate-700 border border-slate-600 text-right text-slate-50 text-base focus:outline-none focus:border-indigo-500 placeholder:text-slate-500",
            unitLeft ? "pl-7 pr-3" : "pl-3 pr-12"
          )}
        />
        {!unitLeft && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">{unit}</span>
        )}
      </div>
    </div>
  );
}

function PrinterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" aria-hidden="true">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
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
