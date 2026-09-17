const DAWA_STEDNAVNE_URL = 'https://api.dataforsyningen.dk/stednavne2'
const DAWA_STEDER_URL = 'https://api.dataforsyningen.dk/steder'

// Autocomplete search — prefix matching so partial input returns results.
// Returns [{ name, stedId }] — no coords yet (autocomplete response is flat).
export async function searchCities(query) {
  const params = new URLSearchParams({
    q: query,
    type: 'by',
    autocomplete: true,
  })

  const response = await fetch(`${DAWA_STEDNAVNE_URL}?${params}`)

  if (!response.ok) {
    throw new Error(`DAWA API error: ${response.status}`)
  }

  const data = await response.json()

  // Only keep actual cities/towns — filter out stadiums, harbors, airports, rivers, etc.
  const cityTypes = ['by', 'bymæssigBebyggelse']

  return data
    .filter(item => cityTypes.includes(item.sted_undertype))
    .map(item => ({
      name: item.navn,
      stedId: item.sted_id,
    }))
}

// Fetches lat/lon for a specific city by its sted_id.
// Called when the user selects a suggestion — autocomplete response has no coords.
export async function getCityCoords(stedId) {
  const response = await fetch(`${DAWA_STEDER_URL}/${stedId}?srid=4326`)

  if (!response.ok) {
    throw new Error(`DAWA steder API error: ${response.status}`)
  }

  const data = await response.json()

  // DAWA returns [lon, lat] — swap to { lat, lon }
  return {
    lat: data.visueltcenter[1],
    lon: data.visueltcenter[0],
  }
}
