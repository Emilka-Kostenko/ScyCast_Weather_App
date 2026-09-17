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
  if (code <= 48) return '☁️' // 45-48 = fog
  if (code <= 55) return '🌦️'
  if (code <= 65) return '🌧️'
  if (code <= 75) return '❄️'
  if (code <= 82) return '🌧️'
  return '⛈️'
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Builds the 10-day list from daily API data
const days = computed(() => {
  if (!props.weather) return []

  const { time, weather_code, temperature_2m_max } = props.weather.daily

  return time.map((dateStr, i) => {
    const date = new Date(dateStr)
    const dayLabel = i === 0 ? 'Today' : DAY_NAMES[date.getDay()]
    // Format date as "17/09"
    const formatted = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`

    return {
      dayLabel,
      date: formatted,
      emoji: weatherEmoji(weather_code[i]),
      maxTemp: Math.round(temperature_2m_max[i]),
      isToday: i === 0,
    }
  })
})
</script>

<template>
  <div class="bg-bg-raised border border-white/8 rounded-2xl p-5">

    <!-- Section header -->
    <div class="flex items-center gap-2 mb-4">
      <span class="text-text-muted text-xs">📅</span>
      <span class="text-text-muted text-xs font-semibold uppercase tracking-[1.2px]">10-Day Forecast</span>
    </div>

    <!-- Scrollable day strip -->
    <div class="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
      <div v-for="day in days" :key="day.date" :class="[
        'flex flex-col items-center gap-2 min-w-[80px] px-4 py-3 rounded-xl shrink-0 border',
        day.isToday ? 'bg-brand-subtle border-brand/25' : 'bg-white/4 border-white/6'
      ]">
        <!-- Day name -->
        <span :class="['text-xs font-semibold', day.isToday ? 'text-brand' : 'text-text-muted']">
          {{ day.dayLabel }}
        </span>

        <!-- Short date e.g. 17/09 -->
        <span class="text-text-muted text-[10px]">{{ day.date }}</span>

        <!-- Weather emoji -->
        <span class="text-xl leading-none">{{ day.emoji }}</span>

        <!-- Max temperature -->
        <span class="text-base font-bold text-text-primary">{{ day.maxTemp }}°</span>
      </div>
    </div>

  </div>
</template>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
