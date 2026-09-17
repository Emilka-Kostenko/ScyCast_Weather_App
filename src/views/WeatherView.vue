<script setup>
import { onMounted } from 'vue'
import WeatherHero from '@/components/weather/WeatherHero.vue'
import { useWeather } from '@/composables/weather/useWeather'

const { weather, loading, error, fetchWeather } = useWeather()

// Hardcoded Copenhagen coords for preview — will be replaced with real location data
onMounted(() => {
  fetchWeather(55.6761, 12.5683)
})
</script>

<template>
  <div class="min-h-screen bg-bg-base flex items-center justify-center">

    <p v-if="loading" class="text-text-muted">Loading weather...</p>
    <p v-else-if="error" class="text-status-suspended-text">{{ error }}</p>

    <!-- Preview: just the left panel for now, fixed width to match Figma -->
    <div v-else-if="weather" class="h-[783px] w-[436px] rounded-2xl overflow-hidden">
      <WeatherHero :weather="weather" location-name="Copenhagen" />
    </div>

  </div>
</template>
