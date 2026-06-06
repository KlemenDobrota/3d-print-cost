"use client";
import { useState, useMemo } from "react";
import { useJobs } from "@/hooks/useJobs";
import { JobCard } from "@/components/history/JobCard";

export default function HistoryPage() {
  const jobs = useJobs();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return jobs;
    const q = query.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        j.name.toLowerCase().includes(q) ||
        j.printerName.toLowerCase().includes(q) ||
        j.materialName.toLowerCase().includes(q)
    );
  }, [jobs, query]);

  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 max-w-xl mx-auto">
        <h1 className="text-base font-semibold text-slate-50">History</h1>
      </header>

      <main className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <SearchIcon />
          <input
            type="search"
            placeholder="Search jobs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 text-slate-50 placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* States */}
        {jobs.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No jobs match &ldquo;{query}&rdquo;
          </p>
        ) : (
          <>
            <p className="text-xs text-slate-500">
              {filtered.length} job{filtered.length !== 1 ? "s" : ""}
            </p>
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-500"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <p className="text-slate-300 font-medium">No saved jobs yet</p>
      <p className="text-sm text-slate-500">Save your first print job from the calculator</p>
    </div>
  );
}

function SearchIcon() {
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
      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
