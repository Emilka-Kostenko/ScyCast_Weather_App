<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'
import { useLogout } from '@/composables/auth/useLogout'

const router = useRouter()
const { currentUser } = useCurrentUser()
const { logout } = useLogout()

// Formatted date shown in the header
const today = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
)

// First character of the user's name for the avatar circle
const avatarInitial = computed(() =>
  currentUser.value?.name?.charAt(0).toUpperCase() || '?'
)

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-bg-base flex">

    <!-- ── Sidebar ── -->
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
          class="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:bg-white/5 transition-colors"
        >
          <span class="text-lg">⊞</span>
        </button>

        <!-- Profile (active) -->
        <button class="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-subtle border border-brand/30 text-brand">
          <span class="text-lg">◉</span>
        </button>
      </div>

      <!-- Settings at the bottom -->
      <button class="w-10 h-10 rounded-xl flex items-center justify-center text-text-muted hover:bg-white/5 transition-colors shrink-0">
        <span class="text-lg">⚙</span>
      </button>
    </aside>

    <!-- ── Main content ── -->
    <div class="flex flex-col flex-1 min-w-0">

      <!-- Top bar -->
      <header class="bg-bg-surface border-b border-white/5 flex items-center justify-between px-6 py-4 shrink-0">
        <!-- Welcome text + date -->
        <div>
          <h1 class="text-text-primary font-bold text-xl leading-7">
            Welcome, {{ currentUser?.name || 'User' }}
          </h1>
          <p class="text-text-muted text-xs mt-0.5">{{ today }}</p>
        </div>

        <!-- Placeholder — toggle will go here in Step 2 -->
        <div />

        <!-- Avatar initial — click to logout -->
        <button
          @click="handleLogout"
          class="w-9 h-9 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-sm hover:opacity-80 transition-opacity shrink-0"
          title="Logout"
        >
          {{ avatarInitial }}
        </button>
      </header>

      <!-- Content area — will be filled in coming steps -->
      <div class="flex-1 p-6">
        <p class="text-text-muted text-sm">Profile content coming soon...</p>
      </div>

    </div>
  </div>
</template>
