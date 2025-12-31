// src/services/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ ENV sanity check (keep for now, remove later)
console.log("ENV CHECK", {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

// ✅ Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ✅ Prevent multiple app initialization (VERY IMPORTANT for OAuth)
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// ✅ Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // ✅ ADD THIS

// ✅ Google Provider (CRITICAL FIX)
export const googleProvider = new GoogleAuthProvider();

// 🔥 FORCE account chooser every time (prevents invisible popup)
googleProvider.setCustomParameters({
  prompt: "select_account",
});
