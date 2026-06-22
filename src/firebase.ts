import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export const googleProvider = new GoogleAuthProvider();

export function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase 尚未設定。請建立 .env 並填入 Firebase Web App config。");
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
  }

  if (!authInstance) {
    authInstance = getAuth(app);
  }

  return authInstance;
}

export function getFirebaseDB(): Firestore {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase 尚未設定。請建立 .env 並填入 Firebase Web App config。");
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
  }

  if (!dbInstance) {
    dbInstance = getFirestore(app);
    enableIndexedDbPersistence(dbInstance).catch(() => {
      // 多分頁或瀏覽器不支援時會失敗，不影響主功能。
    });
  }

  return dbInstance;
}
