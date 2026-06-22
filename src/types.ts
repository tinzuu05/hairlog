export type HairRecord = {
  id: string;
  date: string;
  daytime: number;
  washing: number;
  drying: number;
  total: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
};

export type Trend = {
  label: "上升" | "下降" | "穩定" | "—";
  hint: string;
};
