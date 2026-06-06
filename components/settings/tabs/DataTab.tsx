"use client";
import { useRef, useState, useEffect } from "react";
import { db } from "@/lib/db";
import { Toast, useToast } from "@/components/ui/Toast";
import type { Printer, Material, Job, Settings } from "@/types";

const PRINTER_TYPES = new Set(["FDM", "Resin"]);
const MATERIAL_TYPES = new Set(["FDM", "Resin"]);
const MATERIAL_NAMES = new Set(["PLA", "PETG", "ABS", "ASA", "TPU", "Nylon", "Resin", "Other"]);
const PRICING_MODES = new Set(["markup", "margin"]);

function safeFinite(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function isValidId(v: unknown): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= 100;
}

function isValidPrinter(r: unknown): r is Printer {
  if (typeof r !== "object" || r === null) return false;
  const p = r as Record<string, unknown>;
  return (
    isValidId(p.id) &&
    typeof p.name === "string" &&
    p.name.trim().length > 0 &&
    PRINTER_TYPES.has(p.type as string) &&
    typeof p.createdAt === "string"
  );
}

function normalizePrinter(r: Printer): Printer {
  return {
    id: String(r.id).slice(0, 100),
    name: String(r.name).slice(0, 80),
    type: r.type,
    wattage: Math.max(0, safeFinite(r.wattage, 0)),
    purchasePrice: Math.max(0, safeFinite(r.purchasePrice, 0)),
    lifetimeHours: Math.max(1, safeFinite(r.lifetimeHours, 1)),
    notes: r.notes ? String(r.notes).slice(0, 500) : undefined,
    createdAt: String(r.createdAt).slice(0, 30),
  };
}

function isValidMaterial(r: unknown): r is Material {
  if (typeof r !== "object" || r === null) return false;
  const m = r as Record<string, unknown>;
  return (
    isValidId(m.id) &&
    typeof m.name === "string" &&
    m.name.trim().length > 0 &&
    MATERIAL_TYPES.has(m.type as string) &&
    MATERIAL_NAMES.has(m.material as string) &&
    typeof m.createdAt === "string"
  );
}

function normalizeMaterial(r: Material): Material {
  return {
    id: String(r.id).slice(0, 100),
    name: String(r.name).slice(0, 80),
    type: r.type,
    material: r.material,
    pricePerKg: r.pricePerKg !== undefined ? Math.max(0, safeFinite(r.pricePerKg, 0)) : undefined,
    spoolWeight: r.spoolWeight !== undefined ? Math.max(1, safeFinite(r.spoolWeight, 1)) : undefined,
    pricePerLitre: r.pricePerLitre !== undefined ? Math.max(0, safeFinite(r.pricePerLitre, 0)) : undefined,
    bottleVolumeMl: r.bottleVolumeMl !== undefined ? Math.max(1, safeFinite(r.bottleVolumeMl, 1)) : undefined,
    density: r.density !== undefined ? Math.max(0.01, safeFinite(r.density, 1)) : undefined,
    notes: r.notes ? String(r.notes).slice(0, 500) : undefined,
    createdAt: String(r.createdAt).slice(0, 30),
  };
}

function isValidJob(r: unknown): r is Job {
  if (typeof r !== "object" || r === null) return false;
  const j = r as Record<string, unknown>;
  return (
    isValidId(j.id) &&
    typeof j.name === "string" &&
    PRINTER_TYPES.has(j.printerType as string) &&
    typeof j.createdAt === "string"
  );
}

