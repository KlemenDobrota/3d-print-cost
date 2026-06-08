import type { CalcInput, CalcInputFDM, CalcInputResin, CalcResult } from "@/types";

// Clamp to a finite non-negative number; NaN/Infinity/negative → 0.
function nn(n: number, min = 0): number {
  return Number.isFinite(n) && n >= min ? n : min;
}

// Ensure all fields in a CalcResult are finite (guard against upstream edge cases).
function finiteResult(r: CalcResult): CalcResult {
  return {
    materialCost: nn(r.materialCost),
    electricityCost: nn(r.electricityCost),
    depreciationCost: nn(r.depreciationCost),
    labourCost: nn(r.labourCost),
    wasteCost: nn(r.wasteCost),
    totalCost: nn(r.totalCost),
    sellingPrice: nn(r.sellingPrice),
    grossMarginPct: Number.isFinite(r.grossMarginPct) ? r.grossMarginPct : 0,
    markup: nn(r.markup),
  };
}

function computeCommon(
  materialCost: number,
  printTimeMinutes: number,
  wattage: number,
  electricityRate: number,
  purchasePrice: number,
  lifetimeHours: number,
  labourEnabled: boolean,
  labourTimeMinutes: number,
  labourRate: number,
  failureRate: number,
  pricingMode: "markup" | "margin",
  markupOrMargin: number
): CalcResult {
  // Clamp all numeric inputs defensively so callers can't produce NaN/Infinity.
  const hrs = nn(printTimeMinutes) / 60;
  const electricityCost = (nn(wattage) / 1000) * hrs * nn(electricityRate);
  const depreciationCost =
    nn(lifetimeHours, 1) > 0 ? (nn(purchasePrice) / nn(lifetimeHours, 1)) * hrs : 0;
  const labourCost = labourEnabled
    ? (nn(labourTimeMinutes) / 60) * nn(labourRate)
    : 0;

  const safeFailure = Math.min(nn(failureRate), 100);
  const subtotal = nn(materialCost) + electricityCost + depreciationCost + labourCost;
  const wasteCost = subtotal * (safeFailure / 100);
  const totalCost = subtotal + wasteCost;

  const safeMargin = Math.min(nn(markupOrMargin), 99.99);
  const sellingPrice =
    pricingMode === "markup"
      ? totalCost * (1 + nn(markupOrMargin) / 100)
      : totalCost / (1 - safeMargin / 100);

  const grossMarginPct =
    sellingPrice > 0 ? ((sellingPrice - totalCost) / sellingPrice) * 100 : 0;

  return finiteResult({
    materialCost: nn(materialCost),
    electricityCost,
    depreciationCost,
    labourCost,
    wasteCost,
    totalCost,
    sellingPrice,
    grossMarginPct,
    markup: markupOrMargin,
  });
}

export function calc(input: CalcInput): CalcResult {
  return computeCommon(
    input.materialCost,
    input.printTimeMinutes,
    input.wattage,
    input.electricityRate,
    input.purchasePrice,
    input.lifetimeHours,
    input.labourEnabled,
    input.labourTimeMinutes,
    input.labourRate,
    input.failureRate,
    input.pricingMode,
    input.markupOrMargin
  );
}

export function calcFDM(input: CalcInputFDM): CalcResult {
  const materialCost = nn(input.filamentUsedGrams) * (nn(input.pricePerKg) / 1000);
  return computeCommon(
    materialCost,
    input.printTimeMinutes,
    input.wattage,
    input.electricityRate,
    input.purchasePrice,
    input.lifetimeHours,
    input.labourEnabled,
    input.labourTimeMinutes,
    input.labourRate,
    input.failureRate,
    input.pricingMode,
    input.markupOrMargin
  );
}

export function calcResin(input: CalcInputResin): CalcResult {
  const materialCost = nn(input.resinUsedMl) * (nn(input.pricePerLitre) / 1000);
  return computeCommon(
    materialCost,
    input.printTimeMinutes,
    input.wattage,
    input.electricityRate,
    input.purchasePrice,
    input.lifetimeHours,
    input.labourEnabled,
    input.labourTimeMinutes,
    input.labourRate,
    input.failureRate,
    input.pricingMode,
    input.markupOrMargin
  );
}
