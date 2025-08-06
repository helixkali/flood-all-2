const map = L.map("map").setView([10.85, 76.27], 7); // Kerala center

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const floodLayerGroup = L.layerGroup().addTo(map);
const apiKey = "be6a213ee9d4f7ab2e15d3ba4a437da3";

// Simulated flood GeoJSON URL
const floodGeoJsonUrl = "https://raw.githubusercontent.com/midhunGPT/flood-data/main/kerala-flood.geojson"; // Replace with your own live data if needed

function updateFloodZones() {
  fetch(floodGeoJsonUrl)
    .then((response) => response.json())
    .then((geojson) => {
      floodLayerGroup.clearLayers();
      L.geoJSON(geojson, {
        style: feature => {
          const level = feature.properties.level;
          return {
            color:
              level === "high"
                ? "red"
                : level === "medium"
                ? "yellow"
                : "blue",
            fillOpacity: 0.4
          };
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(`Flood Level: <b>${feature.properties.level.toUpperCase()}</b>`);
        }
      }).addTo(floodLayerGroup);
    })
    .catch((error) => console.error("Flood data error:", error));
}

// Refresh flood data every 5 mins
updateFloodZones();
setInterval(updateFloodZones, 5 * 60 * 1000);

// Get user location & weather
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      const marker = L.marker([lat, lon]).addTo(map);
      marker.bindPopup("📍 You are here").openPopup();
      map.setView([lat, lon], 10);

      const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

      fetch(weatherURL)
        .then((response) => response.json())
        .then((data) => {
          const humidity = data.main.humidity;
          const rain = data.rain ? data.rain["1h"] || 0 : 0;

          document.getElementById("weather").innerHTML =
            `Humidity: ${humidity}% | Rainfall (1h): ${rain} mm`;

          if (rain > 10) {
            document.getElementById("alertBox").classList.remove("hidden");
          }
        })
        .catch((err) => console.error("Weather error:", err));
    },
    () => {
      alert("Location access denied. Some features may not work.");
    }
  );
} else {
  alert("Geolocation is not supported by this browser.");
}
