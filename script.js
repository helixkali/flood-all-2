const map = L.map("map").setView([10.85, 76.27], 7);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

const floodLayer = L.layerGroup().addTo(map);
const roadLayer = L.layerGroup().addTo(map);
const routeLayer = L.layerGroup().addTo(map);

const apiKey = "be6a213ee9d4f7ab2e15d3ba4a437da3"; // your OpenWeatherMap key
let userLat = null;
let userLon = null;

// Simulate 12 flood zones
function simulateFloodGeoJSON() {
  const levels = ["high", "medium", "low"];
  const features = [];
  for (let i = 0; i < 12; i++) {
    const lat = 8.5 + Math.random() * 3;
    const lon = 76 + Math.random() * 1.5;
    const lvl = levels[Math.floor(Math.random() * levels.length)];
    features.push({
      type: "Feature",
      properties: { level: lvl },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [lon, lat],
          [lon + 0.05, lat],
          [lon + 0.05, lat + 0.05],
          [lon, lat + 0.05],
          [lon, lat]
        ]]
      }
    });
  }
  return { type: "FeatureCollection", features };
}

function drawFloodZones(geo) {
  floodLayer.clearLayers();
  L.geoJSON(geo, {
    style: f => ({
      color: f.properties.level === "high" ? "red" : f.properties.level === "medium" ? "yellow" : "blue",
      fillOpacity: 0.5
    }),
    onEachFeature: (f, layer) => {
      layer.bindPopup(`Flood Level: ${f.properties.level.toUpperCase()}`);
    }
  }).addTo(floodLayer);
}

// Draw fake roads over flood zones
function drawRoads() {
  roadLayer.clearLayers();
  floodLayer.eachLayer(f => {
    const center = f.getBounds().getCenter();
    const road = L.polyline([
      [center.lat - 0.02, center.lng - 0.02],
      [center.lat + 0.02, center.lng + 0.02]
    ], {
      color: "gray",
      weight: 5
    }).addTo(roadLayer);
    road.bindPopup("⚠️ Flooded Road");
  });
}

function updateFloodZones() {
  const geo = simulateFloodGeoJSON();
  drawFloodZones(geo);
  setTimeout(drawRoads, 1000);
}

// Run on load and every 5 min
updateFloodZones();
setInterval(updateFloodZones, 5 * 60 * 1000);

// Weather and user location
navigator.geolocation.getCurrentPosition(pos => {
  userLat = pos.coords.latitude;
  userLon = pos.coords.longitude;

  map.setView([userLat, userLon], 10);
  L.marker([userLat, userLon]).addTo(map).bindPopup("📍 You").openPopup();

  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${userLat}&lon=${userLon}&units=metric&appid=${apiKey}`)
    .then(r => r.json())
    .then(data => {
      const rain = data.rain ? data.rain["1h"] || 0 : 0;
      const humidity = data.main.humidity;
      const temp = data.main.temp;
      document.getElementById("weather").textContent = `🌡 Temp: ${temp}°C | 💧Humidity: ${humidity}% | 🌧 Rain: ${rain} mm`;
      if (rain > 10) alert("⚠️ Heavy rain in your area! Watch for flood alerts.");
    });
});

// Button to refresh flood manually
document.getElementById("refreshFlood").onclick = updateFloodZones;

// Route Suggestion (simulated)
document.getElementById("calcRoute").onclick = () => {
  routeLayer.clearLayers();
  if (!userLat || !userLon) return alert("User location not available");

  const toLat = userLat + 0.3;
  const toLon = userLon + 0.3;
  const route = L.polyline([
    [userLat, userLon],
    [toLat, toLon]
  ], {
    color: "green",
    weight: 4,
    dashArray: "10,10"
  }).addTo(routeLayer);
  document.getElementById("routeInfo").textContent = "✔ Safe route simulated (avoiding red zones)";
};
