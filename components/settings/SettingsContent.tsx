"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PrintersTab } from "@/components/settings/tabs/PrintersTab";
import { MaterialsTab } from "@/components/settings/tabs/MaterialsTab";
import { DefaultsTab } from "@/components/settings/tabs/DefaultsTab";
import { DataTab } from "@/components/settings/tabs/DataTab";
import { cn } from "@/components/ui/cn";

type Tab = "printers" | "materials" | "defaults" | "data";

const ALL_TABS: { id: Tab; label: string }[] = [
  { id: "printers", label: "Printers" },
  { id: "materials", label: "Materials" },
  { id: "defaults", label: "Defaults" },
  { id: "data", label: "Data" },
];

export function SettingsContent() {
  const searchParams = useSearchParams();
  const initial = (searchParams.get("tab") as Tab | null) ?? "printers";
  const [activeTab, setActiveTab] = useState<Tab>(
    ALL_TABS.some((t) => t.id === initial) ? initial : "printers"
  );

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-xl mx-auto px-4 pt-3 pb-2">
          <h1 className="text-base font-semibold text-slate-50">Settings</h1>
        </div>
        <div className="max-w-xl mx-auto px-3 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {ALL_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-action text-slate-900"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-4">
        {activeTab === "printers" && <PrintersTab />}
        {activeTab === "materials" && <MaterialsTab />}
        {activeTab === "defaults" && <DefaultsTab />}
        {activeTab === "data" && <DataTab />}
      </main>
    </div>
  );
}
