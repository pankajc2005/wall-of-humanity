// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase config (from step 3)
const firebaseConfig = {
  apiKey: "AIzaSyC00jzpghBgqoWXtDsKyUR-5H-ZFXGIhsQ",
  authDomain: "http://wall-of-humanity-1763a.firebaseapp.com",
  projectId: "wall-of-humanity-1763a",
  storageBucket: "http://wall-of-humanity-1763a.firebasestorage.app",
  messagingSenderId: "415222663079",
  appId: "1:415222663079:web:9d41c6d140c8b2c5071882"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to fetch approved walls
export async function getWalls() {
  const wallsCol = collection(db, "walls");
  const wallSnapshot = await getDocs(wallsCol);
  const wallList = wallSnapshot.docs.map(doc => doc.data());
  return wallList.filter(w => w.status === "approved");
}
