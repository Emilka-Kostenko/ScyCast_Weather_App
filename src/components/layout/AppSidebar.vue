<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
</script>

<template>
  <aside class="w-16 bg-bg-surface border-r border-white/5 flex flex-col items-center py-6 shrink-0">

    <!-- Cloud logo -->
    <div class="w-9 h-9 bg-brand rounded-xl flex items-center justify-center mb-4 shrink-0">
      <span class="text-white text-base">☁</span>
    </div>

    <!-- Nav buttons -->
    <div class="flex flex-col gap-1 flex-1">

      <!-- Weather dashboard -->
      <button
        @click="router.push('/weather')"
        class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
        :class="route.path === '/weather'
          ? 'bg-brand-subtle border border-brand/30 text-brand'
          : 'text-text-muted hover:bg-white/5'"
      >
        <span class="text-lg">⊞</span>
      </button>

      <!-- Profile page -->
      <button
        @click="router.push('/profile')"
        class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
        :class="route.path === '/profile'
          ? 'bg-brand-subtle border border-brand/30 text-brand'
          : 'text-text-muted hover:bg-white/5'"
      >
        <span class="text-lg">◉</span>
      </button>

    </div>

    <!-- Settings at the bottom -->
    <button class="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:bg-white/5 transition-colors shrink-0">
      <span class="text-lg">⚙</span>
    </button>

  </aside>
</template>
