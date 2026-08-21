// Display Current Local Date
const now = new Date();
document.getElementById('current-date').innerText = now.toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const ANCHORAGE_LAT = 61.2181;
const ANCHORAGE_LON = -149.9003;

async function fetchWeather() {
  try {
    // 1. Get NWS Grid point for Anchorage
    const pointRes = await fetch(`https://api.weather.gov/points/${ANCHORAGE_LAT},${ANCHORAGE_LON}`);
    const pointData = await pointRes.json();
    
    // 2. Fetch local forecast
    const forecastRes = await fetch(pointData.properties.forecast);
    const forecastData = await forecastRes.json();
    const periods = forecastData.properties.periods;

    // Parse today's high, low, and short forecast description
    const today = periods[0];
    const tonight = periods[1];

    const high = today.isDaytime ? `${today.temperature}°${today.temperatureUnit}` : '--';
    const low = !today.isDaytime ? `${today.temperature}°${today.temperatureUnit}` : `${tonight.temperature}°${tonight.temperatureUnit}`;

    document.getElementById('temp').innerText = `${high} / ${low}`;
    document.getElementById('conditions').innerText = today.shortForecast;
  } catch (err) {
    document.getElementById('conditions').innerText = 'Error loading weather';
  }
}

async function fetchCelestialData() {
  try {
    // Open-Meteo Sun & Moon API Endpoint
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${ANCHORAGE_LAT}&longitude=${ANCHORAGE_LON}&daily=sunrise,sunset,moon_phase_angle&timezone=America%2FAnchorage`;
    const res = await fetch(url);
    const data = await res.json();

    const sunriseIso = data.daily.sunrise[0];
    const sunsetIso = data.daily.sunset[0];
    const phaseAngle = data.daily.moon_phase_angle[0]; // 0° to 360°

    // Format Times
    const formatTime = (isoStr) => new Date(isoStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    document.getElementById('sunrise').innerText = formatTime(sunriseIso);
    document.getElementById('sunset').innerText = formatTime(sunsetIso);

    // Calculate Illumination % and Phase Name from Phase Angle
    const illum = Math.round((1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2 * 100);
    document.getElementById('moon-illum').innerText = `${illum}%`;

    let phaseName = 'New Moon';
    if (phaseAngle > 0 && phaseAngle < 90) phaseName = 'Waxing Crescent';
    else if (phaseAngle === 90) phaseName = 'First Quarter';
    else if (phaseAngle > 90 && phaseAngle < 180) phaseName = 'Waxing Gibbous';
    else if (phaseAngle === 180) phaseName = 'Full Moon';
    else if (phaseAngle > 180 && phaseAngle < 270) phaseName = 'Waning Gibbous';
    else if (phaseAngle === 270) phaseName = 'Third Quarter';
    else if (phaseAngle > 270 && phaseAngle < 360) phaseName = 'Waning Crescent';

    document.getElementById('moon-phase').innerText = phaseName;
  } catch (err) {
    console.error('Celestial fetch error:', err);
  }
}

fetchWeather();
fetchCelestialData();