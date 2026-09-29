const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

// Searches for cities worldwide using the Open-Meteo geocoding API.
// Returns [{ name, lat, lon }] — coords included directly, no second fetch needed.
export async function searchCities(query) {
  const params = new URLSearchParams({
    name: query,
    count: 10,
    language: 'en',
    format: 'json',
  })

  const response = await fetch(`${GEOCODING_URL}?${params}`)

  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status}`)
  }

  const data = await response.json()

  // Include country name in the label so cities are easy to distinguish
  return (data.results ?? []).map(item => ({
    name: `${item.name}, ${item.country}`,
    lat: item.latitude,
    lon: item.longitude,
  }))
}
