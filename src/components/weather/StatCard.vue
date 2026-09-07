<script setup>
defineProps({
  icon: String,    // emoji icon
  label: String,   // e.g. "Feels Like"
  value: String,   // main value e.g. "30°"
  subtext: String, // optional helper text below the value
})
</script>

<template>
  <div class="flex flex-col gap-2 p-4 rounded-2xl border border-white/8 bg-bg-raised/70 backdrop-blur-sm">

    <!-- Icon + label -->
    <div class="flex items-center gap-1.5">
      <span class="text-sm leading-none">{{ icon }}</span>
      <span class="text-text-muted text-xs font-semibold uppercase tracking-[1.2px]">{{ label }}</span>
    </div>

    <!-- Main value -->
    <p class="text-text-primary text-2xl font-bold">{{ value }}</p>

    <!-- Optional subtext -->
    <p v-if="subtext" class="text-text-muted text-xs leading-relaxed">{{ subtext }}</p>

  </div>
</template>
