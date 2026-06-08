"use client";
import { useState } from "react";
import { db } from "@/lib/db";
import { TogglePill } from "@/components/ui/TogglePill";
import type { Material, MaterialType } from "@/types";

const FDM_TYPES: MaterialType[] = ["PLA", "PETG", "ABS", "ASA", "TPU", "Nylon", "Other"];
const RESIN_TYPES: MaterialType[] = ["Resin", "Other"];

interface Props {
  initial?: Material;
  onDone: () => void;
}

export function MaterialForm({ initial, onDone }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<"FDM" | "Resin">(initial?.type ?? "FDM");
  const [material, setMaterial] = useState<MaterialType>(initial?.material ?? "PLA");
  const [pricePerKg, setPricePerKg] = useState(initial?.pricePerKg ?? 25);
  const [spoolWeight, setSpoolWeight] = useState(initial?.spoolWeight ?? 1000);
  const [pricePerLitre, setPricePerLitre] = useState(initial?.pricePerLitre ?? 30);
  const [bottleVolumeMl, setBottleVolumeMl] = useState(initial?.bottleVolumeMl ?? 1000);
  const [density, setDensity] = useState(initial?.density ?? 1.1);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleTypeChange(newType: "FDM" | "Resin") {
    setType(newType);
    if (newType === "Resin" && !RESIN_TYPES.includes(material)) {
      setMaterial("Resin");
    } else if (newType === "FDM" && !FDM_TYPES.includes(material)) {
      setMaterial("PLA");
    }
  }

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) { setError("Name is required"); return; }
    if (type === "FDM") {
      if (!Number.isFinite(pricePerKg) || pricePerKg < 0) { setError("Price per kg must be a non-negative number"); return; }
      if (!Number.isFinite(spoolWeight) || spoolWeight < 1) { setError("Spool weight must be at least 1 g"); return; }
    } else {
      if (!Number.isFinite(pricePerLitre) || pricePerLitre < 0) { setError("Price per litre must be a non-negative number"); return; }
      if (!Number.isFinite(bottleVolumeMl) || bottleVolumeMl < 1) { setError("Bottle volume must be at least 1 mL"); return; }
      if (!Number.isFinite(density) || density <= 0) { setError("Density must be greater than 0"); return; }
    }
    setSaving(true);
    setError("");
    try {
      const record: Material = {
        id: initial?.id ?? crypto.randomUUID(),
        name: trimmed,
        type,
        material,
        notes: notes.trim() || undefined,
        createdAt: initial?.createdAt ?? new Date().toISOString(),
        ...(type === "FDM"
          ? { pricePerKg, spoolWeight }
          : { pricePerLitre, bottleVolumeMl, density }),
      };
      await db.materials.put(record);
      onDone();
    } catch {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  }

  const materialTypes = type === "FDM" ? FDM_TYPES : RESIN_TYPES;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-100">
        {initial ? "Edit material" : "Add material"}
      </h3>

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Type</span>
        <TogglePill
          options={[
            { label: "FDM", value: "FDM" as const },
            { label: "Resin", value: "Resin" as const },
          ]}
          value={type}
          onChange={handleTypeChange}
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
          placeholder="e.g. Bambu PLA Basic White"
          maxLength={80}
          className="h-11 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 px-3 text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">Material</label>
        <div className="relative">
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value as MaterialType)}
            className="w-full h-11 rounded-lg bg-slate-700 border border-slate-600 text-slate-50 pl-3 pr-8 text-sm focus:outline-none focus:border-indigo-500 appearance-none"
          >
            {materialTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <ChevronDown />
        </div>
      </div>

      {type === "FDM" ? (
        <>
          <NumField label="Price per kg" value={pricePerKg} unit="€/kg" unitLeft onChange={setPricePerKg} min={0} step={0.01} />
          <NumField label="Spool weight" value={spoolWeight} unit="g" onChange={setSpoolWeight} min={1} />
        </>
      ) : (
        <>
          <NumField label="Price per litre" value={pricePerLitre} unit="€/L" unitLeft onChange={setPricePerLitre} min={0} step={0.01} />
          <NumField label="Bottle volume" value={bottleVolumeMl} unit="mL" onChange={setBottleVolumeMl} min={1} />
          <NumField label="Density" value={density} unit="g/mL" onChange={setDensity} min={0.01} step={0.01} />
        </>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Brand, colour, link…"
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
          {saving ? "Saving…" : "Save material"}
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
          onWheel={(e) => e.currentTarget.blur()}
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

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
