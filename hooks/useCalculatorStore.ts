"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DraftMaterial } from "@/types";

export type { DraftMaterial };

export function createDraftMaterial(): DraftMaterial {
  return { id: crypto.randomUUID(), materialId: "", manualMaterialPrice: 25, filamentUsedGrams: 0, resinUsedMl: 0 };
}

export interface CalculatorDraft {
  jobName: string;
  printerType: "FDM" | "Resin";
  printerId: string;
  manualWattage: number;
  manualPurchasePrice: number;
  manualLifetimeHours: number;
  draftMaterials: DraftMaterial[];
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
  draftMaterials: [{ id: "mat-0", materialId: "", manualMaterialPrice: 25, filamentUsedGrams: 0, resinUsedMl: 0 }],
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

function safeFiniteNonNeg(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function validateDraftMaterial(raw: unknown): DraftMaterial {
  const r = (raw != null && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    id: typeof r.id === "string" && r.id.length > 0 ? r.id : crypto.randomUUID(),
    materialId: typeof r.materialId === "string" ? r.materialId : "",
    manualMaterialPrice: safeFiniteNonNeg(r.manualMaterialPrice, 25),
    filamentUsedGrams: safeFiniteNonNeg(r.filamentUsedGrams, 0),
    resinUsedMl: safeFiniteNonNeg(r.resinUsedMl, 0),
  };
}

function mergeDraft(persisted: unknown, current: CalculatorStore): CalculatorStore {
  const p = (persisted ?? {}) as Record<string, unknown>;
  const clean = { ...INITIAL };
  for (const key of Object.keys(INITIAL) as (keyof CalculatorDraft)[]) {
    if (!(key in p)) continue;
    const pVal = p[key];
    const initVal = INITIAL[key];
    if (Array.isArray(initVal)) {
      if (Array.isArray(pVal) && pVal.length > 0) {
        (clean as Record<string, unknown>)[key] = pVal.map(validateDraftMaterial);
      }
    } else if (typeof initVal === "number") {
      (clean as Record<string, unknown>)[key] = safeFiniteNonNeg(pVal, initVal);
    } else if (typeof pVal === typeof initVal) {
      (clean as Record<string, unknown>)[key] = pVal;
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
      version: 2,
      merge: mergeDraft,
      skipHydration: true,
    }
  )
);
