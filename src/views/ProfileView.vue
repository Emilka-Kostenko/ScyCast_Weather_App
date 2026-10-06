<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'
import { useLogout } from '@/composables/auth/useLogout'
import { useLocations } from '@/composables/locations/useLocations'
import { useUsers } from '@/composables/admin/useUsers'
import { useUpdateUser } from '@/composables/admin/useUpdateUser'
import { useDeleteUser } from '@/composables/admin/useDeleteUser'
import { useUpdateAccount } from '@/composables/auth/useUpdateAccount'
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/services/appwrite'
import AppSidebar from '@/components/layout/AppSidebar.vue'

const router = useRouter()
const { currentUser, isAdmin } = useCurrentUser()
const { logout } = useLogout()
const { locations, fetchLocations } = useLocations()
const { users, loading: usersLoading, error: usersError, fetchUsers } = useUsers()
const { updateUser } = useUpdateUser()
const { deleteUser } = useDeleteUser()
const { changePassword, changeEmail, loading: accountLoading, error: accountError } = useUpdateAccount()

// Search query — filters the users table by name or email
const searchQuery = ref('')

// Sort state — which column and which direction
const sortKey = ref(null)   // 'role' | 'status' | null
const sortAsc = ref(true)

function toggleSort(key) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = key
    sortAsc.value = true
  }
}

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()

  // Filter first
  let result = q
    ? users.value.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      )
    : [...users.value]

  // Then sort if a column is active
  if (sortKey.value) {
    result.sort((a, b) => {
      const valA = (a[sortKey.value] || '').toLowerCase()
      const valB = (b[sortKey.value] || '').toLowerCase()
      if (valA < valB) return sortAsc.value ? -1 : 1
      if (valA > valB) return sortAsc.value ? 1 : -1
      return 0
    })
  }

  return result
})

// Edit modal — holds the user being edited, null when closed
const editingUser = ref(null)
const editSaving = ref(false)
const editError = ref('')
const editForm = ref({ name: '', age: '', role: '' })

// True when the user being edited is the only active admin — locks the Role dropdown
const editIsLastAdmin = computed(() => {
  if (!editingUser.value) return false
  if (editingUser.value.role !== 'admin') return false
  return users.value.filter(u => u.role === 'admin' && u.status === 'active').length <= 1
})

// Seed form fields and open modal
function openEdit(user) {
  editingUser.value = user
  editForm.value = {
    name: user.name || '',
    age: user.age ?? '',
    role: user.role || 'user',
  }
}

function closeEdit() {
  editingUser.value = null
  editSaving.value = false
  editError.value = ''
}

// Save the changed fields (name, age, role) to the users collection
// Email and password are NOT editable here — each user changes their own in Appwrite Auth
async function saveEdit() {
  const user = editingUser.value
  if (!user) return

  editSaving.value = true
  editError.value = ''

  // Build DB update payload with only fields that changed
  const dbPayload = {}
  if (editForm.value.name !== user.name) dbPayload.name = editForm.value.name
  if (String(editForm.value.age) !== String(user.age ?? '')) dbPayload.age = Number(editForm.value.age)
  if (editForm.value.role !== user.role) {
    // Last-admin guard — cannot demote the last active admin
    if (editIsLastAdmin.value && editForm.value.role !== 'admin') {
      alert('Cannot demote the last active admin — there must always be at least one.')
      editSaving.value = false
      return
    }
    dbPayload.role = editForm.value.role
  }

  // Update DB document if anything changed
  if (Object.keys(dbPayload).length > 0) {
    const ok = await updateUser(user.$id, dbPayload)
    if (!ok) {
      editError.value = 'Could not save changes to the database. Please try again.'
      editSaving.value = false
      return
    }
    // Reflect all DB changes in the local list immediately
    Object.assign(user, dbPayload)
  }

  editSaving.value = false
  closeEdit()
}

// Holds the $id of the user awaiting delete confirmation, null otherwise
const confirmDeleteId = ref(null)

