// src/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

// --- PENTING: Ganti dengan Config Firebase kamu sendiri ---
// (Didapat dari Firebase Console -> Project Settings -> General -> Your Apps)
const firebaseConfig = {
  apiKey: "AIzaSyD6fbMmJbRbY5nNldT2VT-mG3KzT6m5lxI", // GANTI INI
  authDomain: "antrian-rapor.firebaseapp.com", // GANTI INI
  databaseURL: "https://antrian-rapor-default-rtdb.asia-southeast1.firebasedatabase.app", // GANTI INI (PENTING)
  projectId: "antrian-rapor", // GANTI INI
  storageBucket: "antrian-rapor.firebasestorage.app",
  messagingSenderId: "466508379828",
  appId: "1:466508379828:web:b6d1b4c06b4b98640cc9e1"
};

// Mencegah error "Firebase App already initialized" saat hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Inisialisasi Database
const db = getDatabase(app);

// --- INI YANG TADI HILANG (EXPORT) ---
export { db };