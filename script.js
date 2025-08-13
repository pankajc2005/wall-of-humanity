import { getWalls } from './firebase.js';

// Initialize Leaflet map centered on India
const map = L.map('map').setView([20.5937, 78.9629], 5);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load walls from Firebase and display on map
async function displayWalls() {
  try {
    const walls = await getWalls();
    walls.forEach(wall => {
      L.marker([wall.lat, wall.lng])
        .addTo(map)
        .bindPopup(`<b>${wall.name}</b><br>${wall.city}`);
    });
  } catch (err) {
    console.error("Error loading walls from Firebase:", err);
  }
}

displayWalls();
