"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import type { Settings } from "@/types";

export function useSettings(): Settings {
  const s = useLiveQuery(() => db.settings.get("default"));
  return s ?? { id: "default", ...DEFAULT_SETTINGS };
}
