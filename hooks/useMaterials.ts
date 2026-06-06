"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Material } from "@/types";

export function useMaterials(): Material[] {
  return useLiveQuery(() => db.materials.orderBy("createdAt").toArray()) ?? [];
}
