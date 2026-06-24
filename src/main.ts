import Chart from "chart.js/auto";
import type { User } from "firebase/auth";
import { deleteRecord, getRecords, getStorageStatus, requestPersistentStorage, upsertMany, upsertRecord } from "./storage";
import { exportCSV } from "./export";
import { average, formatShortDate, getTrend, makeRecordId, toISODate } from "./stats";
import type { HairRecord } from "./types";
import { deleteCloudRecord, fetchCloudRecords, loginWithGoogle, logout, uploadRecordToCloud, uploadRecordsToCloud, watchAuth } from "./cloud";
import { isFirebaseConfigured } from "./firebase";
import "./styles.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="app-shell">
    <header class="hero">
      <div>
        <p class="eyebrow">Hair wellness journal</p>
        <h1>HairLog Nordic</h1>
        <p class="hero-text">記錄白天、洗髮與吹髮掉髮數，自動統計每日總量、平均值與趨勢。離線時存本機，登入後可同步雲端。</p>
        <div id="storageStatus" class="status-line">正在確認資料儲存狀態…</div>
        <div id="cloudStatus" class="status-line">雲端狀態：尚未登入</div>
        <div class="auth-actions">
          <button id="loginBtn" class="ghost-btn" type="button">Google 登入同步</button>
          <button id="syncBtn" class="ghost-btn" type="button">立即同步</button>
          <button id="logoutBtn" class="ghost-btn" type="button">登出</button>
        </div>
      </div>
      <div class="hero-badge">
        <span id="todayTotal">0</span>
        <small>今日總數</small>
      </div>
    </header>

    <main class="grid">
      <section class="card input-card">
        <div class="section-head"><div><h2>今日紀錄</h2><p>重新輸入同一天會覆蓋原本資料。</p></div></div>
        <form id="recordForm" class="form">
          <label>日期<input type="date" id="dateInput" required /></label>
          <div class="form-grid">
            <label>白天掉髮數<input type="number" id="daytimeInput" min="0" step="1" inputmode="numeric" placeholder="例如 12" required /></label>
            <label>洗髮掉髮數<input type="number" id="washingInput" min="0" step="1" inputmode="numeric" placeholder="例如 19" required /></label>
            <label>吹髮掉髮數<input type="number" id="dryingInput" min="0" step="1" inputmode="numeric" placeholder="例如 103" required /></label>
          </div>
          <label>備註<textarea id="noteInput" rows="3" placeholder="壓力、睡眠、月經、用藥、是否洗頭等"></textarea></label>
          <div class="live-total"><span>本日總數</span><strong id="liveTotal">0 根</strong></div>
          <button type="submit" class="primary-btn">儲存紀錄</button>
        </form>
      </section>

      <section class="stats-grid">
        <article class="stat-card"><span>7 日平均</span><strong id="avg7">0</strong><small>根 / 日</small></article>
        <article class="stat-card"><span>14 日平均</span><strong id="avg14">0</strong><small>根 / 日</small></article>
        <article class="stat-card"><span>30 日平均</span><strong id="avg30">0</strong><small>根 / 日</small></article>
        <article class="stat-card"><span>最近趨勢</span><strong id="trendText">—</strong><small id="trendHint">資料不足</small></article>
      </section>

      <section class="card chart-card">
        <div class="section-head">
          <div><h2>掉髮趨勢</h2><p>每日總量與三種來源分類曲線。</p></div>
          <div class="segmented">
            <button class="chip active" data-range="7" type="button">7 日</button>
            <button class="chip" data-range="14" type="button">14 日</button>
            <button class="chip" data-range="30" type="button">30 日</button>
          </div>
        </div>
        <div class="chart-wrap"><canvas id="hairChart"></canvas></div>
      </section>

      <section class="card records-card">
        <div class="section-head">
          <div><h2>歷史紀錄</h2><p>可匯出 CSV 給自己備份或給醫師參考。</p></div>
          <button id="exportBtn" class="ghost-btn" type="button">匯出 CSV</button>
        </div>
        <div id="emptyState" class="empty-state">尚無紀錄。先新增今天的掉髮量吧。</div>
        <div id="recordsList" class="records-list"></div>
      </section>
    </main>
  </div>
