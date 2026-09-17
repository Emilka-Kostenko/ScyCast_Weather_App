<script setup>
import { ref, onMounted } from 'vue'
import WeatherHero from '@/components/weather/WeatherHero.vue'
import HourlyForecast from '@/components/weather/HourlyForecast.vue'
import TenDayForecast from '@/components/weather/TenDayForecast.vue'
import UvIndexCard from '@/components/weather/UvIndexCard.vue'
import WindCard from '@/components/weather/WindCard.vue'
import LocationDropdown from '@/components/weather/LocationDropdown.vue'
import { useWeather } from '@/composables/weather/useWeather'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'
import { useLocations } from '@/composables/locations/useLocations'

const { weather, loading, error, fetchWeather } = useWeather()
const { currentUser } = useCurrentUser()
const { locations, fetchLocations } = useLocations()

// The location currently shown — may or may not be in saved locations
const activeLocation = ref(null)

// Load saved locations and default to the first one (or Copenhagen as fallback)
async function loadLocations() {
  if (!currentUser.value?.userId) return

  await fetchLocations(currentUser.value.userId)

  if (locations.value.length > 0) {
    const first = locations.value[0]
    activeLocation.value = { name: first.label, lat: first.lat, lon: first.lon }
  } else {
    // No saved locations yet — fall back to Copenhagen
    activeLocation.value = { name: 'Copenhagen', lat: 55.6761, lon: 12.5683 }
  }

  fetchWeather(activeLocation.value.lat, activeLocation.value.lon)
}

// Called when the user picks a location from the dropdown (search or saved list)
function onSelectLocation(location) {
  activeLocation.value = location
  fetchWeather(location.lat, location.lon)
}

// Called after save/unsave toggle — reloads saved locations from Appwrite
async function onRefreshLocations() {
  if (currentUser.value?.userId) {
    await fetchLocations(currentUser.value.userId)
  }
}

onMounted(loadLocations)
</script>

<template>
  <div class="min-h-screen bg-bg-base flex items-center justify-center">

    <p v-if="loading" class="text-text-muted">Loading weather...</p>
    <p v-else-if="error" class="text-status-suspended-text">{{ error }}</p>

    <div v-else-if="weather" class="flex gap-4 p-6 h-screen">

      <!-- Left panel — hero with LocationDropdown injected into the location slot -->
      <div class="h-full w-[436px] rounded-2xl overflow-hidden shrink-0">
        <WeatherHero :weather="weather">
          <template #location>
            <LocationDropdown
              :active-location="activeLocation"
              :saved-locations="locations"
              :user-id="currentUser?.userId"
              @select="onSelectLocation"
              @refresh="onRefreshLocations"
            />
          </template>
        </WeatherHero>
      </div>

      <!-- Right panel -->
      <div class="flex flex-col gap-4 flex-1">
        <HourlyForecast :weather="weather" />
        <TenDayForecast :weather="weather" />
        <div class="flex gap-4">
          <UvIndexCard :weather="weather" class="flex-1" />
          <WindCard :weather="weather" class="flex-1" />
        </div>
      </div>

    </div>

  </div>
</template>
