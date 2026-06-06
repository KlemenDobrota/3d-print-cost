"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CalculatorDraft {
  jobName: string;
  printerType: "FDM" | "Resin";
  printerId: string;
  manualWattage: number;
  manualPurchasePrice: number;
  manualLifetimeHours: number;
  materialId: string;
  manualMaterialPrice: number;
  filamentUsedGrams: number;
  resinUsedMl: number;
  printTimeMinutes: number;
  electricityRate: number;
  failureRate: number;
  labourEnabled: boolean;
  labourTimeMinutes: number;
  pricingMode: "markup" | "margin";
  markupOrMargin: number;
  notes: string;
}

const INITIAL: CalculatorDraft = {
  jobName: "",
  printerType: "FDM",
  printerId: "",
  manualWattage: 200,
  manualPurchasePrice: 500,
  manualLifetimeHours: 2000,
  materialId: "",
  manualMaterialPrice: 25,
  filamentUsedGrams: 0,
  resinUsedMl: 0,
  printTimeMinutes: 0,
  electricityRate: 0.25,
  failureRate: 5,
  labourEnabled: false,
  labourTimeMinutes: 0,
  pricingMode: "markup",
  markupOrMargin: 200,
  notes: "",
};

interface CalculatorStore extends CalculatorDraft {
  patch: (partial: Partial<CalculatorDraft>) => void;
  resetDraft: () => void;
}

// Validate rehydrated localStorage: only accept keys present in INITIAL with matching types.
// Prevents stale/tampered data from flowing into calculations or the DB.
function mergeDraft(persisted: unknown, current: CalculatorStore): CalculatorStore {
  const p = (persisted ?? {}) as Record<string, unknown>;
  const clean = { ...INITIAL };
  for (const key of Object.keys(INITIAL) as (keyof CalculatorDraft)[]) {
    if (key in p && typeof p[key] === typeof INITIAL[key]) {
      (clean as Record<string, unknown>)[key] = p[key];
    }
  }
  return { ...current, ...clean };
}

export const useCalculatorStore = create<CalculatorStore>()(
  persist(
    (set) => ({
      ...INITIAL,
      patch: (partial) => set((s) => ({ ...s, ...partial })),
      resetDraft: () => set({ ...INITIAL }),
    }),
    {
      name: "calculator-draft",
      version: 1,
      merge: mergeDraft,
      skipHydration: true,
    }
  )
);
