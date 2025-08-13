// script.js
import { getWalls, addWall } from './firebase.js';

// Initialize Leaflet map centered on India
const map = L.map('map').setView([20.5937, 78.9629], 5);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Display walls on the map
async function displayWalls() {
  try {
    const walls = await getWalls();
    walls.forEach(wall => {
      L.marker([wall.lat, wall.lng])
        .addTo(map)
        .bindPopup(`
          <b>${wall.name}</b><br>
          ${wall.address || ''}, ${wall.city || ''}<br>
          Submitted by: ${wall.anonymous ? 'Anonymous' : wall.contributorName || 'N/A'}<br>
          ${wall.contributorSocial ? 'Social: ' + wall.contributorSocial : ''}
        `);
    });
  } catch (err) {
    console.error("Error loading walls from Firebase:", err);
  }
}

// Call displayWalls after definition
displayWalls();

// Let user select location on map
let selectedMarker = null;
map.on('click', (e) => {
  const { lat, lng } = e.latlng;

  // Fill form inputs
  document.getElementById('wall-lat').value = lat.toFixed(6);
  document.getElementById('wall-lng').value = lng.toFixed(6);

  // Add or move marker on map
  if (selectedMarker) {
    selectedMarker.setLatLng([lat, lng]);
  } else {
    selectedMarker = L.marker([lat, lng], { draggable: true }).addTo(map);
    selectedMarker.on('dragend', function(event) {
      const pos = event.target.getLatLng();
      document.getElementById('wall-lat').value = pos.lat.toFixed(6);
      document.getElementById('wall-lng').value = pos.lng.toFixed(6);
    });
  }
});

// Form submission
const submitButton = document.getElementById('submit-wall');
const messageEl = document.getElementById('form-message');

submitButton.addEventListener('click', async () => {
  const name = document.getElementById('wall-name').value.trim();
  const address = document.getElementById('wall-address').value.trim();
  const city = document.getElementById('wall-city').value.trim();
  const lat = parseFloat(document.getElementById('wall-lat').value);
  const lng = parseFloat(document.getElementById('wall-lng').value);
  const contributorName = document.getElementById('contributor-name').value.trim();
  const contributorSocial = document.getElementById('contributor-social').value.trim();
  const anonymous = document.getElementById('anonymous').checked;

  if (!name || isNaN(lat) || isNaN(lng)) {
    messageEl.textContent = 'Please fill in required fields (Name, Latitude, Longitude).';
    messageEl.style.color = 'red';
    return;
  }

  const wallData = {
    name,
    address,
    city,
    lat,
    lng,
    anonymous,
    contributorName: anonymous ? null : contributorName || 'N/A',
    contributorSocial: anonymous ? null : contributorSocial || null,
    status: 'pending' // new submissions are pending approval
  };

  try {
    await addWall(wallData);
    messageEl.textContent = 'Wall submitted successfully! Pending approval.';
    messageEl.style.color = 'green';

    // Reset form
    document.getElementById('wall-name').value = '';
    document.getElementById('wall-address').value = '';
    document.getElementById('wall-city').value = '';
    document.getElementById('wall-lat').value = '';
    document.getElementById('wall-lng').value = '';
    document.getElementById('contributor-name').value = '';
    document.getElementById('contributor-social').value = '';
    document.getElementById('anonymous').checked = false;

    // Remove selected marker
    if (selectedMarker) {
      map.removeLayer(selectedMarker);
      selectedMarker = null;
    }

  } catch (err) {
    console.error("Error adding wall:", err);
    messageEl.textContent = 'Error submitting wall. Please try again.';
    messageEl.style.color = 'red';
  }
});
