// script.js
import { getWalls, addWall } from './firebase.js';

// Initialize Leaflet map centered on India
const map = L.map('map').setView([20.5937, 78.9629], 5);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Function to load and display walls
async function displayWalls() {
  try {
    // Clear existing markers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

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

// Initial load
displayWalls();

// Handle form submission
document.getElementById('submit-wall').addEventListener('click', async () => {
  const nameInput = document.getElementById('wall-name');
  const addressInput = document.getElementById('wall-address');
  const cityInput = document.getElementById('wall-city');
  const latInput = document.getElementById('wall-lat');
  const lngInput = document.getElementById('wall-lng');
  const contributorInput = document.getElementById('contributor-name');
  const socialInput = document.getElementById('contributor-social');
  const anonymousCheckbox = document.getElementById('anonymous');
  const messageEl = document.getElementById('form-message');

  // Validate required fields
  if (!nameInput.value || !latInput.value || !lngInput.value) {
    messageEl.textContent = "Please fill in required fields: Name, Latitude, Longitude.";
    return;
  }

  // Prepare wall data
  const wallData = {
    name: nameInput.value,
    address: addressInput.value || "",
    city: cityInput.value || "",
    lat: parseFloat(latInput.value),
    lng: parseFloat(lngInput.value),
    contributor: anonymousCheckbox.checked ? "Anonymous" : (contributorInput.value || "Anonymous"),
    social: anonymousCheckbox.checked ? "" : (socialInput.value || ""),
  };

  try {
    await addWall(wallData);
    messageEl.textContent = "Wall submitted successfully! Pending admin approval.";

    // Clear form
    nameInput.value = "";
    addressInput.value = "";
    cityInput.value = "";
    latInput.value = "";
    lngInput.value = "";
    contributorInput.value = "";
    socialInput.value = "";
    anonymousCheckbox.checked = false;

    // Refresh map (only approved walls will show)
    displayWalls();
  } catch (err) {
    messageEl.textContent = "Error submitting wall. Check console for details.";
  }
});
