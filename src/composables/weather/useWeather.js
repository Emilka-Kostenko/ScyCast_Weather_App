import { ref } from 'vue'
import { fetchWeatherData } from '@/services/weatherApi'

export function useWeather() {
  const weather = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchWeather(lat, lon) {
    loading.value = true
    error.value = null
    weather.value = null

    try {
      const data = await fetchWeatherData(lat, lon)

      // Convert visibility from metres to kilometres for display
      data.current.visibility_km = (data.current.visibility / 1000).toFixed(1)

      // Find the current hour index so components can pull the right hourly value
      // (e.g. UV index is hourly — we want the value for right now, not hour 0)
      const now = new Date()
      const currentHourISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:00`
      data.currentHourIndex = data.hourly.time.indexOf(currentHourISO)

      weather.value = data
    } catch (err) {
      error.value = 'Could not load weather data. Please try again.'
    } finally {
      loading.value = false
    }
  }

  return { weather, loading, error, fetchWeather }
}
