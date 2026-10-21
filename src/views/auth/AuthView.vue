<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useLogin } from '@/composables/auth/useLogin'
import { useRegister } from '@/composables/auth/useRegister'
import { useForgotPassword } from '@/composables/auth/useForgotPassword'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'

const router = useRouter()
const { login, loading: loginLoading, error: loginError } = useLogin()
const { register, loading: registerLoading, error: registerError } = useRegister()
const { sendResetLink, loading: forgotLoading, error: forgotError, sent: forgotSent } = useForgotPassword()
const { currentUser } = useCurrentUser()

// Controls which form is shown: 'login' | 'register' | 'forgot'
const activeTab = ref('login')

// Heading and subtitle for each form
const headings = {
  login: { title: 'Welcome back', subtitle: 'Sign in to access your weather dashboard' },
  register: { title: 'Create account', subtitle: 'Join Skycast and track weather in Denmark' },
  forgot: { title: 'Forgot password?', subtitle: "Enter your email and we'll send you a link to reset it" },
}

// Separate show/hide toggles for each password field
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// ── Sign In ──
const loginForm = reactive({ email: '', password: '' })
const loginErrors = reactive({ email: '', password: '' })

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
    router.push(currentUser.value?.role === 'admin' ? '/admin/users' : '/weather')
  }
}

// ── Forgot Password ──
const forgotEmail = ref('')
const forgotEmailError = ref('')

// Opens the forgot-password form, pre-filled with whatever was typed on the sign-in form
function openForgot() {
  forgotEmail.value = loginForm.email
  forgotEmailError.value = ''
  forgotSent.value = false
  forgotError.value = null
  activeTab.value = 'forgot'
}

async function handleForgot() {
  forgotEmailError.value = ''

  if (!forgotEmail.value) {
    forgotEmailError.value = 'Email is required.'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.value)) {
    forgotEmailError.value = 'Please enter a valid email address.'
    return
  }

  await sendResetLink(forgotEmail.value)
}

// ── Sign Up ──
const registerForm = reactive({ name: '', age: '', email: '', password: '', confirmPassword: '' })
const registerErrors = reactive({ name: '', age: '', email: '', password: '', confirmPassword: '' })

function validateRegister() {
  let valid = true
  Object.keys(registerErrors).forEach(k => registerErrors[k] = '')

  if (!registerForm.name.trim()) {
    registerErrors.name = 'Full name is required.'
    valid = false
  } else if (registerForm.name.trim().length < 2) {
    registerErrors.name = 'Name must be at least 2 characters.'
    valid = false
  }

  const age = Number(registerForm.age)
  if (!registerForm.age) {
    registerErrors.age = 'Age is required.'
    valid = false
  } else if (!Number.isInteger(age) || age < 1 || age > 120) {
    registerErrors.age = 'Please enter a valid age between 1 and 120.'
    valid = false
  }

  if (!registerForm.email) {
    registerErrors.email = 'Email is required.'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    registerErrors.email = 'Please enter a valid email address.'
    valid = false
  }

  if (!registerForm.password) {
    registerErrors.password = 'Password is required.'
    valid = false
  } else if (registerForm.password.length < 8) {
    registerErrors.password = 'Password must be at least 8 characters.'
    valid = false
  }

  if (!registerForm.confirmPassword) {
    registerErrors.confirmPassword = 'Please confirm your password.'
    valid = false
  } else if (registerForm.password !== registerForm.confirmPassword) {
    registerErrors.confirmPassword = 'Passwords do not match.'
    valid = false
  }

  return valid
}

async function handleRegister() {
  if (!validateRegister()) return
  const result = await register(registerForm.name, registerForm.age, registerForm.email, registerForm.password)
  if (result.success) {
    router.push('/weather')
  }
}
</script>

