"use client";
import { TogglePill } from "@/components/ui/TogglePill";

interface JobInfoSectionProps {
  jobName: string;
  printerType: "FDM" | "Resin";
  onJobNameChange: (v: string) => void;
  onPrinterTypeChange: (v: "FDM" | "Resin") => void;
}

const TYPE_OPTIONS = [
  { label: "FDM", value: "FDM" as const },
  { label: "Resin", value: "Resin" as const },
];

export function JobInfoSection({ jobName, printerType, onJobNameChange, onPrinterTypeChange }: JobInfoSectionProps) {
  return (
    <section className="bg-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <JobIcon />
        <h2 className="text-sm font-semibold text-slate-200">Job</h2>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="job-name" className="text-sm text-slate-400">Job name</label>
          <span className="text-xs text-slate-500">optional</span>
        </div>
        <input
          id="job-name"
          type="text"
          value={jobName}
          onChange={(e) => onJobNameChange(e.target.value)}
          placeholder="e.g. Vase for customer A"
          className="h-12 w-full rounded-lg bg-slate-700 border border-slate-600 px-3 text-slate-50 placeholder:text-slate-500 text-base focus:outline-none focus:border-indigo-500"
        />
      </div>

      <TogglePill options={TYPE_OPTIONS} value={printerType} onChange={onPrinterTypeChange} />
    </section>
  );
}

function JobIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
