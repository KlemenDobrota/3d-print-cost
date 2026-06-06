"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Job } from "@/types";

export function useJobs(): Job[] {
  return useLiveQuery(() => db.jobs.orderBy("date").reverse().toArray()) ?? [];
}
