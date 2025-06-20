<template>
  <USlideover
    :open="localOpen"
    :side="isDesktop ? 'right' : 'bottom'"
    :ui="slideoverUi"
    :close="slideoverClose"
    @update:open="localOpen = $event"
  >
    <template #title>
      <h1>Standort erstellen</h1>
    </template>
    <template #description>
      <h2>Standortdaten eingeben</h2>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Name Field (Required) -->
        <div class="form-group">
          <label class="mb-1 block text-sm font-medium">
            Name <span class="text-red-500">*</span>
          </label>
          <UInput
            v-model="formData.name"
            placeholder="Standortname"
            :status="validationErrors.name ? 'error' : undefined"
            size="xl"
            class="w-full"
            @blur="validateName"
          />
          <p v-if="validationErrors.name" class="mt-1 text-xs text-red-500">
            {{ validationErrors.name }}
          </p>
        </div>

        <!-- Address Field -->
        <div class="form-group">
          <label class="mb-1 block text-sm font-medium">Adresse</label>
          <UTextarea
            v-model="formData.address"
            placeholder="Vollständige Adresse"
            size="xl"
            :rows="3"
            class="w-full"
          />
          <!-- Get Position Button -->
          <UButton
            v-if="formData.address.trim()"
            variant="outline"
            color="primary"
            size="sm"
            class="mt-2"
            :loading="isGeocodingAddress"
            @click="getCoordinatesFromAddress"
          >
            <template #leading>
              <Icon name="i-heroicons-map-pin" class="h-4 w-4" />
            </template>
            Position ermitteln
          </UButton>
        </div>

        <!-- Map Info -->
        <div class="text-muted flex items-center gap-2 text-sm">
          <Icon name="i-heroicons-information-circle" class="h-4 w-4" />
          <span>Ziehen Sie den Marker, um den Standort zu ändern</span>
        </div>
        <!-- <p>{{ formData.latitude }}, {{ formData.longitude }}</p> -->
      </div>
      <ClientOnly>
        <div
          :class="
            isFullscreen
              ? 'bg-default fixed inset-0 z-50 p-1'
              : 'relative h-64 w-full'
          "
        >
          <div class="absolute top-4 left-4 z-10 flex gap-2">
            <UButton
              icon="i-heroicons-arrows-pointing-out"
              size="sm"
              color="neutral"
              variant="solid"
              class="!bg-white !text-black shadow-xl"
              :title="isFullscreen ? 'Vollbild verlassen' : 'Vollbild'"
              @click="toggleFullscreen"
            />
            <UButton
              icon="i-heroicons-map-pin"
              size="sm"
              color="neutral"
              variant="solid"
              class="!bg-white !text-black shadow-xl"
              title="Aktueller Standort"
              :loading="isLoadingLocation"
              @click="() => getCurrentLocation()"
            />
          </div>

          <!-- Coordinates display in fullscreen mode -->
          <div
            v-if="isFullscreen && formData.latitude && formData.longitude"
            class="absolute bottom-4 left-4 rounded-lg bg-white/90 px-3 py-2 text-sm text-gray-700 shadow-lg backdrop-blur-sm"
          >
            <div class="font-medium">Koordinaten:</div>
            <div>
              {{ formData.latitude?.toFixed(6) }},
              {{ formData.longitude?.toFixed(6) }}
            </div>
          </div>
          <div class="h-full w-full">
            <MglMap :map-style="style" :center="center" :zoom="zoom">
              <MglNavigationControl />
              <mgl-marker
                v-model:coordinates="coordinates"
                :draggable="true"
                @dragend="onDragEnd"
              />
            </MglMap>
          </div>
        </div>
        <template #fallback>
          <div
            class="flex h-64 w-full items-center justify-center bg-gray-100 text-gray-500"
          >
            Karte wird geladen...
          </div>
        </template>
      </ClientOnly>

      <!-- Storage Location Switch -->
      <div class="form-group">
        <USwitch
          v-model="formData.isStorageLocation"
          label="Ist ein Lagerstandort"
        />
      </div>

      <UButton
        block
        color="primary"
        :loading="isSubmitting"
        :disabled="!isFormValid"
        @click="submitForm"
      >
        Erstellen
      </UButton>
    </template>
    <slot></slot>
  </USlideover>
</template>

<script setup lang="ts">
import type { Location } from "~/composables/articles/types";
import { onMounted, onUnmounted } from "vue";
const style =
  "https://api.maptiler.com/maps/0197273f-cf7d-78b4-b2e3-16a360932850/style.json?key=Z3eYEpeHavyVp6P3AygU";
const center = ref<[number, number]>([8.629319, 47.69331394]);
const zoom = ref(13);
const coordinates = ref<{ lng: number; lat: number }>({
  lng: 8.629319,
  lat: 47.69331394,
});

// Fullscreen and geolocation state
const isFullscreen = ref(false);
const isLoadingLocation = ref(false);
const isGeocodingAddress = ref(false);

