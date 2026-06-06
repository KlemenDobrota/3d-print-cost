"use client";
import { useState, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { usePrinters } from "@/hooks/usePrinters";
import { useMaterials } from "@/hooks/useMaterials";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { TogglePill } from "@/components/ui/TogglePill";
import { Toast, useToast } from "@/components/ui/Toast";
import type { Settings } from "@/types";

export function DefaultsTab() {
  const saved = useLiveQuery(async () => {
    const s = await db.settings.get("default");
    return s ?? null;
  });
  const printers = usePrinters();
  const materials = useMaterials();
  const { toast, show, dismiss } = useToast();

  const [electricityRate, setElectricityRate] = useState(DEFAULT_SETTINGS.electricityRate);
  const [labourRate, setLabourRate] = useState(DEFAULT_SETTINGS.labourRate);
  const [defaultMarkup, setDefaultMarkup] = useState(DEFAULT_SETTINGS.defaultMarkup);
  const [defaultFailureRate, setDefaultFailureRate] = useState(DEFAULT_SETTINGS.defaultFailureRate);
  const [pricingMode, setPricingMode] = useState<"markup" | "margin">(DEFAULT_SETTINGS.pricingMode);
  const [defaultPrinterId, setDefaultPrinterId] = useState("");
  const [defaultMaterialId, setDefaultMaterialId] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Holds the full pending form state so the debounced save always uses current values.
  const formRef = useRef<Omit<Settings, "id">>({ ...DEFAULT_SETTINGS });
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (initialized || saved === undefined) return;
    const s = saved ?? { id: "default", ...DEFAULT_SETTINGS };
    setElectricityRate(s.electricityRate);
    setLabourRate(s.labourRate);
    setDefaultMarkup(s.defaultMarkup);
    setDefaultFailureRate(s.defaultFailureRate);
    setPricingMode(s.pricingMode);
    setDefaultPrinterId(s.defaultPrinterId ?? "");
    setDefaultMaterialId(s.defaultMaterialId ?? "");
    formRef.current = {
      electricityRate: s.electricityRate,
      labourRate: s.labourRate,
      defaultMarkup: s.defaultMarkup,
      defaultFailureRate: s.defaultFailureRate,
      pricingMode: s.pricingMode,
      defaultPrinterId: s.defaultPrinterId,
      defaultMaterialId: s.defaultMaterialId,
    };
    setInitialized(true);
  }, [saved, initialized]);

  function scheduleAutoSave(patch: Partial<Omit<Settings, "id">>) {
    formRef.current = { ...formRef.current, ...patch };
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        await db.settings.put({ id: "default", ...formRef.current });
        show("Saved");
      } catch {
        show("Failed to save", "error");
      }
    }, 700);
  }

  if (!initialized) {
    return <div className="py-8 text-center text-sm text-slate-500">Loading…</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} durationMs={1500} />}

      <p className="text-xs text-slate-500 px-1">
        Used to pre-fill every new calculation. Changes save automatically.
      </p>

      {/* Electricity rate */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <label className="text-sm text-slate-300">Electricity rate</label>
          <InfoIcon />
        </div>
        <RateInput
          value={electricityRate}
          unitLeft="€"
          unitRight="/kWh"
          step={0.01}
          onChange={(v) => { setElectricityRate(v); scheduleAutoSave({ electricityRate: v }); }}
        />
      </div>

      {/* Labour rate */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-slate-300">Default labour rate</label>
        <RateInput
          value={labourRate}
          unitLeft="€"
          unitRight="/hr"
          step={0.5}
          onChange={(v) => { setLabourRate(v); scheduleAutoSave({ labourRate: v }); }}
        />
      </div>

      {/* Failure / waste rate — slider */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-slate-300">Failure / waste rate</label>
          <span className="text-xs font-semibold bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full tabular-nums">
            {defaultFailureRate.toFixed(defaultFailureRate % 1 === 0 ? 0 : 1)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={20}
          step={0.5}
          value={Math.min(defaultFailureRate, 20)}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setDefaultFailureRate(v);
            scheduleAutoSave({ defaultFailureRate: v });
          }}
          className="w-full h-1.5 rounded-full appearance-none bg-slate-700 accent-[#00d4b4] cursor-pointer"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>0%</span>
          <span>20%</span>
        </div>
      </div>

      {/* Pricing mode */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-300">Default pricing mode</label>
        <TogglePill
          options={[
            { label: "Markup %", value: "markup" as const },
            { label: "Margin %", value: "margin" as const },
          ]}
          value={pricingMode}
          onChange={(v) => { setPricingMode(v); scheduleAutoSave({ pricingMode: v }); }}
          fullWidth
        />
      </div>

      {/* Default markup/margin */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-slate-300">
          {pricingMode === "markup" ? "Default markup" : "Default margin"}
        </label>
        <RateInput
          value={defaultMarkup}
          unitRight="%"
          step={1}
          onChange={(v) => { setDefaultMarkup(v); scheduleAutoSave({ defaultMarkup: v }); }}
        />
      </div>

      {/* Default printer */}
      {printers.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-300">Default printer</label>
          <div className="relative">
            <select
              value={defaultPrinterId}
              onChange={(e) => {
                setDefaultPrinterId(e.target.value);
                scheduleAutoSave({ defaultPrinterId: e.target.value || undefined });
              }}
              className="w-full h-11 rounded-xl bg-slate-800 border border-slate-700 text-slate-50 pl-3 pr-8 text-sm focus:outline-none focus:border-indigo-500 appearance-none"
            >
              <option value="">None</option>
              {printers.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
              ))}
            </select>
            <ChevronDown />
          </div>
        </div>
      )}

      {/* Default material */}
      {materials.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-slate-300">Default material</label>
          <div className="relative">
            <select
              value={defaultMaterialId}
              onChange={(e) => {
                setDefaultMaterialId(e.target.value);
                scheduleAutoSave({ defaultMaterialId: e.target.value || undefined });
              }}
              className="w-full h-11 rounded-xl bg-slate-800 border border-slate-700 text-slate-50 pl-3 pr-8 text-sm focus:outline-none focus:border-indigo-500 appearance-none"
            >
              <option value="">None</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.type} · {m.material})</option>
              ))}
            </select>
            <ChevronDown />
          </div>
        </div>
      )}
    </div>
  );
}

interface RateInputProps {
  value: number;
  unitLeft?: string;
  unitRight?: string;
  step?: number;
  onChange: (v: number) => void;
}

function RateInput({ value, unitLeft, unitRight, step = 1, onChange }: RateInputProps) {
  return (
    <div className="relative">
      {unitLeft && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
          {unitLeft}
        </span>
      )}
      <input
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={`w-full h-12 rounded-xl bg-slate-800 border border-slate-700 text-right text-slate-50 text-sm focus:outline-none focus:border-indigo-500 ${unitLeft ? "pl-7" : "pl-3"} ${unitRight ? "pr-14" : "pr-3"}`}
      />
      {unitRight && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none">
          {unitRight}
        </span>
      )}
    </div>
  );
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
