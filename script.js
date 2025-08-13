import { getWalls } from './firebase.js';

// Initialize Leaflet map centered on India
const map = L.map('map').setView([20.5937, 78.9629], 5);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Fetch approved walls from Firebase
async function loadWalls() {
  try {
    const wallsRef = collection(db, "walls");
    const q = query(wallsRef, where("status", "==", "approved"));
    const snapshot = await getDocs(q);

    snapshot.forEach(doc => {
      const wall = doc.data();
      L.marker([wall.lat, wall.lng])
        .addTo(map)
        .bindPopup(`
          <b>${wall.name}</b><br>
          ${wall.address || ""}, ${wall.city || ""}<br>
          Submitted by: ${wall.contributorName || "Anonymous"}<br>
          ${wall.contributorSocial ? `Social: <a href="${wall.contributorSocial}" target="_blank">${wall.contributorSocial}</a>` : ""}
        `);
    });
  } catch (err) {
    console.error("Error loading walls from Firebase:", err);
  }
}

loadWalls();

// Handle submission
document.getElementById("submit-wall").addEventListener("click", async () => {
  const name = document.getElementById("wall-name").value;
  const address = document.getElementById("wall-address").value;
  const city = document.getElementById("wall-city").value;
  const lat = parseFloat(document.getElementById("wall-lat").value);
  const lng = parseFloat(document.getElementById("wall-lng").value);
  const anonymous = document.getElementById("anonymous").checked;

  let contributorName = anonymous ? "Anonymous" : document.getElementById("contributor-name").value || "Anonymous";
  let contributorSocial = anonymous ? "" : document.getElementById("contributor-social").value || "";

  if (!name || !lat || !lng) {
    document.getElementById("form-message").innerText = "Name, latitude, and longitude are required!";
    return;
  }

  try {
    await addDoc(collection(db, "walls"), {
      name,
      address,
      city,
      lat,
      lng,
      contributorName,
      contributorSocial,
      status: "pending", // admin approval required
      createdAt: new Date()
    });
    document.getElementById("form-message").innerText = "Wall submitted! Waiting for approval.";
  } catch (error) {
    console.error("Error adding wall:", error);
    document.getElementById("form-message").innerText = "Error submitting wall.";
  }
});

displayWalls();