// Get coordinates from address
async function getCoordinatesFromAddress() {
  if (!formData.address.trim()) {
    toast.add({
      title: "Fehler",
      description: "Bitte geben Sie eine Adresse ein",
      color: "error",
    });
    return;
  }

  isGeocodingAddress.value = true;

  try {
    const response = await $fetch<{
      success: boolean;
      latitude?: number;
      longitude?: number;
      address?: string;
      error?: string;
    }>("/api/geocoding/forward", {
      method: "POST",
      body: { address: formData.address },
    });

    if (response.success && response.latitude && response.longitude) {
      // Update coordinates
      formData.latitude = response.latitude;
      formData.longitude = response.longitude;

      // Update map
      coordinates.value = { lng: response.longitude, lat: response.latitude };
      center.value = [response.longitude, response.latitude];
      zoom.value = 16;

      // Update address with the formatted result if available
      if (response.address) {
        formData.address = response.address;
      }

      toast.add({
        title: "Position gefunden",
        description: "Koordinaten wurden erfolgreich ermittelt",
        color: "success",
      });
    } else {
      toast.add({
        title: "Keine Position gefunden",
        description:
          response.error ||
          "Für diese Adresse konnten keine Koordinaten gefunden werden",
        color: "warning",
      });
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    toast.add({
      title: "Fehler",
      description: "Position konnte nicht ermittelt werden",
      color: "error",
    });
  } finally {
    isGeocodingAddress.value = false;
  }
}

// Get current location
async function getCurrentLocation(silent = false) {
  if (!navigator.geolocation) {
    if (!silent) {
      toast.add({
        title: "Fehler",
        description: "Geolocation wird nicht unterstützt",
        color: "error",
      });
    }
    return;
  }

  isLoadingLocation.value = true;

  try {
    const position = await new Promise<GeolocationPosition>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      },
    );

    const { latitude, longitude } = position.coords;

    // Update map center and coordinates
    center.value = [longitude, latitude];
    coordinates.value = { lng: longitude, lat: latitude };
    zoom.value = 16; // Higher zoom for current location

    // Update form data
    formData.latitude = latitude;
    formData.longitude = longitude;

    // Get address from coordinates
    await getAddressFromCoordinates(latitude, longitude);

    if (!silent) {
      toast.add({
        title: "Standort gefunden",
        description: "Aktueller Standort wurde auf der Karte markiert",
        color: "success",
      });
    }
  } catch (error) {
    console.error("Geolocation error:", error);
    if (!silent) {
      toast.add({
        title: "Fehler",
        description: "Standort konnte nicht ermittelt werden",
        color: "error",
      });
    }
  } finally {
    isLoadingLocation.value = false;
  }
}

// Toggle fullscreen
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
}

function onDragEnd() {
  formData.latitude = coordinates.value.lat;
  formData.longitude = coordinates.value.lng;

  // Get address from coordinates
  getAddressFromCoordinates(coordinates.value.lat, coordinates.value.lng);
}

async function getAddressFromCoordinates(lat: number, lng: number) {
  try {
    const response = await $fetch<{ success: boolean; address?: string }>(
      "/api/geocoding/reverse",
      {
        method: "POST",
        body: { lat, lng },
      },
    );

    if (response.success && response.address) {
      formData.address = response.address;
    }
  } catch (error) {
    console.error("Error fetching address:", error);
    toast.add({
      title: "Fehler",
      description: "Adresse konnte nicht ermittelt werden",
      color: "warning",
    });
  }
}

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "location-created": [location: Location];
}>();

const { isDesktop } = useDevice();
const toast = useToast();

const slideoverUi = reactive({
  title: "text-center text-3xl font-bold",
  description: "text-center text-xl",
  header: "justify-center py-7",
  body: "flex flex-col gap-5 px-4 sm:px-6",
  content: "max-w-2xl",
} as const);

const slideoverClose = reactive({
  color: "primary" as const,
  variant: "solid" as const,
  size: "xl" as const,
} as const);

// Two-way binding for open state
const localOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});

// Form data
const formData = reactive({
  name: "",
  address: "",
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  isStorageLocation: false,
});

// Form state
const isSubmitting = ref(false);
const validationErrors = ref({
  name: "",
});

// Reset form when opened
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      resetForm();
      // Try to get current location when opening, but don't show errors on auto-attempt
      getCurrentLocation(true);
    }
  },
);

// Handle escape key for fullscreen
onMounted(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isFullscreen.value) {
      isFullscreen.value = false;
    }
  };

  document.addEventListener("keydown", handleEscape);

  onUnmounted(() => {
    document.removeEventListener("keydown", handleEscape);
  });
});

// Form validation
const validateName = () => {
  if (!formData.name.trim()) {
    validationErrors.value.name = "Name ist erforderlich";
    return false;
  }
  validationErrors.value.name = "";
  return true;
};

const isFormValid = computed(() => {
  return formData.name.trim() !== "";
});

// Reset form to initial state
function resetForm() {
  formData.name = "";
  formData.address = "";
  formData.latitude = undefined;
  formData.longitude = undefined;
  formData.isStorageLocation = false;
  validationErrors.value = { name: "" };
  isSubmitting.value = false;
  isFullscreen.value = false;

  // Reset map to default location
  center.value = [8.629319, 47.69331394];
  coordinates.value = { lng: 8.629319, lat: 47.69331394 };
}

// Submit form to create location
async function submitForm() {
  if (!validateName()) return;

  isSubmitting.value = true;

  try {
    const createdLocation = await $fetch("/api/locations/create", {
      method: "POST",
      body: formData,
    });

    // Convert API response to match Location interface
    const locationForEmit: Location = {
      id: createdLocation!.id,
      name: createdLocation!.name,
      address: createdLocation!.address || "",
      latitude: createdLocation!.latitude || 0,
      longitude: createdLocation!.longitude || 0,
      isStorageLocation: createdLocation!.isStorageLocation || false,
    };

    emit("location-created", locationForEmit);
    localOpen.value = false;
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string };
    if (err.statusCode === 409) {
      validationErrors.value.name =
        "Ein Standort mit diesem Namen existiert bereits";
    } else {
      toast.add({
        title: "Fehler",
        description: err.statusMessage || "Ein Fehler ist aufgetreten",
        color: "error",
      });
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>
