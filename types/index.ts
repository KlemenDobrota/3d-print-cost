export interface Printer {
  id: string;
  name: string;
  type: "FDM" | "Resin";
  wattage: number;
  purchasePrice: number;
  lifetimeHours: number;
  notes?: string;
  createdAt: string;
}

export type MaterialType =
  | "PLA"
  | "PETG"
  | "ABS"
  | "ASA"
  | "TPU"
  | "Nylon"
  | "Resin"
  | "Other";

export interface Material {
  id: string;
  name: string;
  type: "FDM" | "Resin";
  material: MaterialType;
  // FDM fields
  pricePerKg?: number;
  spoolWeight?: number;
  // Resin fields
  pricePerLitre?: number;
  bottleVolumeMl?: number;
  density?: number;
  notes?: string;
  createdAt: string;
}

export interface Settings {
  id: string; // always "default"
  electricityRate: number;
  labourRate: number;
  defaultMarkup: number;
  defaultFailureRate: number;
  pricingMode: "markup" | "margin";
  defaultPrinterId?: string;
  defaultMaterialId?: string;
}

export interface Job {
  id: string;
  name: string;
  date: string;
  printerType: "FDM" | "Resin";
  printerId?: string;
  printerName: string;
  materialId?: string;
  materialName: string;
  // FDM
  filamentUsedGrams?: number;
  // Resin
  resinUsedMl?: number;
  // Shared
  printTimeMinutes: number;
  failureRate: number;
  // Labour
  labourEnabled: boolean;
  labourTimeMinutes?: number;
  labourRate?: number;
  // Results (stored at save time)
  materialCost: number;
  electricityCost: number;
  depreciationCost: number;
  labourCost: number;
  wasteCost: number;
  totalCost: number;
  markup: number;
  sellingPrice: number;
  grossMarginPct: number;
  notes?: string;
  createdAt: string;
}

export interface CalcInputFDM {
  filamentUsedGrams: number;
  pricePerKg: number;
  printTimeMinutes: number;
  wattage: number;
  electricityRate: number;
  purchasePrice: number;
  lifetimeHours: number;
  labourEnabled: boolean;
  labourTimeMinutes: number;
  labourRate: number;
  failureRate: number;
  pricingMode: "markup" | "margin";
  markupOrMargin: number;
}

export interface CalcInputResin {
  resinUsedMl: number;
  pricePerLitre: number;
  printTimeMinutes: number;
  wattage: number;
  electricityRate: number;
  purchasePrice: number;
  lifetimeHours: number;
  labourEnabled: boolean;
  labourTimeMinutes: number;
  labourRate: number;
  failureRate: number;
  pricingMode: "markup" | "margin";
  markupOrMargin: number;
}

export interface CalcResult {
  materialCost: number;
  electricityCost: number;
  depreciationCost: number;
  labourCost: number;
  wasteCost: number;
  totalCost: number;
  sellingPrice: number;
  grossMarginPct: number;
  markup: number;
}
