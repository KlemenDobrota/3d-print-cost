"use client";
import { useState } from "react";
import { db } from "@/lib/db";
import { TogglePill } from "@/components/ui/TogglePill";
import type { Printer } from "@/types";

interface Props {
  initial?: Printer;
  onDone: () => void;
}

export function PrinterForm({ initial, onDone }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<"FDM" | "Resin">(initial?.type ?? "FDM");
  const [wattage, setWattage] = useState(initial?.wattage ?? 200);
  const [purchasePrice, setPurchasePrice] = useState(initial?.purchasePrice ?? 300);
  const [lifetimeHours, setLifetimeHours] = useState(initial?.lifetimeHours ?? 2000);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) { setError("Name is required"); return; }
    if (!Number.isFinite(wattage) || wattage < 0) { setError("Power must be a non-negative number"); return; }
    if (!Number.isFinite(purchasePrice) || purchasePrice < 0) { setError("Purchase price must be a non-negative number"); return; }
    if (!Number.isFinite(lifetimeHours) || lifetimeHours < 1) { setError("Lifetime hours must be at least 1"); return; }
    setSaving(true);
    setError("");
    try {
      await db.printers.put({
        id: initial?.id ?? crypto.randomUUID(),
        name: trimmed,
        type,
        wattage,
        purchasePrice,
        lifetimeHours,
        notes: notes.trim() || undefined,
        createdAt: initial?.createdAt ?? new Date().toISOString(),
      });
      onDone();
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-100">
        {initial ? "Edit printer" : "Add printer"}
      </h3>

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Type</span>
        <TogglePill
          options={[
            { label: "FDM", value: "FDM" as const },
            { label: "Resin", value: "Resin" as const },
          ]}
          value={type}
          onChange={setType}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Bambu Lab X1C"
          maxLength={80}
          className="h-11 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 px-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <NumField label="Power consumption" value={wattage} unit="W" onChange={setWattage} min={0} />
      <NumField label="Purchase price" value={purchasePrice} unit="€" unitLeft onChange={setPurchasePrice} min={0} step={1} />
      <NumField label="Lifetime hours" value={lifetimeHours} unit="hrs" onChange={setLifetimeHours} min={1} />

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Brand, model, link…"
          rows={2}
          className="rounded-lg bg-slate-700 border border-slate-600 text-slate-50 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 h-11 bg-action hover:bg-action-hover disabled:opacity-60 text-slate-900 text-sm font-semibold rounded-xl transition-colors"
        >
          {saving ? "Saving…" : "Save printer"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-11 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
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
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
            {unit}
          </span>
        )}
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={`w-full h-11 rounded-lg bg-slate-700 border border-slate-600 text-right text-slate-50 text-sm focus:outline-none focus:border-indigo-500 ${unitLeft ? "pl-7 pr-3" : "pl-3 pr-12"}`}
        />
        {!unitLeft && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
