<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGeocoding } from '@/composables/geocoding/useGeocoding'
import { useAddLocation } from '@/composables/locations/useAddLocation'
import { useRemoveLocation } from '@/composables/locations/useRemoveLocation'
import { getCityCoords } from '@/services/geocodingApi'

const props = defineProps({
  activeLocation: Object, // { name, lat, lon } — currently viewed location
  savedLocations: Array,  // Appwrite documents [{ $id, label, lat, lon }]
  userId: String,
})

// select: emitted when user picks a city (triggers weather fetch in parent)
// refresh: emitted after save/unsave so parent can reload saved locations
const emit = defineEmits(['select', 'refresh'])

const { results, loading, searchCity, clearResults } = useGeocoding()
const { addLocation } = useAddLocation()
const { removeLocation } = useRemoveLocation()

const isOpen = ref(false)
const query = ref('')
const wrapperRef = ref(null)

// Find the saved document that matches the currently active location (if any)
const savedDoc = computed(() =>
  props.savedLocations?.find(
    l => l.lat === props.activeLocation?.lat && l.lon === props.activeLocation?.lon
  )
)
const isSaved = computed(() => !!savedDoc.value)

function onInput() {
  searchCity(query.value)
}

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
  query.value = ''
  clearResults()
}

// Pick from search results — fetches coords first (autocomplete gives no coords), then emits select
async function selectCity(city) {
  const coords = await getCityCoords(city.stedId)
  emit('select', { name: city.name, lat: coords.lat, lon: coords.lon })
  close()
}

// Pick from saved locations list
function selectSaved(loc) {
  emit('select', { name: loc.label, lat: loc.lat, lon: loc.lon })
  close()
}

// Toggle save/unsave for the currently active location
async function toggleSave() {
  if (!props.activeLocation || !props.userId) return

  if (isSaved.value) {
    await removeLocation(savedDoc.value.$id)
  } else {
    await addLocation({
      userId: props.userId,
      label: props.activeLocation.name,
      lat: props.activeLocation.lat,
      lon: props.activeLocation.lon,
      isPrimary: false,
    })
  }

  // Tell parent to reload saved locations from Appwrite
  emit('refresh')
}

// Close dropdown when clicking outside the component
function onClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    close()
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div ref="wrapperRef" class="relative w-full">

    <!-- Trigger row — shows active city, save toggle, and open/close chevron -->
    <div class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/12 bg-white/8 backdrop-blur-sm w-full">
      <span class="text-base">📍</span>

      <!-- City name button — clicking it opens/closes the dropdown -->
      <button
        class="flex-1 text-left text-text-primary text-sm font-medium truncate"
        @click="isOpen ? close() : open()"
      >
        {{ activeLocation?.name ?? 'Select a location' }}
      </button>

      <!-- Bookmark toggle — save or unsave the active location -->
      <button
        v-if="activeLocation"
        @click.stop="toggleSave"
        class="text-lg leading-none transition-opacity hover:opacity-80"
        :title="isSaved ? 'Remove from saved' : 'Save location'"
      >
        {{ isSaved ? '🔖' : '🏷️' }}
      </button>

      <!-- Chevron — rotates when open -->
      <span
        class="text-text-muted text-xs transition-transform duration-200 cursor-pointer"
        :class="{ 'rotate-180': isOpen }"
        @click="isOpen ? close() : open()"
      >▾</span>
    </div>

    <!-- Dropdown panel -->
    <div
      v-if="isOpen"
      class="absolute top-full left-0 right-0 mt-2 rounded-xl border border-white/12 bg-white/10 backdrop-blur-md z-50 overflow-hidden"
    >

      <!-- Search input row -->
      <div class="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span class="text-text-muted text-sm">🔍</span>
        <input
          v-model="query"
          @input="onInput"
          type="text"
          placeholder="Search a city..."
          autofocus
          class="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-muted outline-none"
        />
      </div>

      <!-- Search suggestions — shown while the user is typing -->
      <div v-if="query">
        <p v-if="loading" class="px-4 py-3 text-text-muted text-sm">Searching...</p>
        <p v-else-if="!results.length" class="px-4 py-3 text-text-muted text-sm">No cities found</p>

        <!-- Slightly lighter bg than the saved list to visually separate search results -->
        <button
          v-else
          v-for="city in results"
          :key="city.name + city.lat"
          @click="selectCity(city)"
          class="flex items-center gap-3 w-full px-4 py-3 text-left text-text-primary text-sm bg-white/5 hover:bg-white/12 transition-colors border-b border-white/8 last:border-0"
        >
          <span>📍</span>
          <span class="truncate">{{ city.name }}</span>
        </button>
      </div>

      <!-- Saved locations list — shown when the search field is empty -->
      <div v-else>
        <p
          v-if="!savedLocations?.length"
          class="px-4 py-3 text-text-muted text-sm"
        >
          No saved locations yet
        </p>

        <button
          v-else
          v-for="loc in savedLocations"
          :key="loc.$id"
          @click="selectSaved(loc)"
          class="flex items-center gap-3 w-full px-4 py-3 text-left text-sm hover:bg-white/8 transition-colors border-b border-white/8 last:border-0"
          :class="activeLocation?.lat === loc.lat ? 'text-brand font-medium' : 'text-text-primary'"
        >
          <span>📍</span>
          <span class="truncate">{{ loc.label }}</span>
        </button>
      </div>

    </div>
  </div>
</template>
