const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

// Fetches a full weather forecast for a given lat/lon from Open-Meteo.
// Returns current conditions, hourly data (next 24h), and 10-day daily forecast.
export async function fetchWeatherData(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,

    // Current conditions — shown in the main weather hero and stat cards
    current: [
      'temperature_2m',
      'apparent_temperature',
      'weather_code',
      'precipitation',
      'relative_humidity_2m',
      'visibility',
      'wind_speed_10m',
      'wind_gusts_10m',
      'wind_direction_10m',
    ].join(','),

    // Hourly data — used for the hourly forecast strip and UV index
    hourly: [
      'temperature_2m',
      'weather_code',
      'uv_index',
    ].join(','),

    // Daily data — used for the 10-day forecast strip
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
    ].join(','),

    forecast_days: 10,
    wind_speed_unit: 'mph',
    timezone: 'auto', // uses the timezone of the requested location
  })

  const response = await fetch(`${BASE_URL}?${params}`)

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`)
  }

  return response.json()
}