`;

const form = document.querySelector<HTMLFormElement>("#recordForm")!;
const dateInput = document.querySelector<HTMLInputElement>("#dateInput")!;
const daytimeInput = document.querySelector<HTMLInputElement>("#daytimeInput")!;
const washingInput = document.querySelector<HTMLInputElement>("#washingInput")!;
const dryingInput = document.querySelector<HTMLInputElement>("#dryingInput")!;
const noteInput = document.querySelector<HTMLTextAreaElement>("#noteInput")!;
const liveTotal = document.querySelector<HTMLElement>("#liveTotal")!;
const todayTotal = document.querySelector<HTMLElement>("#todayTotal")!;
const avg7 = document.querySelector<HTMLElement>("#avg7")!;
const avg14 = document.querySelector<HTMLElement>("#avg14")!;
const avg30 = document.querySelector<HTMLElement>("#avg30")!;
const trendText = document.querySelector<HTMLElement>("#trendText")!;
const trendHint = document.querySelector<HTMLElement>("#trendHint")!;
const recordsList = document.querySelector<HTMLElement>("#recordsList")!;
const emptyState = document.querySelector<HTMLElement>("#emptyState")!;
const exportBtn = document.querySelector<HTMLButtonElement>("#exportBtn")!;
const storageStatus = document.querySelector<HTMLElement>("#storageStatus")!;
const cloudStatus = document.querySelector<HTMLElement>("#cloudStatus")!;
const loginBtn = document.querySelector<HTMLButtonElement>("#loginBtn")!;
const syncBtn = document.querySelector<HTMLButtonElement>("#syncBtn")!;
const logoutBtn = document.querySelector<HTMLButtonElement>("#logoutBtn")!;
const rangeButtons = document.querySelectorAll<HTMLButtonElement>("[data-range]");
const chartCanvas = document.querySelector<HTMLCanvasElement>("#hairChart")!;

let activeRange = 14;
let chart: Chart | null = null;
let currentUser: User | null = null;

function getNumber(input: HTMLInputElement): number {
  const value = Number(input.value);
  return Number.isFinite(value) && value >= 0 ? Math.round(value) : 0;
}
function getCurrentTotal(): number {
  return getNumber(daytimeInput) + getNumber(washingInput) + getNumber(dryingInput);
}
function updateLiveTotal(): void { liveTotal.textContent = `${getCurrentTotal()} 根`; }
function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char] ?? char));
}
async function updateStorageStatus(): Promise<void> {
  await requestPersistentStorage();
  const status = await getStorageStatus();
  storageStatus.textContent = status.persisted
    ? "資料儲存狀態：已啟用持久儲存，降低被瀏覽器自動清除的機率。"
    : "";
}
function updateCloudStatus(text?: string): void {
  if (!isFirebaseConfigured) {
    cloudStatus.textContent = "";
    loginBtn.disabled = true; syncBtn.disabled = true; logoutBtn.disabled = true;
    return;
  }
  cloudStatus.textContent = text ?? (currentUser ? `雲端狀態：已登入 ${currentUser.email ?? ""}` : "雲端狀態：尚未登入");
  loginBtn.disabled = Boolean(currentUser);
  syncBtn.disabled = !currentUser;
  logoutBtn.disabled = !currentUser;
}
function renderStats(records: HairRecord[]): void {
  const todayRecord = records.find((record) => record.date === toISODate());
  todayTotal.textContent = String(todayRecord?.total ?? getCurrentTotal());
  avg7.textContent = String(average(records, 7));
  avg14.textContent = String(average(records, 14));
  avg30.textContent = String(average(records, 30));
  const trend = getTrend(records);
  trendText.textContent = trend.label;
  trendHint.textContent = trend.hint;
}
function renderRecords(records: HairRecord[]): void {
  emptyState.style.display = records.length ? "none" : "block";
  recordsList.innerHTML = records.slice().reverse().map((record) => `
    <article class="record-item">
      <div class="record-date">${record.date}</div>
      <div class="record-breakdown">
        白天 ${record.daytime}｜洗髮 ${record.washing}｜吹髮 ${record.drying}
        ${record.note ? `<br />備註：${escapeHTML(record.note)}` : ""}
        ${record.syncedAt ? `<br />雲端：已同步` : ""}
      </div>
      <div>
        <div class="record-total">${record.total} 根</div>
        <button class="danger-btn" type="button" data-delete="${record.id}">刪除</button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll<HTMLButtonElement>("[data-delete]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.delete!;
      await deleteRecord(id);
      if (currentUser) await deleteCloudRecord(currentUser, id);
      await render();
    });
  });
}
function renderChart(records: HairRecord[]): void {
  const data = records.slice(-activeRange);
  chart?.destroy();
  chart = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels: data.map((record) => formatShortDate(record.date)),
      datasets: [
        { label: "總數", data: data.map((r) => r.total), tension: 0.35, borderWidth: 3 },
        { label: "白天", data: data.map((r) => r.daytime), tension: 0.35, borderWidth: 2 },
        { label: "洗髮", data: data.map((r) => r.washing), tension: 0.35, borderWidth: 2 },
        { label: "吹髮", data: data.map((r) => r.drying), tension: 0.35, borderWidth: 2 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
      plugins: { legend: { labels: { usePointStyle: true, boxWidth: 8 } }, tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} 根` } } },
      scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}
async function render(): Promise<void> {
  const records = await getRecords();
  renderStats(records); renderRecords(records); renderChart(records);
}
async function syncNow(): Promise<void> {
  if (!currentUser) return;
  updateCloudStatus("雲端狀態：同步中…");
  const localRecords = await getRecords();
  await uploadRecordsToCloud(currentUser, localRecords);
  const cloudRecords = await fetchCloudRecords(currentUser);
  const syncedRecords = cloudRecords.map((r) => ({ ...r, syncedAt: new Date().toISOString() }));
  await upsertMany(syncedRecords);
  updateCloudStatus(`雲端狀態：同步完成，共 ${syncedRecords.length} 筆`);
  await render();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const now = new Date().toISOString();
  const daytime = getNumber(daytimeInput);
  const washing = getNumber(washingInput);
  const drying = getNumber(dryingInput);
  const record: HairRecord = {
    id: makeRecordId(), date: dateInput.value || toISODate(), daytime, washing, drying,
    total: daytime + washing + drying, note: noteInput.value.trim(), createdAt: now, updatedAt: now
  };
  await upsertRecord(record);
  if (currentUser) {
    await uploadRecordToCloud(currentUser, record);
    await upsertRecord({ ...record, syncedAt: new Date().toISOString() });
  }
  form.reset(); dateInput.value = toISODate(); updateLiveTotal(); await updateStorageStatus(); await render();
});
[daytimeInput, washingInput, dryingInput].forEach((input) => input.addEventListener("input", async () => { updateLiveTotal(); renderStats(await getRecords()); }));
rangeButtons.forEach((button) => button.addEventListener("click", async () => {
  rangeButtons.forEach((item) => item.classList.remove("active"));
  button.classList.add("active"); activeRange = Number(button.dataset.range); renderChart(await getRecords());
}));
exportBtn.addEventListener("click", async () => exportCSV(await getRecords()));
loginBtn.addEventListener("click", async () => { await loginWithGoogle(); });
logoutBtn.addEventListener("click", async () => { await logout(); });
syncBtn.addEventListener("click", syncNow);

async function initApp(): Promise<void> {
  dateInput.value = toISODate();
  updateLiveTotal();
  await updateStorageStatus();
  updateCloudStatus();
  watchAuth(async (user) => {
    currentUser = user;
    updateCloudStatus();
    if (user) await syncNow();
  });
  await render();
}

initApp();
