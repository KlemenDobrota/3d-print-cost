"use client";
import { useState, useEffect } from "react";
import { useCalculatorStore, createDraftMaterial } from "@/hooks/useCalculatorStore";
import { useSettings } from "@/hooks/useSettings";
import { usePrinters } from "@/hooks/usePrinters";
import { useMaterials } from "@/hooks/useMaterials";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { calc } from "@/lib/calculations";
import { db } from "@/lib/db";
import { JobInfoSection } from "@/components/calculator/JobInfoSection";
import { PrinterSection } from "@/components/calculator/PrinterSection";
import { MaterialSection } from "@/components/calculator/MaterialSection";
import { PrintDetailsSection } from "@/components/calculator/PrintDetailsSection";
import { LabourSection } from "@/components/calculator/LabourSection";
import { PricingSection } from "@/components/calculator/PricingSection";
import { CostCard } from "@/components/calculator/CostCard";
import { Toast, useToast } from "@/components/ui/Toast";

export default function CalculatorPage() {
  const draft = useCalculatorStore();
  useEffect(() => { useCalculatorStore.persist.rehydrate(); }, []);
  const settings = useSettings();
  const printers = usePrinters();
  const materials = useMaterials();
  const { toast, show: showToast, dismiss } = useToast();
  const [saving, setSaving] = useState(false);
  const { canInstall, install, dismiss: dismissInstall } = useInstallPrompt();

  const activePrinter = printers.find((p) => p.id === draft.printerId);
  const wattage = activePrinter?.wattage ?? draft.manualWattage;
  const purchasePrice = activePrinter?.purchasePrice ?? draft.manualPurchasePrice;
  const lifetimeHours = activePrinter?.lifetimeHours ?? draft.manualLifetimeHours;

  const totalMaterialCost = draft.draftMaterials.reduce((sum, dm) => {
    const mat = materials.find((m) => m.id === dm.materialId);
    if (draft.printerType === "FDM") {
      const pricePerKg = mat?.pricePerKg ?? dm.manualMaterialPrice;
      return sum + (dm.filamentUsedGrams * pricePerKg) / 1000;
    } else {
      const pricePerLitre = mat?.pricePerLitre ?? dm.manualMaterialPrice;
      return sum + (dm.resinUsedMl * pricePerLitre) / 1000;
    }
  }, 0);

  const result = calc({
    materialCost: totalMaterialCost,
    printTimeMinutes: draft.printTimeMinutes,
    wattage,
    electricityRate: draft.electricityRate,
    purchasePrice,
    lifetimeHours,
    labourEnabled: draft.labourEnabled,
    labourTimeMinutes: draft.labourTimeMinutes,
    labourRate: settings.labourRate,
    failureRate: draft.failureRate,
    pricingMode: draft.pricingMode,
    markupOrMargin: draft.markupOrMargin,
  });

  function handleNewJob() {
    const defaultPrinter = printers.find((p) => p.id === settings.defaultPrinterId);
    draft.resetDraft();
    draft.patch({
      electricityRate: settings.electricityRate,
      failureRate: settings.defaultFailureRate,
      pricingMode: settings.pricingMode,
      markupOrMargin: settings.defaultMarkup,
      printerId: settings.defaultPrinterId ?? "",
      printerType: defaultPrinter?.type ?? "FDM",
      draftMaterials: [{
        id: "mat-0",
        materialId: settings.defaultMaterialId ?? "",
        manualMaterialPrice: 25,
        filamentUsedGrams: 0,
        resinUsedMl: 0,
      }],
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const now = new Date().toISOString();

      const jobMaterials = draft.draftMaterials.map((dm) => {
        const mat = materials.find((m) => m.id === dm.materialId);
        const name = mat?.name ?? "Custom";
        const pricePerUnit = mat
          ? (draft.printerType === "FDM" ? mat.pricePerKg : mat.pricePerLitre)
          : dm.manualMaterialPrice;
        const cost = draft.printerType === "FDM"
          ? (dm.filamentUsedGrams * (mat?.pricePerKg ?? dm.manualMaterialPrice)) / 1000
          : (dm.resinUsedMl * (mat?.pricePerLitre ?? dm.manualMaterialPrice)) / 1000;
        return {
          materialId: mat?.id,
          materialName: name,
          filamentUsedGrams: draft.printerType === "FDM" ? dm.filamentUsedGrams : undefined,
          resinUsedMl: draft.printerType === "Resin" ? dm.resinUsedMl : undefined,
          materialCost: cost,
          pricePerUnit,
        };
      });

      const materialName = jobMaterials.map((m) => m.materialName).join(", ");
      const firstMat = jobMaterials[0];

      await db.jobs.add({
        id: crypto.randomUUID(),
        name: draft.jobName || `Print ${new Date().toLocaleDateString("en-GB")}`,
        date: now.slice(0, 10),
        printerType: draft.printerType,
        printerId: activePrinter?.id,
        printerName: activePrinter?.name ?? "Manual",
        materialId: firstMat?.materialId,
        materialName,
        filamentUsedGrams: draft.printerType === "FDM"
          ? draft.draftMaterials.reduce((s, m) => s + m.filamentUsedGrams, 0)
          : undefined,
        resinUsedMl: draft.printerType === "Resin"
          ? draft.draftMaterials.reduce((s, m) => s + m.resinUsedMl, 0)
          : undefined,
        jobMaterials,
        printTimeMinutes: draft.printTimeMinutes,
        failureRate: draft.failureRate,
        labourEnabled: draft.labourEnabled,
        labourTimeMinutes: draft.labourEnabled ? draft.labourTimeMinutes : undefined,
        labourRate: draft.labourEnabled ? settings.labourRate : undefined,
        materialCost: result.materialCost,
        electricityCost: result.electricityCost,
        depreciationCost: result.depreciationCost,
        labourCost: result.labourCost,
        wasteCost: result.wasteCost,
        totalCost: result.totalCost,
        markup: result.markup,
        sellingPrice: result.sellingPrice,
        grossMarginPct: result.grossMarginPct,
        notes: draft.notes || undefined,
        createdAt: now,
      });
      showToast("Job saved!");
    } catch {
      showToast("Failed to save job", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismiss} />}

      <div className="min-h-screen bg-slate-900 pb-20">
        {/* App header */}
        <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AppIcon />
              <span className="font-semibold text-slate-50">3D Print Cost</span>
            </div>
            <button
              type="button"
              onClick={handleNewJob}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-action text-action text-sm font-medium hover:bg-action/10 transition-colors"
            >
              <PlusIcon />
              New job
            </button>
          </div>
        </header>

        {canInstall && (
          <div className="max-w-xl mx-auto px-4 pt-3">
            <div className="flex items-center justify-between gap-3 bg-indigo-950/60 border border-indigo-700/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg" aria-hidden="true">📲</span>
                <p className="text-sm text-indigo-200 leading-snug">Install app for offline access</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={install}
                  className="text-sm font-semibold text-indigo-300 hover:text-indigo-100 transition-colors px-2 py-1"
                >
                  Install
                </button>
                <button
                  onClick={dismissInstall}
                  className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                  aria-label="Dismiss install prompt"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-3">
          <JobInfoSection
            jobName={draft.jobName}
            printerType={draft.printerType}
            onJobNameChange={(v) => draft.patch({ jobName: v })}
            onPrinterTypeChange={(v) => draft.patch({
              printerType: v,
              printerId: "",
              draftMaterials: [createDraftMaterial()],
            })}
          />

          <PrinterSection
            printerType={draft.printerType}
            printers={printers}
            printerId={draft.printerId}
            manualWattage={draft.manualWattage}
            manualPurchasePrice={draft.manualPurchasePrice}
            manualLifetimeHours={draft.manualLifetimeHours}
            electricityRate={draft.electricityRate}
            onPrinterIdChange={(v) => draft.patch({ printerId: v })}
            onManualWattageChange={(v) => draft.patch({ manualWattage: v })}
            onManualPurchasePriceChange={(v) => draft.patch({ manualPurchasePrice: v })}
            onManualLifetimeHoursChange={(v) => draft.patch({ manualLifetimeHours: v })}
            onElectricityRateChange={(v) => draft.patch({ electricityRate: v })}
          />

          <MaterialSection
            printerType={draft.printerType}
            materials={materials}
            draftMaterials={draft.draftMaterials}
            onDraftMaterialsChange={(v) => draft.patch({ draftMaterials: v })}
          />

          <PrintDetailsSection
            printTimeMinutes={draft.printTimeMinutes}
            failureRate={draft.failureRate}
            onPrintTimeChange={(v) => draft.patch({ printTimeMinutes: v })}
            onFailureRateChange={(v) => draft.patch({ failureRate: v })}
          />

          <LabourSection
            labourEnabled={draft.labourEnabled}
            labourTimeMinutes={draft.labourTimeMinutes}
            settingsLabourRate={settings.labourRate}
            onLabourEnabledChange={(v) => draft.patch({ labourEnabled: v })}
            onLabourTimeChange={(v) => draft.patch({ labourTimeMinutes: v })}
          />

          <PricingSection
            pricingMode={draft.pricingMode}
            markupOrMargin={draft.markupOrMargin}
            onPricingModeChange={(v) => draft.patch({ pricingMode: v })}
            onMarkupOrMarginChange={(v) => draft.patch({ markupOrMargin: v })}
          />

          <CostCard
            result={result}
            pricingMode={draft.pricingMode}
            labourEnabled={draft.labourEnabled}
            onSave={handleSave}
            saving={saving}
          />
        </main>
      </div>
    </>
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

function AppIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <polygon points="32,38 54,26 32,50 10,38" fill="#312e81" />
      <polygon points="10,24 32,36 32,50 10,38" fill="#4338ca" />
      <polygon points="54,24 32,36 32,50 54,38" fill="#6366f1" />
      <polygon points="32,14 54,24 32,36 10,24" fill="#818cf8" />
      <polygon points="32,20 48,28 32,36 16,28" fill="#a5b4fc" opacity="0.35" />
    </svg>
  );
}
