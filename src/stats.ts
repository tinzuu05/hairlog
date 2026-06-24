import type { HairRecord, Trend } from "./types";

export function average(records: HairRecord[], days: number): number {
  const slice = records.slice(-days);
  if (slice.length === 0) return 0;

  const sum = slice.reduce((acc, record) => acc + record.total, 0);
  return Math.round(sum / slice.length);
}

export function getTrend(records: HairRecord[]): Trend {
  if (records.length < 6) {
    return { label: "unknown", hint: "needSixRecords" };
  }

  const recent = records.slice(-3);
  const previous = records.slice(-6, -3);

  const recentAvg = average(recent, 3);
  const previousAvg = average(previous, 3);

  const diff = recentAvg - previousAvg;

  if (Math.abs(diff) < 15) {
    return { label: "stable", hint: "trendStable" };
  }

  if (diff > 0) {
    return { label: "up", hint: "trendUp" };
  }

  return { label: "down", hint: "trendDown" };
}

export function toISODate(date = new Date()): string {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

export function formatShortDate(dateString: string): string {
  const [, month, day] = dateString.split("-");
  return `${Number(month)}/${Number(day)}`;
}

export function makeRecordId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
