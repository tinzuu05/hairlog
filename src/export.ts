import type { HairRecord } from "./types";
import { toISODate } from "./stats";

export function exportCSV(records: HairRecord[]): void {
  if (records.length === 0) {
    alert("目前沒有資料可以匯出。");
    return;
  }

  const header: Array<keyof HairRecord> = ["date", "daytime", "washing", "drying", "total", "note"];
  const rows = records.map((record) =>
    header.map((key) => `"${String(record[key] ?? "").replaceAll('"', '""')}"`).join(",")
  );

  const csv = "\ufeff" + [header.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `hairlog-${toISODate()}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