// On first click — enters confirmation state for that row
// Blocks deletion of any admin — demote to user first via Edit modal
function handleDelete(user) {
  if (user.role === 'admin') {
    alert('Admin users cannot be deleted. Change their role to user first.')
    return
  }
  confirmDeleteId.value = user.$id
}

// On confirm — deletes from Appwrite and removes from local list
async function confirmDelete(user) {
  const ok = await deleteUser(user.$id)
  if (ok) {
    users.value = users.value.filter(u => u.$id !== user.$id)
  }
  confirmDeleteId.value = null
}

// Toggles a user between active and suspended
// Blocks the action if it would leave the system with zero active admins
async function handleStatusToggle(user) {
  const newStatus = user.status === 'active' ? 'suspended' : 'active'

  // Guard: prevent suspending the last active admin
  if (newStatus === 'suspended' && user.role === 'admin') {
    const activeAdmins = users.value.filter(u => u.role === 'admin' && u.status === 'active')
    if (activeAdmins.length <= 1) {
      alert('Cannot suspend the last active admin — the admin panel would become inaccessible.')
      return
    }
  }

  const ok = await updateUser(user.$id, { status: newStatus })
  if (ok) user.status = newStatus
}

// Load saved locations once the current user is available
onMounted(() => {
  if (currentUser.value?.userId) fetchLocations(currentUser.value.userId)
})

// Active tab — 'profile' for everyone, 'users' only for admins
const activeTab = ref('profile')

