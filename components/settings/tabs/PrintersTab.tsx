"use client";
import { useState } from "react";
import { usePrinters } from "@/hooks/usePrinters";
import { db } from "@/lib/db";
import { PrinterForm } from "@/components/settings/PrinterForm";
import { cn } from "@/components/ui/cn";
import type { Printer } from "@/types";

type View = "list" | "add" | { edit: Printer };

export function PrintersTab() {
  const printers = usePrinters();
  const [view, setView] = useState<View>("list");

  if (view === "add") {
    return <PrinterForm onDone={() => setView("list")} />;
  }
  if (typeof view === "object" && "edit" in view) {
    return <PrinterForm initial={view.edit} onDone={() => setView("list")} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {printers.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          No printers yet — add one to use in calculations
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {printers.map((p) => (
            <PrinterRow key={p.id} printer={p} onEdit={() => setView({ edit: p })} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setView("add")}
        className="flex items-center justify-center gap-2 w-full h-12 bg-action hover:bg-action-hover text-slate-900 text-sm font-semibold rounded-xl transition-colors"
      >
        <PlusIcon />
        Add printer
      </button>
    </div>
  );
}

function PrinterRow({ printer, onEdit }: { printer: Printer; onEdit: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const depreciationPerHr =
    printer.lifetimeHours > 0 ? printer.purchasePrice / printer.lifetimeHours : 0;

  async function handleDelete() {
    if (!confirm) { setConfirm(true); return; }
    await db.printers.delete(printer.id);
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 flex items-stretch overflow-hidden">
      <button
        type="button"
        onClick={onEdit}
        className="flex-1 px-4 py-3 text-left min-w-0"
        aria-label={`Edit ${printer.name}`}
      >
        <p className="text-sm font-semibold text-slate-50 mb-1 truncate">{printer.name}</p>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
              printer.type === "FDM"
                ? "bg-indigo-900 text-indigo-300"
                : "bg-amber-900 text-amber-300"
            )}
          >
            {printer.type}
          </span>
          <span className="text-xs text-slate-400 tabular-nums">
            {printer.wattage} W · dep. €{depreciationPerHr.toFixed(2)}/hr
          </span>
        </div>
      </button>

      <div className="flex items-center px-2 gap-0.5 flex-shrink-0">
        {confirm ? (
          <>
            <button
              type="button"
              onClick={handleDelete}
              className="h-8 px-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Delete?
            </button>
            <button
              type="button"
              onClick={() => setConfirm(false)}
              className="w-7 h-8 flex items-center justify-center text-slate-400 hover:text-slate-200 text-xs"
            >
              ✕
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleDelete}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors"
            aria-label="Delete printer"
          >
            <TrashIcon />
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center text-slate-500"
          aria-label="Edit printer"
          tabIndex={-1}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
