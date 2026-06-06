"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Printer } from "@/types";

export function usePrinters(): Printer[] {
  return useLiveQuery(() => db.printers.orderBy("createdAt").toArray()) ?? [];
}
