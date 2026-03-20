const OPENWEATHER_API_KEY = "19f469513da2d0335eaadbb896b3f3d1";
const $ = id => document.getElementById(id);
const log = (...args) => {
  $('console').textContent = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') + '\n' + $('console').textContent;
};

// LocalStorage helpers
function saveToLS(key, value) { localStorage.setItem(key, String(value)); }
function loadFromLS(key) { return localStorage.getItem(key); }
function removeFromLS(key) { localStorage.removeItem(key); }

// Cache helpers
function isCacheValid() {
  const ts = parseInt(loadFromLS('cachedTS') || '0', 10);
  return ts && (Date.now() - ts) <= 30000;
}
function saveCache(city, unit, data) {
  saveToLS('cachedWeather', JSON.stringify(data));
  saveToLS('cachedCity', city);
  saveToLS('cachedUnit', unit);
  saveToLS('cachedTS', Date.now());
}
function loadCache() {
  try { return JSON.parse(loadFromLS('cachedWeather')); }
  catch { return null; }
}

// Fetch weather from API
function fetchWeather(city, unit) {
  if (!city) return;

  const cachedCity = loadFromLS('cachedCity');
  const cachedUnit = loadFromLS('cachedUnit');
  const cachedData = loadCache();

  if (cachedData && cachedCity === city && cachedUnit === unit && isCacheValid()) {
    displayWeather(cachedData, city, unit, true);
    return;
  }

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${unit}&appid=${OPENWEATHER_API_KEY}`)
    .then(res => {
      if (!res.ok) throw new Error("City not found or network error");
      return res.json();
    })
    .then(data => {
      displayWeather(data, city, unit);
      saveCache(city, unit, data);
    })
    .catch(err => {
      $('weatherContent').textContent = 'Error: ' + err.message;
      $('meta').textContent = '';
      log("Fetch error:", err.message);
    });
}

// Display weather in the block
function displayWeather(data, city, unit, fromCache = false) {
  try {
    const temp = data.main.temp;
    const cond = data.weather[0].description;
    const hum = data.main.humidity;
    const sym = unit === 'metric' ? '°C' : '°F';
    $('weatherContent').classList.remove('muted');
    $('weatherContent').textContent = `${city}: ${temp}${sym} — ${cond}`;
    $('meta').textContent = `Humidity: ${hum}% • Updated: ${new Date().toLocaleTimeString()}${fromCache ? ' (from cache)' : ''}`;
    log("Weather updated for", city);
  } catch (e) {
    $('weatherContent').textContent = "Invalid data";
    $('meta').textContent = '';
    log("Display error:", e.message);
  }
}

// Get current city input or selection
function getCityValue() {
  return $('cityInput').value.trim() || $('citySelect').value;
}

// Event listeners for dynamic updates
$('cityInput').addEventListener('input', () => {
  if ($('cityInput').value.trim().length >= 3) fetchWeather(getCityValue(), $('unitSelect').value);
});
$('citySelect').addEventListener('change', () => fetchWeather(getCityValue(), $('unitSelect').value));
$('unitSelect').addEventListener('change', () => fetchWeather(getCityValue(), $('unitSelect').value));

// Optional: Auto-refresh every 30s
setInterval(() => {
  const city = getCityValue();
  if (!city) return;
  if (isCacheValid()) {
    const data = loadCache();
    if (data) displayWeather(data, city, $('unitSelect').value, true);
  } else {
    fetchWeather(city, $('unitSelect').value);
  }
}, 30000);

log("Dynamic Weather App ready. Buttons removed.");
