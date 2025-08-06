const map = L.map('map').setView([20.5937, 78.9629], 5);

// Tile layer from OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Get location and weather
navigator.geolocation.getCurrentPosition(position => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  const userMarker = L.marker([lat, lon]).addTo(map)
    .bindPopup("📍 You are here")
    .openPopup();

  map.setView([lat, lon], 13);

  // Fetch weather using your API key
  const apiKey = 'be6a213ee9d4f7ab2e15d3ba4a437da3';
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      const weatherDiv = document.getElementById("weather");
      const humidity = data.main.humidity;
      const rain = data.rain ? data.rain["1h"] || 0 : 0;

      weatherDiv.innerHTML = `🌡 Humidity: ${humidity}% | 🌧 Rainfall: ${rain} mm`;

      if (rain > 10) {
        document.getElementById("alertBox").classList.remove("hidden");
      }
    });
}, () => {
  alert("Location access denied. Map features limited.");
});

// Example static flood zones
const floodZones = [
  { lat: 28.61, lon: 77.23, risk: 'high' },    // Delhi
  { lat: 19.07, lon: 72.87, risk: 'medium' },  // Mumbai
  { lat: 13.08, lon: 80.27, risk: 'low' }      // Chennai
];

// Render flood zones
floodZones.forEach(zone => {
  const color = zone.risk === 'high' ? 'red' : zone.risk === 'medium' ? 'yellow' : 'blue';
  L.circle([zone.lat, zone.lon], {
    color: color,
    fillColor: color,
    fillOpacity: 0.5,
    radius: 1000
  }).addTo(map).bindPopup(`${zone.risk.toUpperCase()} flood risk area`);
});
