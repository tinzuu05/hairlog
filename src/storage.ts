import { openDB, type DBSchema } from "idb";
import type { HairRecord } from "./types";

interface HairLogDB extends DBSchema {
  records: {
    key: string;
    value: HairRecord;
    indexes: { "by-date": string; };
  };
  meta: {
    key: string;
    value: { key: string; value: string; updatedAt: string; };
  };
}

const DB_NAME = "hairlog-v1-2";
const DB_VERSION = 1;

const dbPromise = openDB<HairLogDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    const store = db.createObjectStore("records", { keyPath: "id" });
    store.createIndex("by-date", "date", { unique: true });
    db.createObjectStore("meta", { keyPath: "key" });
  }
});

export async function getRecords(): Promise<HairRecord[]> {
  const db = await dbPromise;
  const records = await db.getAllFromIndex("records", "by-date");
  return records.sort((a, b) => a.date.localeCompare(b.date));
}

export async function upsertRecord(record: HairRecord): Promise<void> {
  const db = await dbPromise;
  const tx = db.transaction(["records", "meta"], "readwrite");
  const index = tx.objectStore("records").index("by-date");
  const existingKey = await index.getKey(record.date);

  if (existingKey) {
    const existing = await tx.objectStore("records").get(existingKey);
    await tx.objectStore("records").put({
      ...existing,
      ...record,
      id: String(existingKey),
      createdAt: existing?.createdAt ?? record.createdAt,
      updatedAt: record.updatedAt || new Date().toISOString()
    });
  } else {
    await tx.objectStore("records").put(record);
  }

  await tx.objectStore("meta").put({
    key: "lastSavedAt",
    value: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  await tx.done;
}

export async function upsertMany(records: HairRecord[]): Promise<void> {
  for (const record of records) {
    await upsertRecord(record);
  }
}

export async function deleteRecord(id: string): Promise<void> {
  const db = await dbPromise;
  await db.delete("records", id);
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (!("storage" in navigator)) return false;
  const storageManager = navigator.storage;
  if (!("persisted" in storageManager) || !("persist" in storageManager)) return false;
  const alreadyPersisted = await storageManager.persisted();
  if (alreadyPersisted) return true;
  return storageManager.persist();
}

export async function getStorageStatus(): Promise<{ persisted: boolean; usageMB: number | null; quotaMB: number | null; }> {
  let persisted = false;
  let usageMB: number | null = null;
  let quotaMB: number | null = null;

  if ("storage" in navigator) {
    const storageManager = navigator.storage;
    if ("persisted" in storageManager) persisted = await storageManager.persisted();
    if ("estimate" in storageManager) {
      const estimate = await storageManager.estimate();
      usageMB = estimate.usage ? Math.round((estimate.usage / 1024 / 1024) * 10) / 10 : 0;
      quotaMB = estimate.quota ? Math.round((estimate.quota / 1024 / 1024) * 10) / 10 : null;
    }
  }

  return { persisted, usageMB, quotaMB };
}
