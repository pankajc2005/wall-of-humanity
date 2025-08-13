// wall-of-humanity/firebase.js
// This file initializes Firebase and exports functions to fetch/add walls from/to Firestore

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase config (from Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyC00jzpghBgqoWXtDsKyUR-5H-ZFXGIhsQ",
  authDomain: "wall-of-humanity-1763a.firebaseapp.com",
  projectId: "wall-of-humanity-1763a",
  storageBucket: "wall-of-humanity-1763a.appspot.com",
  messagingSenderId: "415222663079",
  appId: "1:415222663079:web:9d41c6d140c8b2c5071882"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getWalls() {
  const wallsCol = collection(db, "walls");
  const snapshot = await getDocs(wallsCol);
  return snapshot.docs.map(doc => doc.data()).filter(w => w.status === "approved");
}

export async function addWall(data) {
  const wallsCol = collection(db, "walls");
  await addDoc(wallsCol, { ...data, status: "pending", timestamp: serverTimestamp() });
}