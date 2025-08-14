// wall-of-humanity/firebase.js
// This file initializes Firebase and exports functions to fetch/add walls from/to Firestore

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, doc, updateDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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

// Admin functions
export async function getAllSubmissions() {
  const wallsCol = collection(db, "walls");
  const q = query(wallsCol, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function getSubmissionsByStatus(status) {
  const wallsCol = collection(db, "walls");
  // Remove orderBy to avoid composite index requirement
  const q = query(wallsCol, where("status", "==", status));
  const snapshot = await getDocs(q);
  const submissions = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  // Sort in JavaScript instead
  return submissions.sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0;
    return b.timestamp.toDate() - a.timestamp.toDate();
  });
}

export async function updateSubmissionStatus(submissionId, newStatus) {
  const submissionRef = doc(db, "walls", submissionId);
  await updateDoc(submissionRef, {
    status: newStatus,
    reviewedAt: serverTimestamp()
  });
}