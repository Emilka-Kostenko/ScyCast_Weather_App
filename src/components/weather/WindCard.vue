<script setup>
import { computed } from 'vue'

const props = defineProps({
  weather: Object, // full Open-Meteo response from useWeather
})

const wind = computed(() => {
  if (!props.weather) return null
  const c = props.weather.current
  return {
    speed: Math.round(c.wind_speed_10m),
    gusts: Math.round(c.wind_gusts_10m),
    direction: c.wind_direction_10m, // degrees 0–360, 0 = North
  }
})

// Converts degrees to a compass label
function degreesToLabel(deg) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}
</script>

<template>
  <div class="bg-bg-raised border border-white/8 rounded-2xl p-5 flex flex-col gap-3">

    <!-- Header -->
    <div class="flex items-center gap-2">
      <span class="text-text-muted text-xs">🌬️</span>
      <span class="text-text-muted text-xs font-semibold uppercase tracking-[1.2px]">Wind</span>
    </div>

    <!-- Speed + gusts + compass in a row -->
    <div class="flex items-center justify-between">

      <!-- Speed and gusts stacked -->
      <div class="flex flex-col gap-3">

        <!-- Wind speed -->
        <div>
          <p class="text-text-primary font-bold leading-none">
            <span class="text-3xl">{{ wind?.speed ?? '--' }}</span>
            <span class="text-text-muted text-base font-normal ml-1">MPH</span>
          </p>
          <p class="text-text-muted text-xs mt-1">Wind</p>
        </div>

        <div class="h-px w-16 bg-white/8" />

        <!-- Gusts -->
        <div>
          <p class="text-text-primary font-bold leading-none">
            <span class="text-3xl">{{ wind?.gusts ?? '--' }}</span>
            <span class="text-text-muted text-base font-normal ml-1">MPH</span>
          </p>
          <p class="text-text-muted text-xs mt-1">Gusts</p>
        </div>

      </div>

      <!-- Compass rose — centered in remaining space -->
      <div class="flex-1 flex items-center justify-center">
        <div class="relative w-32 h-32 rounded-full border border-white/15 flex items-center justify-center">

          <!-- Cardinal labels -->
          <span class="absolute top-1.5 left-1/2 -translate-x-1/2 text-text-muted text-[11px] font-bold">N</span>
          <span class="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-text-muted text-[11px] font-bold">S</span>
          <span class="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-muted text-[11px] font-bold">E</span>
          <span class="absolute left-1.5 top-1/2 -translate-y-1/2 text-text-muted text-[11px] font-bold">W</span>

          <!-- Needle points TO where wind is going (FROM direction + 180°) -->
          <div
            class="absolute w-0.5 h-10 bg-brand rounded-full origin-bottom"
            :style="{ transform: `rotate(${((wind?.direction ?? 0) + 180) % 360}deg)`, bottom: '50%' }"
          />

          <!-- Center dot -->
          <div class="w-2.5 h-2.5 rounded-full bg-brand relative z-10" />
        </div>
      </div>

    </div>

    <!-- Direction label below -->
    <p class="text-text-muted text-xs">
      From the {{ wind ? degreesToLabel(wind.direction) : '--' }}
    </p>

  </div>
</template>
