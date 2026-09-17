<script setup>
import { computed } from 'vue'

const props = defineProps({
  weather: Object, // full Open-Meteo response from useWeather
})

// Current hour's UV index value
const uvValue = computed(() => {
  if (!props.weather) return null
  const index = props.weather.currentHourIndex
  return Math.round(props.weather.hourly.uv_index[index])
})

// Maps UV value to a severity label and display color
const uvLevel = computed(() => {
  const uv = uvValue.value
  if (uv === null) return null
  if (uv <= 2) return { label: 'Low',       color: '#4ade80' }
  if (uv <= 5) return { label: 'Moderate',  color: '#facc15' }
  if (uv <= 7) return { label: 'High',      color: '#fb923c' }
  if (uv <= 10) return { label: 'Very High', color: '#f87171' }
  return       { label: 'Extreme',   color: '#c084fc' }
})

// Position of the indicator dot on the gradient bar (0–100%)
const barPosition = computed(() => {
  if (uvValue.value === null) return 0
  return Math.min((uvValue.value / 11) * 100, 100)
})
</script>

<template>
  <div class="bg-bg-raised border border-white/8 rounded-2xl p-5 flex flex-col gap-3">

    <!-- Header -->
    <div class="flex items-center gap-2">
      <span class="text-text-muted text-xs">🌞</span>
      <span class="text-text-muted text-xs font-semibold uppercase tracking-[1.2px]">UV Index</span>
    </div>

    <!-- UV number -->
    <p class="text-text-primary text-4xl font-bold leading-none">{{ uvValue ?? '--' }}</p>

    <!-- Severity label -->
    <p v-if="uvLevel" class="text-sm font-medium" :style="{ color: uvLevel.color }">
      {{ uvLevel.label }}
    </p>

    <!-- Gradient bar — green to purple across UV scale -->
    <div class="relative h-2 rounded-full w-full"
      style="background: linear-gradient(90deg, #4ade80 0%, #facc15 25%, #fb923c 50%, #f87171 75%, #c084fc 100%)"
    >
      <!-- Indicator dot showing current UV position -->
      <div
        class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow"
        :style="{ left: `${barPosition}%`, backgroundColor: uvLevel?.color ?? '#4ade80' }"
      />
    </div>

    <!-- Helper text -->
    <p class="text-text-muted text-xs">
      {{ uvValue === 0 ? 'No UV radiation right now' : 'Protect your skin when outdoors' }}
    </p>

  </div>
</template>
