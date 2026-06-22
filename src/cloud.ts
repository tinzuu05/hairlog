import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  type DocumentData
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User
} from "firebase/auth";
import type { HairRecord } from "./types";
import { getFirebaseAuth, getFirebaseDB, googleProvider, isFirebaseConfigured } from "./firebase";

export function watchAuth(callback: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function loginWithGoogle(): Promise<void> {
  await signInWithPopup(getFirebaseAuth(), googleProvider);
}

export async function logout(): Promise<void> {
  await signOut(getFirebaseAuth());
}

function getUserRecordsCollection(user: User) {
  return collection(getFirebaseDB(), "users", user.uid, "hairRecords");
}

function getUserRecordDoc(user: User, recordId: string) {
  return doc(getFirebaseDB(), "users", user.uid, "hairRecords", recordId);
}

function normalizeRecord(data: DocumentData): HairRecord {
  return {
    id: String(data.id),
    date: String(data.date),
    daytime: Number(data.daytime ?? 0),
    washing: Number(data.washing ?? 0),
    drying: Number(data.drying ?? 0),
    total: Number(data.total ?? 0),
    note: String(data.note ?? ""),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
    syncedAt: data.syncedAt ? String(data.syncedAt) : undefined
  };
}

export async function uploadRecordToCloud(user: User, record: HairRecord): Promise<void> {
  await setDoc(
    getUserRecordDoc(user, record.id),
    {
      ...record,
      ownerUid: user.uid,
      syncedAt: new Date().toISOString(),
      serverUpdatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

export async function uploadRecordsToCloud(user: User, records: HairRecord[]): Promise<number> {
  for (const record of records) {
    await uploadRecordToCloud(user, record);
  }
  return records.length;
}

export async function fetchCloudRecords(user: User): Promise<HairRecord[]> {
  const snapshot = await getDocs(getUserRecordsCollection(user));
  return snapshot.docs.map((item) => normalizeRecord(item.data()));
}

export async function deleteCloudRecord(user: User, recordId: string): Promise<void> {
  await deleteDoc(getUserRecordDoc(user, recordId));
}
