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

// --- Fetch approved walls ---
export async function getWalls() {
  const wallsCol = collection(db, "walls");
  const wallSnapshot = await getDocs(wallsCol);
  const wallList = wallSnapshot.docs.map(doc => doc.data());
  // Only show walls with status = "approved"
  return wallList.filter(w => w.status === "approved");
}

// --- Add a new wall ---
export async function addWall(wall) {
  try {
    const wallsCol = collection(db, "walls");
    // Add extra fields like timestamp and default status
    const newWall = {
      ...wall,
      status: "pending", // admins can approve later
      createdAt: serverTimestamp()
    };
    await addDoc(wallsCol, newWall);
    console.log("Wall added successfully!");
  } catch (err) {
    console.error("Error adding wall:", err);
    throw err; // so calling code can handle errors
  }
}
