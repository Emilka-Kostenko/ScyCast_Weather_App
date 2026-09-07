const DAWA_URL = 'https://api.dataforsyningen.dk/stednavne2'

// Fetches Danish city matches for a given search query from the DAWA API.
// Returns an array of { name, lat, lon } objects, or an empty array on failure.
export async function searchCities(query) {
  const params = new URLSearchParams({
    q: query,
    type: 'by',     // cities only — not streets or regions
    srid: '4326',   // standard lat/lon coordinate format
  })

  const response = await fetch(`${DAWA_URL}?${params}`)

  if (!response.ok) {
    throw new Error(`DAWA API error: ${response.status}`)
  }

  const data = await response.json()

  // DAWA returns [lon, lat] — we swap to the more intuitive { lat, lon } shape
  return data.map(item => ({
    name: item.navn,
    lat: item.visueltcenter[1],
    lon: item.visueltcenter[0],
  }))
}
