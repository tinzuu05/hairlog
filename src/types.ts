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
  label: "unknown" | "stable" | "up" | "down" | "-";
  hint: "needSixRecords" | "trendStable" | "trendUp" | "trendDown";
};
