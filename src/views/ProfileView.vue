<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'
import { useLogout } from '@/composables/auth/useLogout'
import { useLocations } from '@/composables/locations/useLocations'
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/services/appwrite'
import AppSidebar from '@/components/layout/AppSidebar.vue'

const router = useRouter()
const { currentUser, isAdmin } = useCurrentUser()
const { logout } = useLogout()
const { locations, fetchLocations } = useLocations()

// Load saved locations once the current user is available
onMounted(() => {
  if (currentUser.value?.userId) fetchLocations(currentUser.value.userId)
})

// Active tab — 'profile' for everyone, 'users' only for admins
const activeTab = ref('profile')

function switchTab(tab) {
  if (tab === 'users' && !isAdmin.value) return
  activeTab.value = tab
}

// Controls the saved locations dropdown visibility
const locationsOpen = ref(false)

// Edit mode state
const editMode = ref(false)
const saveLoading = ref(false)
const formData = ref({ name: '', age: '' })

// Seed form with current values and enter edit mode
function startEdit() {
  formData.value = {
    name: currentUser.value?.name || '',
    age: currentUser.value?.age || '',
  }
  editMode.value = true
}

function cancelEdit() {
  editMode.value = false
}

// Persist name and age to the Appwrite users document
async function saveProfile() {
  saveLoading.value = true
  try {
    await databases.updateDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      currentUser.value.$id,
      { name: formData.value.name, age: formData.value.age }
    )
    // Reflect changes in the shared ref so the header updates immediately
    currentUser.value.name = formData.value.name
    currentUser.value.age = formData.value.age
    editMode.value = false
  } catch {
    // silent — could add an error state here later
  } finally {
    saveLoading.value = false
  }
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

      <!-- ── PROFILE TAB ── -->
      <div v-if="activeTab === 'profile'" class="flex-1 overflow-y-auto p-6">

        <!-- Gradient banner -->
        <div
          class="w-full h-24 rounded-2xl shrink-0"
          style="background: linear-gradient(170deg, rgba(79,142,247,0.45) 0%, rgba(79,142,247,0.18) 45%, rgba(250,195,120,0.18) 100%)"
        />

        <!-- Profile card — overlaps the banner with negative top margin -->
        <div class="bg-bg-surface border border-white/5 rounded-2xl shadow-lg p-6 -mt-5 relative">

          <!-- Avatar + name/email + Edit button -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <!-- Avatar circle with first initial -->
              <div class="w-16 h-16 bg-brand rounded-full flex items-center justify-center shrink-0">
                <span class="text-white font-bold text-2xl">{{ avatarInitial }}</span>
              </div>
              <div>
                <p class="text-text-primary font-bold text-lg leading-7">{{ currentUser?.name }}</p>
                <p class="text-text-muted text-sm">{{ currentUser?.email }}</p>
              </div>
            </div>
            <!-- Edit / Save / Cancel buttons -->
            <div class="flex gap-2">
              <button
                v-if="!editMode"
                @click="startEdit"
                class="bg-brand text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-80 transition-opacity"
              >
                Edit
              </button>
              <template v-else>
                <button
                  @click="cancelEdit"
                  class="text-text-muted text-sm font-medium px-5 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="saveProfile"
                  :disabled="saveLoading"
                  class="bg-brand text-white text-sm font-semibold px-5 py-2 rounded-xl hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {{ saveLoading ? 'Saving...' : 'Save' }}
                </button>
              </template>
            </div>
          </div>

          <!-- 2-column form grid -->
          <div class="grid grid-cols-2 gap-5 mt-6">

            <!-- Full Name -->
            <div class="flex flex-col gap-1.5">
              <label class="text-text-muted text-sm font-medium">Full Name</label>
              <input
                v-if="editMode"
                v-model="formData.name"
                type="text"
                class="bg-bg-raised border border-white/5 rounded-xl px-4 py-3 text-text-primary text-sm outline-none focus:border-brand/40 transition-colors"
              />
              <div v-else class="bg-bg-raised border border-white/5 rounded-xl px-4 py-3 text-text-primary text-sm">
                {{ currentUser?.name || '—' }}
              </div>
            </div>

            <!-- Age -->
            <div class="flex flex-col gap-1.5">
              <label class="text-text-muted text-sm font-medium">Age</label>
              <input
                v-if="editMode"
                v-model="formData.age"
                type="number"
                class="bg-bg-raised border border-white/5 rounded-xl px-4 py-3 text-text-primary text-sm outline-none focus:border-brand/40 transition-colors"
              />
              <div v-else class="bg-bg-raised border border-white/5 rounded-xl px-4 py-3 text-text-primary text-sm">
                {{ currentUser?.age || '—' }}
              </div>
            </div>

            <!-- Email — read-only, auth email cannot be changed here -->
            <div class="flex flex-col gap-1.5">
              <label class="text-text-muted text-sm font-medium">Email Address</label>
              <div class="bg-bg-raised border border-white/5 rounded-xl px-4 py-3 text-text-primary text-sm">
                {{ currentUser?.email || '—' }}
              </div>
            </div>

            <!-- Password — always masked, Appwrite does not expose hashed passwords -->
            <div class="flex flex-col gap-1.5">
              <label class="text-text-muted text-sm font-medium">Password</label>
              <div class="bg-bg-raised border border-white/5 rounded-xl px-4 py-3 text-text-dim text-sm">
                ••••••••
              </div>
            </div>

          </div>

          <!-- Saved locations dropdown -->
          <div class="mt-6">
            <p class="text-text-muted text-sm font-medium mb-3">Saved Locations</p>

            <div class="relative">
              <!-- Toggle button -->
              <button
                @click="locationsOpen = !locationsOpen"
                class="w-full bg-bg-raised border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between text-sm transition-colors"
                :class="locationsOpen ? 'border-brand/40' : 'hover:border-white/10'"
              >
                <span class="text-text-primary">
                  {{ locations.length ? `📍 ${locations[0].label}` : 'No saved locations yet.' }}
                </span>
                <!-- Chevron rotates when open -->
                <svg
                  class="w-4 h-4 text-text-muted transition-transform"
                  :class="locationsOpen ? 'rotate-180' : ''"
                  fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown list -->
              <div
                v-if="locationsOpen && locations.length"
                class="absolute z-10 mt-1 w-full bg-bg-surface border border-white/5 rounded-xl shadow-lg overflow-hidden"
              >
                <div
                  v-for="loc in locations"
                  :key="loc.$id"
                  class="px-4 py-3 text-text-primary text-sm border-b border-white/5 last:border-0 hover:bg-bg-raised transition-colors"
                >
                  📍 {{ loc.label }}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- ── USERS TAB placeholder ── -->
      <div v-else-if="activeTab === 'users'" class="flex-1 p-6">
        <p class="text-text-muted text-sm">Users dashboard coming soon...</p>
      </div>

    </div>
  </div>
</template>