<template>
  <div class="min-h-dvh bg-bg-base flex items-center justify-center relative px-4 py-8">

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
            'flex-1 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
            activeTab === 'login' ? 'bg-brand text-white font-semibold' : 'text-text-muted hover:text-text-primary'
          ]"
          @click="activeTab = 'login'"
        >
          Sign In
        </button>
        <button
          :class="[
            'flex-1 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
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
          {{ headings[activeTab].title }}
        </h1>
        <p class="text-text-muted text-sm">
          {{ headings[activeTab].subtitle }}
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
            class="w-full rounded-xl px-4 py-3 text-text-primary text-base sm:text-sm bg-input-bg placeholder:text-text-dim outline-none focus:ring-2 focus:ring-brand transition"
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
              class="w-full rounded-xl px-4 py-3 pr-16 text-text-primary text-base sm:text-sm bg-input-bg placeholder:text-text-dim outline-none focus:ring-2 focus:ring-brand transition"
              :class="loginErrors.password ? 'ring-2 ring-status-suspended-text' : ''"
            />
            <!-- Toggle show/hide -->
            <button
              type="button"
              class="absolute right-0 top-0 h-full px-4 text-text-muted text-xs hover:text-text-primary transition cursor-pointer"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="loginErrors.password" class="text-status-suspended-text text-xs mt-0.5">
            {{ loginErrors.password }}
          </p>

          <!-- Opens the forgot-password form -->
          <button
            type="button"
            class="self-end text-brand text-xs hover:underline transition cursor-pointer py-3.5 px-1"
            @click="openForgot"
          >
            Forgot password?
          </button>
        </div>

        <!-- Server error from Appwrite (wrong credentials etc.) -->
        <p v-if="loginError" class="text-status-suspended-text text-sm text-center">
          {{ loginError }}
        </p>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="loginLoading"
          class="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {{ loginLoading ? 'Signing in...' : 'Sign In' }}
        </button>

      </form>

      <!-- ── Forgot Password Form ── -->
      <form v-if="activeTab === 'forgot'" @submit.prevent="handleForgot" class="flex flex-col gap-4" novalidate>

        <!-- After sending: neutral confirmation, same for known and unknown emails -->
        <p
          v-if="forgotSent"
          class="text-text-primary text-base sm:text-sm bg-input-bg rounded-xl px-4 py-3"
        >
          If an account exists for <span class="font-semibold">{{ forgotEmail }}</span>,
          we've sent a link to reset the password. Check your inbox (and spam folder).
        </p>

        <!-- Email field — hidden once the link has been sent -->
        <div v-else class="flex flex-col gap-1">
          <label class="text-text-muted text-sm">Email Address</label>
          <input
            v-model="forgotEmail"
            type="email"
            placeholder="your@email.com"
            class="w-full rounded-xl px-4 py-3 text-text-primary text-base sm:text-sm bg-input-bg placeholder:text-text-dim outline-none focus:ring-2 focus:ring-brand transition"
            :class="forgotEmailError ? 'ring-2 ring-status-suspended-text' : ''"
          />
          <p v-if="forgotEmailError" class="text-status-suspended-text text-xs mt-0.5">
            {{ forgotEmailError }}
          </p>
        </div>

        <!-- Server error (network problem etc.) -->
        <p v-if="forgotError" class="text-status-suspended-text text-sm text-center">
          {{ forgotError }}
        </p>

        <!-- Submit button — not needed after the link has been sent -->
        <button
          v-if="!forgotSent"
          type="submit"
          :disabled="forgotLoading"
          class="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {{ forgotLoading ? 'Sending...' : 'Send Reset Link' }}
        </button>

        <!-- Back to the sign-in form -->
        <button
          type="button"
          class="text-text-muted text-sm hover:text-text-primary transition cursor-pointer py-3"
          @click="activeTab = 'login'"
        >
          ← Back to Sign In
        </button>

      </form>

      <!-- ── Sign Up Form ── -->
      <form v-if="activeTab === 'register'" @submit.prevent="handleRegister" class="flex flex-col gap-4" novalidate>

        <!-- Full name + Age on same row on larger screens -->
        <div class="flex flex-col sm:flex-row gap-4">

          <div class="flex flex-col gap-1 flex-1">
            <label class="text-text-muted text-sm">Full Name</label>
            <input
              v-model="registerForm.name"
              type="text"
              placeholder="Alex Rawles"
              class="w-full rounded-xl px-4 py-3 text-text-primary text-base sm:text-sm bg-input-bg placeholder:text-text-dim outline-none focus:ring-2 focus:ring-brand transition"
              :class="registerErrors.name ? 'ring-2 ring-status-suspended-text' : ''"
            />
            <p v-if="registerErrors.name" class="text-status-suspended-text text-xs mt-0.5">
              {{ registerErrors.name }}
            </p>
          </div>

          <div class="flex flex-col gap-1 w-full sm:w-24">
            <label class="text-text-muted text-sm">Age</label>
            <input
              v-model="registerForm.age"
              type="number"
              placeholder="25"
              min="1"
              max="120"
              class="w-full rounded-xl px-4 py-3 text-text-primary text-base sm:text-sm bg-input-bg placeholder:text-text-dim outline-none focus:ring-2 focus:ring-brand transition"
              :class="registerErrors.age ? 'ring-2 ring-status-suspended-text' : ''"
            />
            <p v-if="registerErrors.age" class="text-status-suspended-text text-xs mt-0.5">
              {{ registerErrors.age }}
            </p>
          </div>

        </div>

        <!-- Email -->
        <div class="flex flex-col gap-1">
          <label class="text-text-muted text-sm">Email Address</label>
          <input
            v-model="registerForm.email"
            type="email"
            placeholder="your@email.com"
            class="w-full rounded-xl px-4 py-3 text-text-primary text-base sm:text-sm bg-input-bg placeholder:text-text-dim outline-none focus:ring-2 focus:ring-brand transition"
            :class="registerErrors.email ? 'ring-2 ring-status-suspended-text' : ''"
          />
          <p v-if="registerErrors.email" class="text-status-suspended-text text-xs mt-0.5">
            {{ registerErrors.email }}
          </p>
        </div>

        <!-- Password -->
        <div class="flex flex-col gap-1">
          <label class="text-text-muted text-sm">Password</label>
          <div class="relative">
            <input
              v-model="registerForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full rounded-xl px-4 py-3 pr-16 text-text-primary text-base sm:text-sm bg-input-bg placeholder:text-text-dim outline-none focus:ring-2 focus:ring-brand transition"
              :class="registerErrors.password ? 'ring-2 ring-status-suspended-text' : ''"
            />
            <button
              type="button"
              class="absolute right-0 top-0 h-full px-4 text-text-muted text-xs hover:text-text-primary transition cursor-pointer"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="registerErrors.password" class="text-status-suspended-text text-xs mt-0.5">
            {{ registerErrors.password }}
          </p>
        </div>

        <!-- Confirm Password -->
        <div class="flex flex-col gap-1">
          <label class="text-text-muted text-sm">Confirm Password</label>
          <div class="relative">
            <input
              v-model="registerForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full rounded-xl px-4 py-3 pr-16 text-text-primary text-base sm:text-sm bg-input-bg placeholder:text-text-dim outline-none focus:ring-2 focus:ring-brand transition"
              :class="registerErrors.confirmPassword ? 'ring-2 ring-status-suspended-text' : ''"
            />
            <button
              type="button"
              class="absolute right-0 top-0 h-full px-4 text-text-muted text-xs hover:text-text-primary transition cursor-pointer"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="registerErrors.confirmPassword" class="text-status-suspended-text text-xs mt-0.5">
            {{ registerErrors.confirmPassword }}
          </p>
        </div>

        <!-- Server error from Appwrite -->
        <p v-if="registerError" class="text-status-suspended-text text-sm text-center">
          {{ registerError }}
        </p>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="registerLoading"
          class="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {{ registerLoading ? 'Creating account...' : 'Create Account' }}
        </button>

      </form>

    </div>
  </div>
</template>
