<script setup>
import StatCard from './StatCard.vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import { useWeatherDescription } from '@/composables/weather/useWeatherDescription'
import { computed } from 'vue'

const props = defineProps({
  weather: Object,       // full Open-Meteo response from useWeather
  locationName: String,  // city name shown in the location button
})

// Derive condition label, description, and background image from the weather code
const condition = computed(() =>
  props.weather ? useWeatherDescription(props.weather.current.weather_code) : null
)

// Stat card data assembled from the current weather fields
const stats = computed(() => {
  if (!props.weather) return []
  const c = props.weather.current
  return [
    {
      icon: 'thermometer',
      label: 'Feels Like',
      value: `${Math.round(c.apparent_temperature)}°`,
      subtext: c.apparent_temperature > c.temperature_2m
        ? 'Humidity is making it feel warmer'
        : 'Feels cooler than the actual temperature',
    },
    {
      icon: 'precipitation',
      label: 'Precipitation',
      value: `${c.precipitation} mm`,
      subtext: 'In the last hour',
    },
    {
      icon: 'visibility',
      label: 'Visibility',
      value: `${props.weather.current.visibility_km} km`,
      subtext: null,
    },
    {
      icon: 'humidity',
      label: 'Humidity',
      value: `${c.relative_humidity_2m}%`,
      subtext: null,
    },
  ]
})
</script>

<template>
  <div class="relative flex flex-col gap-4 h-full p-4 sm:p-6 overflow-hidden">

    <!-- Background image -->
    <img
      v-if="condition"
      :src="condition.background"
      alt=""
      aria-hidden="true"
      class="absolute inset-0 w-full h-full object-cover pointer-events-none"
    />

    <!-- Dark gradient overlay so text stays readable over any image -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: linear-gradient(to bottom, rgba(10,15,30,0.3) 0%, rgba(10,15,30,0.7) 60%, rgba(10,15,30,0.95) 100%)"
    />

    <!-- All content sits above the image and gradient -->
    <div class="relative z-10 flex flex-col gap-4 h-full">

      <!-- Location button — slot so WeatherView can drop in LocationDropdown -->
      <slot name="location">
        <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/12 bg-white/8 backdrop-blur-sm w-full">
          <AppIcon name="location-pin" class="text-text-primary text-lg shrink-0" />
          <span class="text-text-primary text-sm font-medium flex-1">{{ locationName ?? 'Select a location' }}</span>
          <span class="text-text-muted text-xs">▾</span>
        </div>
      </slot>

      <!-- Temperature + condition label + description (vertically centered)
           py-8 gives it room when the panel is stacked and no longer fills the screen height -->
      <div class="flex flex-col items-center justify-center flex-1 gap-0 py-8 xl:py-0">
        <p class="text-text-primary font-bold text-[96px] leading-none tracking-[-2px]">
          {{ weather ? `${Math.round(weather.current.temperature_2m)}°` : '--' }}
        </p>
        <p class="text-text-primary text-2xl font-semibold mt-2 mb-4">
          {{ condition?.label ?? '' }}
        </p>
        <p class="text-text-soft text-sm text-center max-w-[320px] leading-relaxed">
          {{ condition?.description ?? '' }}
        </p>
      </div>

      <!-- Stat cards: 2×2 on phones and tablets, one row of four on wide stacked layouts (lg),
           2×2 again in the narrow left panel on desktop (xl) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 gap-3">
        <StatCard
          v-for="stat in stats"
          :key="stat.label"
          :icon="stat.icon"
          :label="stat.label"
          :value="stat.value"
          :subtext="stat.subtext"
        />
      </div>

    </div>
  </div>
</template>
