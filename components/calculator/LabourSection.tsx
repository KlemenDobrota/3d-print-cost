"use client";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { TimeInput } from "@/components/ui/TimeInput";

interface LabourSectionProps {
  labourEnabled: boolean;
  labourTimeMinutes: number;
  settingsLabourRate: number;
  onLabourEnabledChange: (v: boolean) => void;
  onLabourTimeChange: (v: number) => void;
}

export function LabourSection({
  labourEnabled,
  labourTimeMinutes,
  settingsLabourRate,
  onLabourEnabledChange,
  onLabourTimeChange,
}: LabourSectionProps) {
  return (
    <section className="bg-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LabourIcon />
          <h2 className="text-sm font-semibold text-slate-200">Labour</h2>
        </div>
        <ToggleSwitch checked={labourEnabled} onChange={onLabourEnabledChange} />
      </div>

      {labourEnabled && (
        <>
          <TimeInput
            label="Labour time"
            valueMinutes={labourTimeMinutes}
            onChange={onLabourTimeChange}
          />
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-700">
            <span className="text-sm text-slate-400">Rate</span>
            <span className="text-sm text-slate-200 tabular">
              €{settingsLabourRate.toFixed(2)}<span className="text-slate-500 ml-1">/hr · from settings</span>
            </span>
          </div>
        </>
      )}
    </section>
  );
}

function LabourIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
    </svg>
  );
}
