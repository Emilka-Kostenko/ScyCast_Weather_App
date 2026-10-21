<script setup>
import AppIcon from '@/components/icons/AppIcon.vue'

defineProps({
  icon: String,    // AppIcon name, e.g. "thermometer"
  label: String,   // e.g. "Feels Like"
  value: String,   // main value e.g. "30°"
  subtext: String, // optional helper text below the value
})
</script>

<template>
  <div class="flex flex-col gap-2 p-3 sm:p-4 rounded-2xl border border-white/8 bg-bg-raised/70 backdrop-blur-sm min-w-0">

    <!-- Icon + label — slightly smaller and tighter on phones so "PRECIPITATION" fits;
         truncate is the safety net for very narrow screens -->
    <div class="flex items-center gap-1.5 min-w-0">
      <AppIcon :name="icon" class="text-text-muted text-base shrink-0" />
      <span class="text-text-muted text-[11px] sm:text-xs font-semibold uppercase tracking-[0.5px] sm:tracking-[1.2px] truncate">{{ label }}</span>
    </div>

    <!-- Main value -->
    <p class="text-text-primary text-2xl font-bold">{{ value }}</p>

    <!-- Optional subtext -->
    <p v-if="subtext" class="text-text-muted text-xs leading-relaxed">{{ subtext }}</p>

  </div>
</template>
