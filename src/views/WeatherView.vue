<script setup>
import { onMounted } from 'vue'
import WeatherHero from '@/components/weather/WeatherHero.vue'
import HourlyForecast from '@/components/weather/HourlyForecast.vue'
import TenDayForecast from '@/components/weather/TenDayForecast.vue'
import UvIndexCard from '@/components/weather/UvIndexCard.vue'
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

    <!-- Preview layout -->
    <div v-else-if="weather" class="flex gap-4 p-6 h-screen">
      <!-- Left panel -->
      <div class="h-full w-[436px] rounded-2xl overflow-hidden shrink-0">
        <WeatherHero :weather="weather" location-name="Copenhagen" />
      </div>

      <!-- Right panel — components added here as we build them -->
      <div class="flex flex-col gap-4 flex-1">
        <HourlyForecast :weather="weather" />
        <TenDayForecast :weather="weather" />
        <UvIndexCard :weather="weather" />
      </div>
    </div>

  </div>
</template>
