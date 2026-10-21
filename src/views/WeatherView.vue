<script setup>
import { ref, onMounted } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
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

// The last viewed city is remembered per user in localStorage, so a page refresh
// (or coming back later) doesn't reset the weather to the default city
const lastLocationKey = () => `scycast:lastLocation:${currentUser.value?.userId}`

// Returns the remembered city, or null if none / storage unavailable / data corrupted
function loadLastLocation() {
  try {
    const raw = localStorage.getItem(lastLocationKey())
    const loc = raw ? JSON.parse(raw) : null
    // Shape check so broken data can never crash the page
    if (loc && typeof loc.name === 'string' && Number.isFinite(loc.lat) && Number.isFinite(loc.lon)) {
      return loc
    }
  } catch { /* storage blocked or invalid JSON — fall back to the default */ }
  return null
}

function saveLastLocation(location) {
  try {
    localStorage.setItem(
      lastLocationKey(),
      JSON.stringify({ name: location.name, lat: location.lat, lon: location.lon })
    )
  } catch { /* storage blocked — the city just won't be remembered */ }
}

// Load saved locations, then pick the city to show:
// last viewed city -> first saved location -> Copenhagen
async function loadLocations() {
  if (!currentUser.value?.userId) return

  await fetchLocations(currentUser.value.userId)

  const last = loadLastLocation()

  if (last) {
    activeLocation.value = last
  } else if (locations.value.length > 0) {
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
  saveLastLocation(location)
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
  <div class="min-h-dvh bg-bg-base flex">

    <AppSidebar />

    <!-- Loading / error states -->
    <div v-if="loading || error" class="flex flex-1 items-center justify-center">
      <p v-if="loading" class="text-text-muted">Loading weather...</p>
      <p v-else-if="error" class="text-status-suspended-text">{{ error }}</p>
    </div>

    <!-- Weather content
         Below xl: one column, the page scrolls (pb-24 leaves room for the bottom nav bar on phones).
         From xl up: two columns filling the screen height. min-w-0 lets the scrolling forecast
         strips shrink instead of stretching the whole page. -->
    <div v-else-if="weather" class="flex flex-col xl:flex-row gap-4 p-4 pb-24 md:p-6 xl:h-screen flex-1 min-w-0">

      <!-- Left panel — hero with LocationDropdown injected into the location slot -->
      <div class="w-full xl:w-[436px] xl:h-full rounded-2xl overflow-hidden xl:shrink-0">
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
      <div class="flex flex-col gap-4 flex-1 min-w-0">
        <HourlyForecast :weather="weather" />
        <TenDayForecast :weather="weather" />
        <!-- UV and wind: stacked on phones, side by side from md up -->
        <div class="flex flex-col md:flex-row gap-4">
          <UvIndexCard :weather="weather" class="md:flex-1" />
          <WindCard :weather="weather" class="md:flex-1" />
        </div>
      </div>

    </div>

  </div>
</template>

