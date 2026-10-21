<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
</script>

<template>
  <!-- Phone: fixed bottom navigation bar. From md up: vertical sidebar on the left -->
  <aside
    class="fixed bottom-0 inset-x-0 z-40 h-16 px-4 bg-bg-surface border-t border-white/5 flex flex-row items-center justify-around
           md:sticky md:top-0 md:bottom-auto md:inset-x-auto md:h-dvh md:self-start md:w-16 md:px-0 md:py-6 md:flex-col md:justify-start md:border-t-0 md:border-r md:shrink-0"
  >

    <!-- Cloud logo — only in the vertical sidebar, the bottom bar needs the space -->
    <div class="hidden md:flex w-9 h-9 bg-brand rounded-xl items-center justify-center mb-4 shrink-0">
      <span class="text-white text-base">☁</span>
    </div>

    <!-- Nav buttons — 48px touch targets on phones, 40px from md up -->
    <div class="flex flex-row gap-2 md:flex-col md:gap-1 md:flex-1">

      <!-- Weather dashboard -->
      <button
        @click="router.push('/weather')"
        aria-label="Weather"
        class="w-12 h-12 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-colors"
        :class="route.path === '/weather'
          ? 'bg-brand-subtle border border-brand/30 text-brand'
          : 'text-text-muted hover:bg-white/5'"
      >
        <span class="text-lg">⊞</span>
      </button>

      <!-- Profile page -->
      <button
        @click="router.push('/profile')"
        aria-label="Profile"
        class="w-12 h-12 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-colors"
        :class="route.path === '/profile'
          ? 'bg-brand-subtle border border-brand/30 text-brand'
          : 'text-text-muted hover:bg-white/5'"
      >
        <span class="text-lg">◉</span>
      </button>

    </div>

    <!-- Settings — last in the bar on phones, at the bottom of the sidebar from md up -->
    <button
      aria-label="Settings"
      class="w-12 h-12 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-text-muted hover:bg-white/5 transition-colors shrink-0"
    >
      <span class="text-lg">⚙</span>
    </button>

  </aside>
</template>
