<script setup>
import { ref } from 'vue'

// Controls which form is shown — 'login' or 'register'
const activeTab = ref('login')
</script>

<template>
  <div class="min-h-screen bg-bg-base flex items-center justify-center relative">

    <!-- Subtle radial glow in the background -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse at 60% 40%, rgba(79,142,247,0.08) 0%, transparent 70%)"
    />

    <!-- Centered card -->
    <div
      class="relative z-10 w-full max-w-md rounded-2xl p-8 flex flex-col gap-6"
      style="background: var(--color-bg-overlay)"
    >

      <!-- Logo + app name -->
      <div class="flex items-center gap-2">
        <div class="w-9 h-9 bg-brand rounded-lg flex items-center justify-center text-lg">☁</div>
        <span class="text-text-primary text-lg font-semibold">Skycast</span>
      </div>

      <!-- Tab toggle: Sign In / Sign Up -->
      <div class="flex gap-1 p-1 rounded-xl bg-input-bg">
        <button
          :class="[
            'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
            activeTab === 'login'
              ? 'bg-brand text-white font-semibold'
              : 'text-text-muted hover:text-text-primary'
          ]"
          @click="activeTab = 'login'"
        >
          Sign In
        </button>
        <button
          :class="[
            'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
            activeTab === 'register'
              ? 'bg-brand text-white font-semibold'
              : 'text-text-muted hover:text-text-primary'
          ]"
          @click="activeTab = 'register'"
        >
          Sign Up
        </button>
      </div>

      <!-- Heading changes based on active tab -->
      <div>
        <h1 class="text-text-primary text-2xl font-bold mb-1">
          {{ activeTab === 'login' ? 'Welcome back' : 'Create account' }}
        </h1>
        <p class="text-text-muted text-sm">
          {{ activeTab === 'login'
            ? 'Sign in to access your weather dashboard'
            : 'Join Skycast and track weather in Denmark' }}
        </p>
      </div>

    </div>
  </div>
</template>
