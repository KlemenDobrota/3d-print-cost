"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/types";
import { useCalculatorStore } from "@/hooks/useCalculatorStore";
import { db } from "@/lib/db";
import { cn } from "@/components/ui/cn";

function safeNum(n: unknown): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

const COST_COLORS = {
  material: "#00d4b4",
  electricity: "#f59e0b",
  depreciation: "#64748b",
  labour: "#22c55e",
  waste: "#ef4444",
};

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const patch = useCalculatorStore((s) => s.patch);

  const dateStr = new Date(job.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  function handleClone() {
    patch({
      jobName: job.name,
      printerType: job.printerType,
      printerId: job.printerId ?? "",
      materialId: job.materialId ?? "",
      filamentUsedGrams: job.filamentUsedGrams ?? 0,
      resinUsedMl: job.resinUsedMl ?? 0,
      printTimeMinutes: job.printTimeMinutes,
      failureRate: job.failureRate,
      labourEnabled: job.labourEnabled,
      labourTimeMinutes: job.labourTimeMinutes ?? 0,
      pricingMode: "markup",
      markupOrMargin: job.markup,
    });
    router.push("/");
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await db.jobs.delete(job.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const breakdownRows = [
    { label: "Material", value: safeNum(job.materialCost), color: COST_COLORS.material },
    { label: "Electricity", value: safeNum(job.electricityCost), color: COST_COLORS.electricity },
    { label: "Depreciation", value: safeNum(job.depreciationCost), color: COST_COLORS.depreciation },
    ...(job.labourEnabled ? [{ label: "Labour", value: safeNum(job.labourCost), color: COST_COLORS.labour }] : []),
    { label: "Waste buffer", value: safeNum(job.wasteCost), color: COST_COLORS.waste },
  ];
  const breakdownTotal = breakdownRows.reduce((s, r) => s + r.value, 0);

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Collapsed header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-4 pt-4 pb-3 flex flex-col gap-2"
        aria-expanded={expanded}
      >
        {/* Row 1: name + date */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-slate-50 leading-snug">{job.name}</span>
          <span className="text-xs text-slate-400 flex-shrink-0 pt-0.5">{dateStr}</span>
        </div>
        {/* Row 2: badge + printer/material + selling price + chevron */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                job.printerType === "FDM"
                  ? "bg-indigo-900 text-indigo-300"
                  : "bg-amber-900 text-amber-300"
              )}
            >
              {job.printerType}
            </span>
            <span className="text-xs text-slate-400 truncate">
              {job.printerName} · {job.materialName}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-slate-400 leading-none mb-0.5">Sell</p>
              <p className="text-sm font-semibold text-slate-50 tabular-nums">
                €{safeNum(job.sellingPrice).toFixed(2)}
              </p>
            </div>
            <ChevronIcon expanded={expanded} />
          </div>
        </div>
      </button>

      {/* Expanded section */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-4 border-t border-slate-700 pt-3">
          {/* Cost summary */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Total cost</p>
              <p className="text-2xl font-semibold text-slate-50 tabular-nums">
                €{safeNum(job.totalCost).toFixed(2)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 bg-green-900/40 border border-green-800/50 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              {safeNum(job.grossMarginPct).toFixed(0)}% margin
            </span>
          </div>

          {/* Cost breakdown */}
          <div className="flex flex-col gap-2.5">
            {breakdownRows.map((row) => {
              const rawPct = breakdownTotal > 0.001 ? (row.value / breakdownTotal) * 100 : 0;
              const pct = Math.min(Math.max(safeNum(rawPct), 0), 100);
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">{row.label}</span>
                    <span className="text-xs font-medium text-slate-200 tabular-nums">
                      €{row.value.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: row.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Print details grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {job.filamentUsedGrams != null && (
              <Detail label="Filament" value={`${job.filamentUsedGrams} g`} />
            )}
            {job.resinUsedMl != null && (
              <Detail label="Resin" value={`${job.resinUsedMl} mL`} />
            )}
            <Detail label="Print time" value={formatMinutes(job.printTimeMinutes)} />
            <Detail label="Failure rate" value={`${job.failureRate}%`} />
            {job.labourEnabled && job.labourTimeMinutes != null && (
              <Detail label="Labour time" value={formatMinutes(job.labourTimeMinutes)} />
            )}
          </div>

          {/* Notes */}
          {job.notes && (
            <p className="text-xs text-slate-400 italic border-t border-slate-700 pt-3">
              {job.notes}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClone}
              className="flex-1 flex items-center justify-center gap-1.5 bg-action hover:bg-action-hover text-slate-900 text-sm font-semibold rounded-xl py-2.5 transition-colors"
            >
              <CloneIcon />
              Clone to calculator
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={cn(
                "flex items-center justify-center gap-1.5 text-sm font-semibold rounded-xl py-2.5 px-3 transition-colors disabled:opacity-60",
                confirmDelete
                  ? "bg-red-600 hover:bg-red-500 text-white flex-1"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-300"
              )}
            >
              <TrashIcon />
              {confirmDelete ? "Confirm delete" : "Delete"}
            </button>
            {confirmDelete && (
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-semibold rounded-xl py-2.5 px-3 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="text-slate-200 font-medium">{value}</p>
    </div>
  );
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn(
        "text-slate-400 transition-transform duration-200",
        expanded ? "rotate-180" : ""
      )}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CloneIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
