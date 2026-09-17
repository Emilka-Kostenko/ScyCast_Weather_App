<script setup>
import { computed } from 'vue'

const props = defineProps({
  weather: Object, // full Open-Meteo response from useWeather
})

// Maps a WMO weather code to an emoji
function weatherEmoji(code) {
  if (code === 0) return '☀️'
  if (code <= 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 55) return '🌦️'
  if (code <= 65) return '🌧️'
  if (code <= 75) return '❄️'
  if (code <= 82) return '🌧️'
  return '⛈️'
}

// Slices the next 10 hours starting from the current hour index
const hours = computed(() => {
  if (!props.weather) return []

  const { time, temperature_2m, weather_code } = props.weather.hourly
  const start = props.weather.currentHourIndex

  return Array.from({ length: 10 }, (_, i) => {
    const index = start + i
    return {
      label: i === 0 ? 'Now' : time[index].slice(11, 16), // extract "15:00" from ISO string
      emoji: weatherEmoji(weather_code[index]),
      temp: Math.round(temperature_2m[index]),
      isNow: i === 0,
    }
  })
})
</script>

<template>
  <div class="bg-bg-raised border border-white/8 rounded-2xl p-5">

    <!-- Section header -->
    <div class="flex items-center gap-2 mb-4">
      <span class="text-text-muted text-xs">🕐</span>
      <span class="text-text-muted text-xs font-semibold uppercase tracking-[1.2px]">Hourly Forecast</span>
    </div>

    <!-- Scrollable hour strip — hidden scrollbar, scroll still works -->
    <div class="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
      <div
        v-for="hour in hours"
        :key="hour.label"
        :class="[
          'flex flex-col items-center gap-2 min-w-[72px] px-4 py-3 rounded-xl shrink-0 border',
          hour.isNow ? 'bg-brand border-brand' : 'bg-white/5 border-white/6'
        ]"
      >
        <span :class="['text-xs font-medium', hour.isNow ? 'text-white/85' : 'text-text-muted']">
          {{ hour.label }}
        </span>
        <span class="text-xl leading-none">{{ hour.emoji }}</span>
        <span class="text-base font-bold text-text-primary">{{ hour.temp }}°</span>
      </div>
    </div>

  </div>
</template>

<style scoped>
.scrollbar-hide { scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
