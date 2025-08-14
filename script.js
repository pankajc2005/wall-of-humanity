import { getWalls, addWall, uploadWallImage } from './firebase.js';

// Initialize Leaflet map
const map = L.map('map').setView([20.5937, 78.9629], 5);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Display approved walls
async function displayWalls() {
  try {
    const walls = await getWalls(); // Only approved walls are returned
    walls.forEach(wall => {
      const popupImage = wall.imageUrl ? `<br><img src="${wall.imageUrl}" alt="${wall.name}" style="width:200px;height:auto;border-radius:6px;margin-top:6px;"/>` : '';
      L.marker([wall.lat, wall.lng])
        .addTo(map)
        .bindPopup(`
          <b>${wall.name}</b><br>
          ${wall.address || ''}, ${wall.city || ''}<br>
          Submitted by: ${wall.anonymous ? 'Anonymous' : wall.contributorName || 'N/A'}<br>
          ${wall.contributorSocial ? 'Social: ' + wall.contributorSocial : ''}
          ${popupImage}
        `);
    });
  } catch (err) {
    console.error("Error loading walls from Firebase:", err);
  }
}

displayWalls();

// Handle opening submission form
const openFormBtn = document.getElementById('open-form-btn');
const formDiv = document.getElementById('submission-form');
openFormBtn.addEventListener('click', () => {
  formDiv.style.display = 'block';
  window.scrollTo({ top: formDiv.offsetTop, behavior: 'smooth' });
});

// Map click selection logic
let selectMode = false;
let selectedMarker = null;

const selectLocationBtn = document.getElementById('select-location-btn');
selectLocationBtn.addEventListener('click', () => {
  selectMode = true;
  alert("Click on the map to select the wall's location.");
});

map.on('click', (e) => {
  if (!selectMode) return;

  const { lat, lng } = e.latlng;
  document.getElementById('wall-lat').value = lat.toFixed(6);
  document.getElementById('wall-lng').value = lng.toFixed(6);

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

  selectMode = false;
});

// Image upload preview and validation
const fileInput = document.getElementById('wall-image');
const previewContainer = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const removeImageBtn = document.getElementById('remove-image');
let selectedFile = null;

if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      selectedFile = null;
      previewContainer.style.display = 'none';
      return;
    }

    const validTypes = ['image/jpeg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) {
      alert('Only JPG and PNG images are allowed.');
      fileInput.value = '';
      return;
    }
    if (file.size > maxSize) {
      alert('Image exceeds 5MB size limit.');
      fileInput.value = '';
      return;
    }

    selectedFile = file;

    const reader = new FileReader();
    reader.onload = function(evt) {
      previewImg.src = evt.target.result;
      previewContainer.style.display = 'flex';
    };
    reader.readAsDataURL(file);
  });
}

if (removeImageBtn) {
  removeImageBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    previewContainer.style.display = 'none';
  });
}

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

  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';

  let imageUrl = null;
  let imagePath = null;

  try {
    if (selectedFile) {
      const uploaded = await uploadWallImage(selectedFile);
      imageUrl = uploaded.url;
      imagePath = uploaded.path;
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
      status: 'pending',
      imageUrl,
      imagePath
    };

    await addWall(wallData);
    messageEl.textContent = 'Wall submitted successfully! Pending approval.';
    messageEl.style.color = 'green';

    // Reset form fields
    ['wall-name','wall-address','wall-city','wall-lat','wall-lng','contributor-name','contributor-social'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('anonymous').checked = false;

    // Reset image selection
    if (previewContainer) {
      previewContainer.style.display = 'none';
    }
    if (fileInput) {
      fileInput.value = '';
    }
    selectedFile = null;

    // Remove marker if exists
    if (selectedMarker) {
      map.removeLayer(selectedMarker);
      selectedMarker = null;
    }

    // Hide form after submission
    formDiv.style.display = 'none';
  } catch (err) {
    console.error("Error adding wall:", err);
    messageEl.textContent = 'Error submitting wall. Please try again.';
    messageEl.style.color = 'red';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Submit Wall';
  }
});
