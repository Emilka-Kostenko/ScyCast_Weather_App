<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'
import { useLogout } from '@/composables/auth/useLogout'
import AppSidebar from '@/components/layout/AppSidebar.vue'

const router = useRouter()
const { currentUser, isAdmin } = useCurrentUser()
const { logout } = useLogout()

// Active tab — 'profile' for everyone, 'users' only for admins
const activeTab = ref('profile')

function switchTab(tab) {
  if (tab === 'users' && !isAdmin.value) return
  activeTab.value = tab
}

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

    <AppSidebar />

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

        <!-- Toggle switcher — only rendered for admins -->
        <div
          v-if="isAdmin"
          class="bg-bg-raised border border-white/5 rounded-xl p-1 flex gap-1"
        >
          <button
            @click="switchTab('users')"
            class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="activeTab === 'users' ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary'"
          >
            Users
          </button>
          <button
            @click="switchTab('profile')"
            class="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            :class="activeTab === 'profile' ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary'"
          >
            My Profile
          </button>
        </div>
        <div v-else />

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
