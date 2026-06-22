# HairLog Nordic v1.2 Firebase

北歐質感每日掉髮量追蹤 PWA。支援離線 IndexedDB、本機持久儲存、CSV 匯出、Firebase Google 登入與 Firestore 雲端同步。

## 本機啟動

```bash
npm install
cp .env.example .env
```

把 `.env` 裡的 Firebase Web App config 填好後：

```bash
npm run dev
```

## Firebase 設定

### Firestore 資料路徑

```txt
users/{uid}/hairRecords/{recordId}
```

### Firestore Rules

請把 `firestore.rules` 的內容貼到 Firebase Console → Firestore → Rules。

## GitHub Pages

到 GitHub repo → Settings → Secrets and variables → Actions → New repository secret，新增：

```txt
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

然後到 Settings → Pages → Source 選 GitHub Actions。

## 資料保存

- 未登入：資料存在手機 IndexedDB，可離線使用。
- 已登入：資料存在 IndexedDB + Firestore。
- 換手機：登入同一個 Google 帳號後，按「立即同步」或登入後自動同步。
- 建議仍定期匯出 CSV。
