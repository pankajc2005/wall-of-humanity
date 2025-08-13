// Initialize map centered on India
var map = L.map('map').setView([20.5937, 78.9629], 5);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Fetch walls.json from GitHub
fetch('walls.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(wall => {
      // Add marker for each wall
      L.marker([wall.lat, wall.lng])
        .addTo(map)
        .bindPopup(`<b>${wall.name}</b><br>${wall.address}, ${wall.city}`);
    });
  })
  .catch(err => console.error("Error loading walls.json:", err));
