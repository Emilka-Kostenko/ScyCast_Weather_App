import { ref } from 'vue'
import { searchCities } from '@/services/geocodingApi'

export function useGeocoding() {
  const results = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Holds the debounce timer so we can cancel it if the user keeps typing
  let debounceTimer = null

  // Called on every keystroke — waits 300ms of silence before hitting the API
  function searchCity(query) {
    clearTimeout(debounceTimer)
    error.value = null

    // Clear results immediately when the input is empty
    if (!query.trim()) {
      results.value = []
      return
    }

    debounceTimer = setTimeout(async () => {
      loading.value = true
      try {
        results.value = await searchCities(query)
      } catch (err) {
        error.value = 'Could not load city suggestions. Please try again.'
        results.value = []
      } finally {
        loading.value = false
      }
    }, 300)
  }

  // Clears results when the dropdown closes or a city is selected
  function clearResults() {
    results.value = []
    clearTimeout(debounceTimer)
  }

  return { results, loading, error, searchCity, clearResults }
}
