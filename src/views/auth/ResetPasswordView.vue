<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResetPassword } from '@/composables/auth/useResetPassword'

const route = useRoute()
const router = useRouter()
const { resetPassword, loading, error } = useResetPassword()

// The recovery email link looks like /reset-password?userId=...&secret=...
const userId = route.query.userId
const secret = route.query.secret

// Without both values the link is broken — we show a message instead of the form
const linkValid = Boolean(userId && secret)

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const done = ref(false)

// Heading and subtitle depend on the state of the page: broken link, success or the form
const heading = computed(() => {
  if (!linkValid) return { title: 'Invalid link', subtitle: 'This reset link cannot be used.' }
  if (done.value) return { title: 'Password updated', subtitle: 'You can now sign in with your new password.' }
  return { title: 'Set a new password', subtitle: 'Choose a new password for your account.' }
})

const form = reactive({ password: '', confirmPassword: '' })
const errors = reactive({ password: '', confirmPassword: '' })

function validate() {
  let valid = true
  errors.password = ''
  errors.confirmPassword = ''

  if (!form.password) {
    errors.password = 'Password is required.'
    valid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
    valid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
    valid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return
  const ok = await resetPassword(userId, secret, form.password)
  if (ok) done.value = true
}
</script>

<template>
  <div class="min-h-dvh bg-bg-base flex items-center justify-center relative px-4 py-8">

    <!-- Subtle radial glow -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background: radial-gradient(ellipse at 60% 40%, rgba(79,142,247,0.08) 0%, transparent 70%)"
    />

    <div
      class="relative z-10 w-full max-w-md rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
      style="background: var(--color-bg-overlay)"
    >

      <!-- Logo + app name -->
      <div class="flex items-center gap-2">
        <div class="w-9 h-9 bg-brand rounded-lg flex items-center justify-center text-lg shrink-0">☁</div>
        <span class="text-text-primary text-lg font-semibold">Skycast</span>
      </div>

      <!-- Heading -->
      <div>
        <h1 class="text-text-primary text-2xl font-bold mb-1">
          {{ heading.title }}
        </h1>
        <p class="text-text-muted text-sm">
          {{ heading.subtitle }}
        </p>
      </div>

      <!-- Broken link: userId or secret missing from the URL -->
      <div v-if="!linkValid" class="flex flex-col gap-4">
        <p class="text-status-suspended-text text-sm bg-input-bg rounded-xl px-4 py-3">
          This reset link is invalid. Please request a new one from the sign-in page.
        </p>
        <button
          type="button"
          class="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
          @click="router.push('/login')"
        >
          Back to Sign In
        </button>
      </div>

      <!-- Success: password changed -->
      <div v-else-if="done" class="flex flex-col gap-4">
        <button
          type="button"
          class="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
          @click="router.push('/login')"
        >
          Go to Sign In
        </button>
      </div>

      <!-- ── New password form ── -->
      <form v-else @submit.prevent="handleSubmit" class="flex flex-col gap-4" novalidate>

        <!-- New password -->
        <div class="flex flex-col gap-1">
          <label class="text-text-muted text-sm">New Password</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full rounded-xl px-4 py-3 pr-16 text-text-primary text-base sm:text-sm bg-input-bg placeholder:text-text-dim outline-none focus:ring-2 focus:ring-brand transition"
              :class="errors.password ? 'ring-2 ring-status-suspended-text' : ''"
            />
            <button
              type="button"
              class="absolute right-0 top-0 h-full px-4 text-text-muted text-xs hover:text-text-primary transition cursor-pointer"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="errors.password" class="text-status-suspended-text text-xs mt-0.5">
            {{ errors.password }}
          </p>
        </div>

        <!-- Confirm new password -->
        <div class="flex flex-col gap-1">
          <label class="text-text-muted text-sm">Confirm Password</label>
          <div class="relative">
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full rounded-xl px-4 py-3 pr-16 text-text-primary text-base sm:text-sm bg-input-bg placeholder:text-text-dim outline-none focus:ring-2 focus:ring-brand transition"
              :class="errors.confirmPassword ? 'ring-2 ring-status-suspended-text' : ''"
            />
            <button
              type="button"
              class="absolute right-0 top-0 h-full px-4 text-text-muted text-xs hover:text-text-primary transition cursor-pointer"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="errors.confirmPassword" class="text-status-suspended-text text-xs mt-0.5">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <!-- Server error (expired link, weak password, etc.) -->
        <p v-if="error" class="text-status-suspended-text text-sm text-center">
          {{ error }}
        </p>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {{ loading ? 'Saving...' : 'Reset Password' }}
        </button>

      </form>

    </div>
  </div>
</template>
