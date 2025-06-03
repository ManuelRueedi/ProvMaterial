<template>
  <USlideover
    :open="localOpen"
    @update:open="localOpen = $event"
    :side="isDesktop ? 'right' : 'bottom'"
    :ui="slideoverUi"
    :close="slideoverClose"
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
            @blur="validateName"
            :status="validationErrors.name ? 'error' : undefined"
            size="xl"
            class="w-full"
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
        </div>
        <!-- <p>{{ formData.latitude }}, {{ formData.longitude }}</p> -->
      </div>
      <ClientOnly>
        <div class="h-64 w-full">
          <MglMap :map-style="style" :center="center" :zoom="zoom">
            <MglNavigationControl />
            <mgl-marker
              v-model:coordinates="coordinates"
              :draggable="true"
              @dragend="onDragEnd"
            />
          </MglMap>
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
const style =
  "https://api.maptiler.com/maps/0197273f-cf7d-78b4-b2e3-16a360932850/style.json?key=Z3eYEpeHavyVp6P3AygU";
const center: [number, number] = [8.629319, 47.69331394];
const zoom = 13;
const coordinates = ref<{ lng: number; lat: number }>({
  lng: 8.629319,
  lat: 47.69331394,
});

function onDragEnd() {
  formData.latitude = coordinates.value.lat;
  formData.longitude = coordinates.value.lng;
  console.log("Drag ended:", coordinates.value.lat, coordinates.value.lng);

  // Get address from coordinates
  getAddressFromCoordinates(coordinates.value.lat, coordinates.value.lng);
}

async function getAddressFromCoordinates(lat: number, lng: number) {
  try {
    // Using OpenStreetMap Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "de", // Get results in German
          "User-Agent": "ProvMaterial", // Replace with your application name
        },
      },
    );

    const data = await response.json();

    if (data && data.display_name) {
      formData.address = data.display_name;
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
  "location-created": [location: any];
}>();

const { isDesktop } = useDevice();
const toast = useToast();

const slideoverUi = reactive({
  title: 'text-center text-3xl font-bold',
  description: 'text-center text-xl',
  header: 'justify-center py-7',
  body: 'flex flex-col gap-5 px-4 sm:px-6',
});

const slideoverClose = reactive({
  color: 'primary',
  variant: 'solid',
  size: 'xl',
});

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
    }
  },
);

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
}

// Cancel form submission
function cancel() {
  localOpen.value = false;
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

    toast.add({
      title: "Erfolg",
      description: `Standort "${createdLocation!.name}" wurde erstellt`,
      color: "success",
    });

    emit("location-created", createdLocation);
    localOpen.value = false;
  } catch (error: any) {
    if (error.statusCode === 409) {
      validationErrors.value.name =
        "Ein Standort mit diesem Namen existiert bereits";
    } else {
      toast.add({
        title: "Fehler",
        description: error.statusMessage || "Ein Fehler ist aufgetreten",
        color: "error",
      });
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>