function normalizeJob(r: Job): Job {
  const rr = r as unknown as Record<string, unknown>;
  return {
    id: String(r.id).slice(0, 100),
    name: String(r.name).slice(0, 120),
    date: typeof rr.date === "string" ? rr.date.slice(0, 20) : new Date().toISOString().slice(0, 10),
    printerType: r.printerType,
    printerId: typeof rr.printerId === "string" ? rr.printerId.slice(0, 100) : undefined,
    printerName: typeof rr.printerName === "string" ? rr.printerName.slice(0, 80) : "",
    materialId: typeof rr.materialId === "string" ? rr.materialId.slice(0, 100) : undefined,
    materialName: typeof rr.materialName === "string" ? rr.materialName.slice(0, 80) : "",
    filamentUsedGrams: rr.filamentUsedGrams !== undefined ? Math.max(0, safeFinite(rr.filamentUsedGrams, 0)) : undefined,
    resinUsedMl: rr.resinUsedMl !== undefined ? Math.max(0, safeFinite(rr.resinUsedMl, 0)) : undefined,
    printTimeMinutes: Math.max(0, safeFinite(r.printTimeMinutes, 0)),
    failureRate: Math.min(100, Math.max(0, safeFinite(r.failureRate, 0))),
    labourEnabled: Boolean(rr.labourEnabled),
    labourTimeMinutes: rr.labourTimeMinutes !== undefined ? Math.max(0, safeFinite(rr.labourTimeMinutes, 0)) : undefined,
    labourRate: rr.labourRate !== undefined ? Math.max(0, safeFinite(rr.labourRate, 0)) : undefined,
    materialCost: safeFinite(r.materialCost, 0),
    electricityCost: safeFinite(r.electricityCost, 0),
    depreciationCost: safeFinite(r.depreciationCost, 0),
    labourCost: safeFinite(r.labourCost, 0),
    wasteCost: safeFinite(r.wasteCost, 0),
    totalCost: safeFinite(r.totalCost, 0),
    markup: safeFinite(r.markup, 0),
    sellingPrice: safeFinite(r.sellingPrice, 0),
    grossMarginPct: safeFinite(r.grossMarginPct, 0),
    notes: r.notes ? String(r.notes).slice(0, 1000) : undefined,
    createdAt: String(r.createdAt).slice(0, 30),
  };
}

function isValidSettings(r: unknown): r is Settings {
  if (typeof r !== "object" || r === null) return false;
  const s = r as Record<string, unknown>;
  return (
    s.id === "default" &&
    PRICING_MODES.has(s.pricingMode as string)
  );
}

function normalizeSettings(r: Settings): Settings {
  return {
    id: "default",
    electricityRate: Math.max(0, safeFinite(r.electricityRate, 0.25)),
    labourRate: Math.max(0, safeFinite(r.labourRate, 15)),
    defaultMarkup: Math.max(0, safeFinite(r.defaultMarkup, 200)),
    defaultFailureRate: Math.min(100, Math.max(0, safeFinite(r.defaultFailureRate, 5))),
    pricingMode: PRICING_MODES.has(r.pricingMode) ? r.pricingMode : "markup",
    defaultPrinterId: typeof r.defaultPrinterId === "string" ? r.defaultPrinterId : undefined,
    defaultMaterialId: typeof r.defaultMaterialId === "string" ? r.defaultMaterialId : undefined,
  };
}

