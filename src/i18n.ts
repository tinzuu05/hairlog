export type Lang = "zh" | "en";

export const LANG_STORAGE_KEY = "hairlog-lang";

export const translations = {
  zh: {
    appSubtitle: "掉髮健康紀錄",
    title: "HairLog",
    heroText: "記錄白天、洗髮與吹髮掉髮數，自動統計每日總量、平均值與趨勢。離線時存本機，登入後可同步雲端。",
    storageChecking: "正在確認資料儲存狀態…",
    cloudNotLoggedIn: "雲端狀態：尚未登入",
    login: "Google 登入同步",
    syncNow: "立即同步",
    logout: "登出",
    todayTotal: "今日總數",

    todayRecord: "今日紀錄",
    overwriteHint: "重新輸入同一天會覆蓋原本資料。",
    date: "日期",
    daytime: "白天掉髮數",
    washing: "洗髮掉髮數",
    drying: "吹髮掉髮數",
    daytimePlaceholder: "例如 12",
    washingPlaceholder: "例如 19",
    dryingPlaceholder: "例如 103",
    note: "備註",
    notePlaceholder: "壓力、睡眠、月經、用藥、是否洗頭等",
    dailyTotal: "本日總數",
    save: "儲存紀錄",

    avg7: "7 日平均",
    avg14: "14 日平均",
    avg30: "30 日平均",
    perDay: "根 / 日",
    trend: "最近趨勢",
    noEnoughData: "資料不足",

    chartTitle: "掉髮趨勢",
    chartDesc: "每日總量與三種來源分類曲線。",
    range7: "7 日",
    range14: "14 日",
    range30: "30 日",

    records: "歷史紀錄",
    recordsDesc: "可匯出 CSV 給自己備份或給醫師參考。",
    exportCsv: "匯出 CSV",
    emptyState: "尚無紀錄。先新增今天的掉髮量吧。",

    total: "總數",
    cloudSyncing: "雲端狀態：同步中…",
    cloudSynced: "雲端：已同步",
    delete: "刪除",
    noteLabel: "備註",
    cloudLoggedIn: "雲端狀態：已登入",
    syncDone: "雲端狀態：同步完成，共",
    recordsUnit: "筆",
    storagePersisted: "資料儲存狀態：已啟用持久儲存，降低被瀏覽器自動清除的機率。",
    firebaseNotConfigured: "雲端狀態：Firebase 尚未設定",
    stable: "穩定",
    up: "上升",
    down: "下降",
    unknown: "—",

    unitHair: "根",
    needSixRecords: "至少需要 6 筆資料",
    legendTotal: "總數",
    legendDaytime: "白天",
    legendWashing: "洗髮",
    legendDrying: "吹髮",
    storageNotPersisted: "資料儲存狀態：尚未啟用持久儲存，資料仍會保存在本機。",
    cloudSyncedCount: "雲端狀態：同步完成，共",
    recordDaytime: "白天",
    recordWashing: "洗髮",
    recordDrying: "吹髮",
    cloudLocalOnly: "雲端：尚未同步",
  },

  en: {
    appSubtitle: "Hair wellness journal",
    title: "HairLog Nordic",
    heroText: "Track daytime, washing, and blow-drying hair loss. Automatically calculate totals, averages, and trends. Data is stored offline first and can sync to the cloud after sign-in.",
    storageChecking: "Checking storage status…",
    cloudNotLoggedIn: "Cloud status: Not signed in",
    login: "Sign in with Google",
    syncNow: "Sync now",
    logout: "Sign out",
    todayTotal: "Today total",

    todayRecord: "Today’s Record",
    overwriteHint: "Entering the same date again will overwrite the previous record.",
    date: "Date",
    daytime: "Daytime loss",
    washing: "Washing loss",
    drying: "Blow-drying loss",
    daytimePlaceholder: "e.g. 12",
    washingPlaceholder: "e.g. 19",
    dryingPlaceholder: "e.g. 103",
    note: "Notes",
    notePlaceholder: "Stress, sleep, period, medication, wash day, etc.",
    dailyTotal: "Daily total",
    save: "Save record",

    avg7: "7-day avg",
    avg14: "14-day avg",
    avg30: "30-day avg",
    perDay: "hairs / day",
    trend: "Recent trend",
    noEnoughData: "Not enough data",

    chartTitle: "Hair Loss Trend",
    chartDesc: "Daily total and category trends.",
    range7: "7 days",
    range14: "14 days",
    range30: "30 days",

    records: "History",
    recordsDesc: "Export CSV for backup or doctor reference.",
    exportCsv: "Export CSV",
    emptyState: "No records yet. Add today’s hair loss count first.",

    total: "Total",
    cloudSyncing: "Cloud status: Syncing…",
    cloudSynced: "Cloud: Synced",
    delete: "Delete",
    noteLabel: "Note",
    cloudLoggedIn: "Cloud status: Signed in",
    syncDone: "Cloud status: Sync complete,",
    recordsUnit: "records",
    storagePersisted: "Storage status: Persistent storage is enabled, reducing the chance of browser auto-cleanup.",
    firebaseNotConfigured: "Cloud status: Firebase is not configured",
    stable: "Stable",
    up: "Rising",
    down: "Falling",
    unknown: "—",

    unitHair: "hairs",
    needSixRecords: "At least 6 records needed",
    legendTotal: "Total",
    legendDaytime: "Daytime",
    legendWashing: "Washing",
    legendDrying: "Blow-drying",

    storageNotPersisted: "Storage status: Persistent storage is not enabled yet. Data is still saved locally.",
    cloudSyncedCount: "Cloud status: Sync complete,",
    recordDaytime: "Daytime",
    recordWashing: "Washing",
    recordDrying: "Blow-drying",
    cloudLocalOnly: "Cloud: Not synced",
  }
} as const;

export function getInitialLang(): Lang {
  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  if (saved === "zh" || saved === "en") return saved;

  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function setLang(lang: Lang): void {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
}