// Client-only module — only import from files with "use client" or hooks.
// IndexedDB is not available on the server; instantiation here is intentionally
// deferred until actual browser-side use via useLiveQuery / await.
import Dexie, { type Table } from "dexie";
import type { Printer, Material, Job, Settings } from "@/types";

class PrintCostDB extends Dexie {
  printers!: Table<Printer>;
  materials!: Table<Material>;
  jobs!: Table<Job>;
  settings!: Table<Settings>;

  constructor() {
    super("PrintCostDB");
    this.version(1).stores({
      printers: "id, type, createdAt",
      materials: "id, type, material, createdAt",
      jobs: "id, date, printerType, createdAt",
      settings: "id",
    });
  }
}

export const db = new PrintCostDB();