// Lazy-load users the first time the Users tab is opened
function switchTab(tab) {
  if (tab === 'users' && !isAdmin.value) return
  activeTab.value = tab
  if (tab === 'users' && users.value.length === 0) fetchUsers()
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

// ── Account security (own email / password) ──
// Which modal is open: 'email' | 'password' | null
const accountModal = ref(null)
const accountForm = ref({ email: '', currentPassword: '', newPassword: '', confirmPassword: '' })
const accountFormError = ref('')
// Green confirmation shown in the profile card after a successful change
const accountSuccess = ref('')
// Show/hide toggles for the three password fields in the modal
const showCurrentPw = ref(false)
const showNewPw = ref(false)
const showConfirmPw = ref(false)

function openAccountModal(type) {
  accountModal.value = type
  accountForm.value = { email: '', currentPassword: '', newPassword: '', confirmPassword: '' }
  showCurrentPw.value = false
  showNewPw.value = false
  showConfirmPw.value = false
  accountFormError.value = ''
  accountError.value = null
  accountSuccess.value = ''
}

function closeAccountModal() {
  accountModal.value = null
}

// Validates the form, then changes the email or password of the logged-in user
async function submitAccountChange() {
  accountFormError.value = ''
  const f = accountForm.value
  let ok = false

  if (accountModal.value === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      accountFormError.value = 'Please enter a valid email address.'
      return
    }
    if (f.email === currentUser.value?.email) {
      accountFormError.value = 'This is already your email.'
      return
    }
    if (!f.currentPassword) {
      accountFormError.value = 'Enter your current password to confirm.'
      return
    }
    ok = await changeEmail(f.email, f.currentPassword)
    if (ok) accountSuccess.value = 'Email updated. Use the new email next time you sign in.'
  } else {
    if (!f.currentPassword) {
      accountFormError.value = 'Enter your current password.'
      return
    }
    if (f.newPassword.length < 8) {
      accountFormError.value = 'New password must be at least 8 characters.'
      return
    }
    if (f.newPassword !== f.confirmPassword) {
      accountFormError.value = 'Passwords do not match.'
      return
    }
    ok = await changePassword(f.currentPassword, f.newPassword)
    if (ok) accountSuccess.value = 'Password updated.'
  }

  if (ok) closeAccountModal()
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

            <!-- Email — changed via the account modal (updates Auth + users table) -->
            <div class="flex flex-col gap-1.5">
              <label class="text-text-muted text-sm font-medium">Email Address</label>
              <div class="bg-bg-raised border border-white/5 rounded-xl px-4 py-3 text-text-primary text-sm flex items-center justify-between gap-3">
                <span class="truncate">{{ currentUser?.email || '—' }}</span>
                <button
                  @click="openAccountModal('email')"
                  class="text-brand text-xs font-semibold hover:underline shrink-0"
                >
                  Change
                </button>
              </div>
            </div>

            <!-- Password — always masked, Appwrite does not expose hashed passwords -->
            <div class="flex flex-col gap-1.5">
              <label class="text-text-muted text-sm font-medium">Password</label>
              <div class="bg-bg-raised border border-white/5 rounded-xl px-4 py-3 text-text-dim text-sm flex items-center justify-between gap-3">
                <span>••••••••</span>
                <button
                  @click="openAccountModal('password')"
                  class="text-brand text-xs font-semibold hover:underline shrink-0"
                >
                  Change
                </button>
              </div>
            </div>

            <!-- Confirmation after a successful email/password change -->
            <p
              v-if="accountSuccess"
              class="col-span-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3"
            >
              {{ accountSuccess }}
            </p>

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

      <!-- ── USERS TAB ── -->
      <div v-else-if="activeTab === 'users'" class="flex-1 overflow-y-auto p-6">

        <!-- Search bar -->
        <div class="mb-4 relative">
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">🔍</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name or email..."
            class="w-full bg-bg-surface border border-white/5 rounded-xl pl-10 pr-4 py-3 text-text-primary text-sm outline-none focus:border-brand/40 transition-colors"
          />
        </div>

        <!-- Loading state -->
        <div v-if="usersLoading" class="flex items-center justify-center h-40">
          <p class="text-text-muted text-sm">Loading users...</p>
        </div>

        <!-- Error state — shown when fetchUsers fails -->
        <div v-else-if="usersError" class="flex flex-col items-center justify-center h-40 gap-3">
          <p class="text-red-400 text-sm">{{ usersError }}</p>
          <button
            @click="fetchUsers"
            class="text-brand text-sm font-medium hover:underline"
          >
            Try again
          </button>
        </div>

        <!-- Users table -->
        <div v-else class="bg-bg-surface border border-white/5 rounded-2xl overflow-hidden">
          <table class="w-full text-sm">

            <!-- Table header -->
            <thead>
              <tr class="border-b border-white/5">
                <th class="text-left text-text-muted font-medium px-5 py-3.5">User</th>
                <th class="text-left text-text-muted font-medium px-5 py-3.5">Email</th>
                <th class="text-left text-text-muted font-medium px-5 py-3.5">Last Login</th>
                <th class="text-left text-text-muted font-medium px-5 py-3.5">Age</th>
                <th class="px-5 py-3.5">
                  <button @click="toggleSort('role')" class="flex items-center gap-1 text-text-muted font-medium text-sm hover:text-text-primary transition-colors">
                    Role
                    <span class="text-xs opacity-60">{{ sortKey === 'role' ? (sortAsc ? '↑' : '↓') : '↕' }}</span>
                  </button>
                </th>
                <th class="px-5 py-3.5">
                  <button @click="toggleSort('status')" class="flex items-center gap-1 text-text-muted font-medium text-sm hover:text-text-primary transition-colors">
                    Status
                    <span class="text-xs opacity-60">{{ sortKey === 'status' ? (sortAsc ? '↑' : '↓') : '↕' }}</span>
                  </button>
                </th>
                <th class="text-left text-text-muted font-medium px-5 py-3.5">Actions</th>
              </tr>
            </thead>

            <!-- Table body -->
            <tbody>
              <tr
                v-for="user in filteredUsers"
                :key="user.$id"
                class="border-b border-white/5 last:border-0 hover:bg-bg-raised transition-colors"
              >
                <!-- Avatar initial + name -->
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-brand/20 rounded-full flex items-center justify-center shrink-0">
                      <span class="text-brand text-xs font-bold">
                        {{ user.name?.charAt(0).toUpperCase() || '?' }}
                      </span>
                    </div>
                    <span class="text-text-primary font-medium">{{ user.name }}</span>
                  </div>
                </td>

                <!-- Email -->
                <td class="px-5 py-4 text-text-muted">{{ user.email }}</td>

                <!-- Last login — formatted as date + time, or — if never logged in -->
                <td class="px-5 py-4 text-text-muted text-xs">
                  {{ user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—' }}
                </td>

                <!-- Age -->
                <td class="px-5 py-4 text-text-muted">{{ user.age ?? '—' }}</td>

                <!-- Role badge (read-only — change via Edit modal) -->
                <td class="px-5 py-4">
                  <span
                    class="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    :class="user.role === 'admin' ? 'bg-brand/15 text-brand' : 'bg-white/5 text-text-muted'"
                  >
                    {{ user.role }}
                  </span>
                </td>

                <!-- Status badge -->
                <td class="px-5 py-4">
                  <span
                    class="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    :class="user.status === 'active' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'"
                  >
                    {{ user.status }}
                  </span>
                </td>

                <!-- Action buttons — wired up in later steps -->
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <button
                      @click="openEdit(user)"
                      class="text-text-muted hover:text-text-primary text-xs font-medium px-3 py-1.5 rounded-lg border border-white/5 hover:bg-bg-raised transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      @click="handleStatusToggle(user)"
                      class="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
                      :class="user.status === 'active'
                        ? 'text-red-400 border-red-500/20 hover:bg-red-500/10'
                        : 'text-green-400 border-green-500/20 hover:bg-green-500/10'"
                    >
                      {{ user.status === 'active' ? 'Disable' : 'Enable' }}
                    </button>
                    <!-- Inline delete confirmation -->
                    <template v-if="confirmDeleteId === user.$id">
                      <span class="text-text-muted text-xs">Sure?</span>
                      <button
                        @click="confirmDelete(user)"
                        class="text-red-400 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        @click="confirmDeleteId = null"
                        class="text-text-muted text-xs font-medium px-3 py-1.5 rounded-lg border border-white/5 hover:bg-bg-raised transition-colors"
                      >
                        No
                      </button>
                    </template>
                    <button
                      v-else
                      @click="handleDelete(user)"
                      class="text-red-400 hover:text-red-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <!-- No results row -->
              <tr v-if="filteredUsers.length === 0">
                <td colspan="7" class="px-5 py-10 text-center text-text-muted text-sm">
                  No users match "{{ searchQuery }}"
                </td>
              </tr>

            </tbody>

          </table>
        </div>
      </div>

    </div>

    <!-- ── CHANGE EMAIL / PASSWORD MODAL (own account) ── -->
    <div
      v-if="accountModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click.self="closeAccountModal"
    >
      <form
        @submit.prevent="submitAccountChange"
        class="bg-bg-surface border border-white/5 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
      >

        <!-- Modal header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-text-primary font-bold text-lg">
            {{ accountModal === 'email' ? 'Change Email' : 'Change Password' }}
          </h2>
          <button
            type="button"
            @click="closeAccountModal"
            class="text-text-muted hover:text-text-primary transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div class="flex flex-col gap-4">

          <!-- New email (email mode only) -->
          <div v-if="accountModal === 'email'" class="flex flex-col gap-1.5">
            <label class="text-text-muted text-sm font-medium">New Email Address</label>
            <input
              v-model="accountForm.email"
              type="email"
              placeholder="your@email.com"
              class="bg-bg-raised border border-white/5 rounded-xl px-4 py-3 text-text-primary text-sm outline-none focus:border-brand/40 transition-colors"
            />
          </div>

          <!-- Current password — required by Appwrite for both changes -->
          <div class="flex flex-col gap-1.5">
            <label class="text-text-muted text-sm font-medium">Current Password</label>
            <div class="relative">
              <input
                v-model="accountForm.currentPassword"
                :type="showCurrentPw ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full bg-bg-raised border border-white/5 rounded-xl px-4 py-3 pr-16 text-text-primary text-sm outline-none focus:border-brand/40 transition-colors"
              />
              <button
                type="button"
                @click="showCurrentPw = !showCurrentPw"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-xs hover:text-text-primary transition cursor-pointer"
              >
                {{ showCurrentPw ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <!-- New password + confirmation (password mode only) -->
          <template v-if="accountModal === 'password'">
            <div class="flex flex-col gap-1.5">
              <label class="text-text-muted text-sm font-medium">New Password</label>
              <div class="relative">
                <input
                  v-model="accountForm.newPassword"
                  :type="showNewPw ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="w-full bg-bg-raised border border-white/5 rounded-xl px-4 py-3 pr-16 text-text-primary text-sm outline-none focus:border-brand/40 transition-colors"
                />
                <button
                  type="button"
                  @click="showNewPw = !showNewPw"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-xs hover:text-text-primary transition cursor-pointer"
                >
                  {{ showNewPw ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-text-muted text-sm font-medium">Confirm New Password</label>
              <div class="relative">
                <input
                  v-model="accountForm.confirmPassword"
                  :type="showConfirmPw ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="w-full bg-bg-raised border border-white/5 rounded-xl px-4 py-3 pr-16 text-text-primary text-sm outline-none focus:border-brand/40 transition-colors"
                />
                <button
                  type="button"
                  @click="showConfirmPw = !showConfirmPw"
                  class="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-xs hover:text-text-primary transition cursor-pointer"
                >
                  {{ showConfirmPw ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>
          </template>

        </div>

        <!-- Error: local validation message or the error from Appwrite -->
        <p
          v-if="accountFormError || accountError"
          class="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
        >
          {{ accountFormError || accountError }}
        </p>

        <!-- Modal action buttons -->
        <div class="flex justify-end gap-3 mt-4">
          <button
            type="button"
            @click="closeAccountModal"
            class="text-text-muted text-sm font-medium px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="accountLoading"
            class="bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {{ accountLoading ? 'Saving...' : 'Save' }}
          </button>
        </div>

      </form>
    </div>

    <!-- ── EDIT USER MODAL ── -->
    <div
      v-if="editingUser"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click.self="closeEdit"
    >
      <div class="bg-bg-surface border border-white/5 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">

        <!-- Modal header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-text-primary font-bold text-lg">Edit User</h2>
          <button
            @click="closeEdit"
            class="text-text-muted hover:text-text-primary transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <!-- Form fields -->
        <div class="flex flex-col gap-4">

          <!-- Full Name -->
          <div class="flex flex-col gap-1.5">
            <label class="text-text-muted text-sm font-medium">Full Name</label>
            <input
              v-model="editForm.name"
              type="text"
              class="bg-bg-raised border border-white/5 rounded-xl px-4 py-3 text-text-primary text-sm outline-none focus:border-brand/40 transition-colors"
            />
          </div>

          <!-- Age -->
          <div class="flex flex-col gap-1.5">
            <label class="text-text-muted text-sm font-medium">Age</label>
            <input
              v-model="editForm.age"
              type="number"
              min="5"
              max="150"
              class="bg-bg-raised border border-white/5 rounded-xl px-4 py-3 text-text-primary text-sm outline-none focus:border-brand/40 transition-colors"
            />
          </div>

          <!-- Role — locked if this is the last active admin -->
          <div class="flex flex-col gap-1.5">
            <label class="text-text-muted text-sm font-medium">
              Role
              <span v-if="editIsLastAdmin" class="text-yellow-400 text-xs ml-1">(last admin — cannot demote)</span>
            </label>
            <select
              v-model="editForm.role"
              :disabled="editIsLastAdmin"
              class="bg-bg-raised border border-white/5 rounded-xl px-4 py-3 text-text-primary text-sm outline-none focus:border-brand/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>

        </div>

        <!-- Error message — shown when the DB update fails -->
        <p v-if="editError" class="mt-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          {{ editError }}
        </p>

        <!-- Modal action buttons -->
        <div class="flex justify-end gap-3 mt-4">
          <button
            @click="closeEdit"
            class="text-text-muted text-sm font-medium px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveEdit"
            :disabled="editSaving"
            class="bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-80 transition-opacity disabled:opacity-50"
          >
            {{ editSaving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