export function DataTab() {
  const { toast, show, dismiss } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  useEffect(() => {
    setLastExport(localStorage.getItem("lastExport"));
  }, []);

  async function handleExport() {
    try {
      const [printers, materials, jobs, settings] = await Promise.all([
        db.printers.toArray(),
        db.materials.toArray(),
        db.jobs.toArray(),
        db.settings.toArray(),
      ]);
      const payload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        printers,
        materials,
        jobs,
        settings,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `3d-print-cost-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      const ts = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      localStorage.setItem("lastExport", ts);
      setLastExport(ts);
      show("Backup downloaded");
    } catch {
      show("Export failed", "error");
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImporting(true);
    try {
      const text = await file.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("File is not valid JSON");
      }

      if (
        typeof data !== "object" ||
        data === null ||
        !Array.isArray((data as Record<string, unknown>).printers) ||
        !Array.isArray((data as Record<string, unknown>).materials) ||
        !Array.isArray((data as Record<string, unknown>).jobs)
      ) {
        throw new Error("Invalid backup file — missing required arrays");
      }

      const d = data as Record<string, unknown>;
      if ((d.version as number) !== 1) {
        throw new Error(`Unsupported backup version: ${d.version}`);
      }

      const printers = (d.printers as unknown[]).filter(isValidPrinter).map(normalizePrinter);
      const materials = (d.materials as unknown[]).filter(isValidMaterial).map(normalizeMaterial);
      const jobs = (d.jobs as unknown[]).filter(isValidJob).map(normalizeJob);
      const settings = Array.isArray(d.settings)
        ? (d.settings as unknown[]).filter(isValidSettings).map(normalizeSettings)
        : [];

      await Promise.all([
        db.printers.bulkPut(printers),
        db.materials.bulkPut(materials),
        db.jobs.bulkPut(jobs),
        settings.length > 0 ? db.settings.bulkPut(settings) : Promise.resolve(),
      ]);

      const skipped =
        (d.printers as unknown[]).length - printers.length +
        (d.materials as unknown[]).length - materials.length +
        (d.jobs as unknown[]).length - jobs.length;

      show(
        skipped > 0
          ? `Imported ${jobs.length} jobs, ${printers.length} printers, ${materials.length} materials (${skipped} invalid records skipped)`
          : `Imported ${jobs.length} jobs, ${printers.length} printers, ${materials.length} materials`
      );
    } catch (err: unknown) {
      show(err instanceof Error ? err.message : "Import failed", "error");
    } finally {
      setImporting(false);
    }
  }

  async function handleClearAll() {
    if (!confirmClear) { setConfirmClear(true); return; }
    setClearing(true);
    try {
      await Promise.all([
        db.printers.clear(),
        db.materials.clear(),
        db.jobs.clear(),
        db.settings.clear(),
      ]);
      show("All data cleared");
    } catch {
      show("Failed to clear data", "error");
    } finally {
      setClearing(false);
      setConfirmClear(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}

      {/* Export */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-action/15 flex items-center justify-center flex-shrink-0">
            <DownloadIcon className="text-action" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">Export your data</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Download a backup of all your printers, materials, jobs and settings.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center justify-center gap-2 h-11 w-full bg-action hover:bg-action-hover text-slate-900 text-sm font-semibold rounded-xl transition-colors"
        >
          <DownloadIcon className="text-slate-900" />
          Download backup (JSON)
        </button>
        <p className="text-xs text-slate-500 text-center">
          Last export: {lastExport ?? "never"}
        </p>
      </div>

      {/* Import */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-action/15 flex items-center justify-center flex-shrink-0">
            <UploadIcon className="text-action" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">Restore from backup</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Import a previously exported JSON file. Existing records with the same ID will be merged.
            </p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportFile}
          className="hidden"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="w-full border-2 border-dashed border-slate-600 hover:border-indigo-500 disabled:opacity-60 rounded-xl py-7 flex flex-col items-center gap-2 transition-colors"
        >
          <UploadIcon className="text-slate-400" />
          <span className="text-sm font-medium text-slate-300">
            {importing ? "Importing…" : "Tap to select a backup file"}
          </span>
          <span className="text-xs text-slate-500">.json</span>
        </button>
      </div>

      {/* Danger zone — collapsible */}
      <div className="rounded-xl border border-red-900/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setDangerOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-red-400 hover:bg-red-900/10 transition-colors"
        >
          <div className="flex items-center gap-2">
            <WarningIcon />
            <span className="text-sm font-semibold">Danger zone</span>
          </div>
          <ChevronIcon open={dangerOpen} />
        </button>

        {dangerOpen && (
          <div className="px-4 pb-4 border-t border-red-900/30 pt-3 flex flex-col gap-3">
            <p className="text-xs text-slate-500">
              Permanently delete all local data: jobs, printers, materials, and settings.
              This cannot be undone.
            </p>
            {confirmClear ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={clearing}
                  className="flex-1 h-11 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {clearing ? "Clearing…" : "Yes, clear everything"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="h-11 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClearAll}
                className="h-11 border border-red-800 text-red-400 hover:bg-red-900/20 text-sm font-semibold rounded-xl transition-colors"
              >
                Clear all data
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
