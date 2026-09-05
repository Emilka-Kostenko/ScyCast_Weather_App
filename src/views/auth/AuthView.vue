<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useLogin } from '@/composables/auth/useLogin'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'

const router = useRouter()
const { login, loading, error: loginError } = useLogin()
const { currentUser } = useCurrentUser()

// Controls which form is shown
const activeTab = ref('login')

// Show/hide password toggle
const showPassword = ref(false)

// Sign In form fields
const loginForm = reactive({ email: '', password: '' })

// Inline field errors — shown under each input
const loginErrors = reactive({ email: '', password: '' })

// Validates the sign in form — returns true if valid
function validateLogin() {
  let valid = true
  loginErrors.email = ''
  loginErrors.password = ''

  if (!loginForm.email) {
    loginErrors.email = 'Email is required.'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
    loginErrors.email = 'Please enter a valid email address.'
    valid = false
  }

  if (!loginForm.password) {
    loginErrors.password = 'Password is required.'
    valid = false
  } else if (loginForm.password.length < 8) {
    loginErrors.password = 'Password must be at least 8 characters.'
    valid = false
  }

  return valid
}

async function handleLogin() {
  if (!validateLogin()) return

  const result = await login(loginForm.email, loginForm.password)

  if (result.success) {
    // Redirect based on role
    router.push(currentUser.value?.role === 'admin' ? '/admin/users' : '/weather')
  }
}
</script>

<template>
  <div class="min-h-screen bg-bg-base flex items-center justify-center relative px-4 py-8">

    <!-- Subtle radial glow -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse at 60% 40%, rgba(79,142,247,0.08) 0%, transparent 70%)"
    />

    <!-- Card — full width on mobile, max-md on larger screens -->
    <div
      class="relative z-10 w-full max-w-md rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
      style="background: var(--color-bg-overlay)"
    >

      <!-- Logo + app name -->
      <div class="flex items-center gap-2">
        <div class="w-9 h-9 bg-brand rounded-lg flex items-center justify-center text-lg shrink-0">☁</div>
        <span class="text-text-primary text-lg font-semibold">Skycast</span>
      </div>

      <!-- Tab toggle -->
      <div class="flex gap-1 p-1 rounded-xl bg-input-bg">
        <button
          :class="[
            'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
            activeTab === 'login' ? 'bg-brand text-white font-semibold' : 'text-text-muted hover:text-text-primary'
          ]"
          @click="activeTab = 'login'"
        >
          Sign In
        </button>
        <button
          :class="[
            'flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
            activeTab === 'register' ? 'bg-brand text-white font-semibold' : 'text-text-muted hover:text-text-primary'
          ]"
          @click="activeTab = 'register'"
        >
          Sign Up
        </button>
      </div>

      <!-- Heading -->
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

      <!-- ── Sign In Form ── -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="flex flex-col gap-4" novalidate>

        <!-- Email field -->
        <div class="flex flex-col gap-1">
          <label class="text-text-muted text-sm">Email Address</label>
          <input
            v-model="loginForm.email"
            type="email"
            placeholder="your@email.com"
            class="w-full rounded-xl px-4 py-3 text-text-primary text-sm bg-input-bg placeholder:text-text-dim outline-none focus:ring-2 focus:ring-brand transition"
            :class="loginErrors.email ? 'ring-2 ring-status-suspended-text' : ''"
          />
          <!-- Inline error shown under the field -->
          <p v-if="loginErrors.email" class="text-status-suspended-text text-xs mt-0.5">
            {{ loginErrors.email }}
          </p>
        </div>

        <!-- Password field with show/hide toggle -->
        <div class="flex flex-col gap-1">
          <label class="text-text-muted text-sm">Password</label>
          <div class="relative">
            <input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full rounded-xl px-4 py-3 pr-16 text-text-primary text-sm bg-input-bg placeholder:text-text-dim outline-none focus:ring-2 focus:ring-brand transition"
              :class="loginErrors.password ? 'ring-2 ring-status-suspended-text' : ''"
            />
            <!-- Toggle show/hide -->
            <button
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-xs hover:text-text-primary transition cursor-pointer"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="loginErrors.password" class="text-status-suspended-text text-xs mt-0.5">
            {{ loginErrors.password }}
          </p>
        </div>

        <!-- Server error from Appwrite (wrong credentials etc.) -->
        <p v-if="loginError" class="text-status-suspended-text text-sm text-center">
          {{ loginError }}
        </p>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>

      </form>

      <!-- Sign Up form placeholder — coming next -->
      <div v-if="activeTab === 'register'">
        <p class="text-text-muted text-sm text-center">Sign Up form coming soon</p>
      </div>

    </div>
  </div>
</template>
