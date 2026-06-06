"use client";
import { useState } from "react";
import { useMaterials } from "@/hooks/useMaterials";
import { db } from "@/lib/db";
import { MaterialForm } from "@/components/settings/MaterialForm";
import { cn } from "@/components/ui/cn";
import type { Material } from "@/types";

type View = "list" | "add" | { edit: Material };
type Filter = "all" | "FDM" | "Resin";

export function MaterialsTab() {
  const materials = useMaterials();
  const [view, setView] = useState<View>("list");
  const [filter, setFilter] = useState<Filter>("all");

  if (view === "add") {
    return <MaterialForm onDone={() => setView("list")} />;
  }
  if (typeof view === "object" && "edit" in view) {
    return <MaterialForm initial={view.edit} onDone={() => setView("list")} />;
  }

  const filtered =
    filter === "all" ? materials : materials.filter((m) => m.type === filter);

  return (
    <div className="flex flex-col gap-3">
      {/* Filter pills */}
      <div className="flex gap-2">
        {(["all", "FDM", "Resin"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors",
              filter === f
                ? "bg-action text-slate-900"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
            )}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 && materials.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          No materials yet — add one to use in calculations
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">
          No {filter} materials
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((m) => (
            <MaterialRow key={m.id} material={m} onEdit={() => setView({ edit: m })} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setView("add")}
        className="flex items-center justify-center gap-2 w-full h-12 bg-action hover:bg-action-hover text-slate-900 text-sm font-semibold rounded-xl transition-colors"
      >
        <PlusIcon />
        Add material
      </button>
    </div>
  );
}

function MaterialRow({ material: m, onEdit }: { material: Material; onEdit: () => void }) {
  const [confirm, setConfirm] = useState(false);

  const price =
    m.type === "FDM"
      ? `€${m.pricePerKg?.toFixed(2) ?? "—"}/kg`
      : `€${m.pricePerLitre?.toFixed(2) ?? "—"}/L`;

  async function handleDelete() {
    if (!confirm) { setConfirm(true); return; }
    await db.materials.delete(m.id);
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 flex items-stretch overflow-hidden">
      <button
        type="button"
        onClick={onEdit}
        className="flex-1 px-4 py-3 text-left min-w-0"
        aria-label={`Edit ${m.name}`}
      >
        <p className="text-sm font-semibold text-slate-50 mb-1 truncate">{m.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
              m.type === "FDM"
                ? "bg-indigo-900 text-indigo-300"
                : "bg-amber-900 text-amber-300"
            )}
          >
            {m.type}
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 flex-shrink-0">
            {m.material}
          </span>
          <span className="text-xs text-slate-400 tabular-nums">{price}</span>
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
            aria-label="Delete material"
          >
            <TrashIcon />
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center text-slate-500"
          aria-label="Edit material"
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
