<template>
  <USlideover
    :open="localOpen"
    :side="isDesktop ? 'right' : 'bottom'"
    :ui="slideoverUi"
    :close="slideoverClose"
    @update:open="localOpen = $event"
  >
    <template #title>
      <h1>Verwalten</h1>
    </template>
    <template #description>
      <h2>Standorte erstellen und bearbeiten</h2>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Create new location button -->
        <UButton
          block
          color="primary"
          icon="i-heroicons-plus"
          @click="showCreateLocation = true"
        >
          Neuen Standort erstellen
        </UButton>

        <!-- View Toggle -->
        <div class="form-group">
          <UTabs
            v-model="activeTab"
            :items="tabItems"
            :content="false"
            class="w-full"
          />
        </div>

        <!-- Map View -->
        <div v-if="activeTab === 'map'">
          <LocationMap
            :locations="locations"
            :pending="pending"
            height="500px"
            empty-state-title="Keine Standorte vorhanden"
            empty-state-description="Erstellen Sie Ihren ersten Standort, um ihn auf der Karte zu sehen."
            :show-edit-button="true"
            @edit-location="editLocation"
          />
        </div>

        <!-- List View -->
        <div v-else-if="activeTab === 'list'" class="space-y-4">
          <!-- Search input -->
          <div class="form-group">
            <UInput
              v-model="searchQuery"
              placeholder="Standorte durchsuchen..."
              icon="i-heroicons-magnifying-glass"
              size="lg"
              class="w-full"
            >
              <template v-if="searchQuery.trim()" #trailing>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  size="xs"
                  @click="searchQuery = ''"
                />
              </template>
            </UInput>
          </div>

          <!-- Loading state -->
          <div v-if="pending" class="flex items-center justify-center py-8">
            <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
            <span class="ml-2">Standorte werden geladen...</span>
          </div>
          <!-- Error state -->
          <div v-else-if="error" class="py-8 text-center">
            <p class="text-error">Fehler beim Laden der Standorte</p>
            <UButton color="neutral" variant="outline" @click="refresh()">
              Erneut versuchen
            </UButton>
          </div>

          <!-- Locations list -->
          <div
            v-else-if="filteredLocations && filteredLocations.length > 0"
            class="space-y-4"
          >
            <h3 class="text-lg font-semibold">
              {{
                searchQuery.trim()
                  ? `Gefundene Standorte (${filteredLocations.length})`
                  : "Vorhandene Standorte"
              }}
            </h3>
            <div class="space-y-2">
              <UCard
                v-for="location in filteredLocations"
                :key="location.id"
                class="hover:bg-accented cursor-pointer transition-colors"
                @click="editLocation(location)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <h4 class="text-xl">{{ location.name }}</h4>
                    </div>
                    <p v-if="location.address" class="text-muted pt-2 text-sm">
                      {{ location.address }}
                    </p>
                    <div
                      class="mt-2 flex w-full items-center justify-between gap-2"
                    >
                      <div class="flex items-center gap-2">
                        <UBadge
                          color="neutral"
                          size="md"
                          :variant="
                            location.articleCount && location.articleCount > 0
                              ? 'solid'
                              : 'outline'
                          "
                        >
                          {{ location.articleCount || 0 }} Artikel
                        </UBadge>
                        <UBadge
                          v-if="location.isStorageLocation"
                          color="primary"
                          size="md"
                        >
                          Lagerstandort
                        </UBadge>
                      </div>
                      <UButton
                        color="error"
                        variant="outline"
                        icon="i-heroicons-trash"
                        @click.stop="deleteLocation(location)"
                      >
                        Löschen
                      </UButton>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-else-if="
              locations &&
              locations.length > 0 &&
              filteredLocations.length === 0
            "
            class="py-8 text-center"
          >
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="mx-auto mb-4 h-12 w-12 text-gray-400"
            />
            <h3 class="mb-2 text-lg font-semibold">Keine Standorte gefunden</h3>
            <p class="text-muted">
              Keine Standorte entsprechen Ihrer Suche "{{ searchQuery }}".
            </p>
          </div>

          <!-- No locations at all -->
          <div v-else-if="!pending && !error" class="py-8 text-center">
            <UIcon
              name="i-heroicons-map-pin"
              class="mx-auto mb-4 h-12 w-12 text-gray-400"
            />
            <h3 class="mb-2 text-lg font-semibold">
              Keine Standorte vorhanden
            </h3>
            <p class="text-muted">
              Erstellen Sie Ihren ersten Standort, um zu beginnen.
            </p>
          </div>
        </div>
        <!-- End of List View -->
      </div>
    </template>
    <slot></slot>
  </USlideover>

  <!-- Create Location Slideover -->
  <CreateLocationSlideover
    v-model:open="showCreateLocation"
    @location-created="handleLocationCreated"
  />

  <!-- Edit Location Slideover -->
  <EditLocationSlideover
    v-model:open="showEditLocation"
    :location="selectedLocation"
    @location-updated="handleLocationUpdated"
  />
</template>

<script setup lang="ts">
import type { Location } from "@/composables/articles/types";
import type { TabsItem } from "@nuxt/ui";
import { errorMap } from "@/composables/useFriendlyError";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
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

// Component state
const showCreateLocation = ref(false);
const showEditLocation = ref(false);
const selectedLocation = ref<Location | null>(null);
const searchQuery = ref("");
const activeTab = ref("list");

// Tab configuration
const tabItems: TabsItem[] = [
  {
    value: "list",
    label: "Liste",
    icon: "i-heroicons-list-bullet",
  },
  {
    value: "map",
    label: "Karte",
    icon: "i-heroicons-map",
  },
];

// Fetch locations data
const {
  data: locations,
  pending,
  error,
  refresh,
} = await useLazyFetch<Location[]>("/api/locations/getAll", {
  key: "LocationManagementData",
  server: false,
  default: () => [],
});

// Filtered locations based on search query
const filteredLocations = computed(() => {
  if (!locations.value || !searchQuery.value.trim()) {
    return locations.value || [];
  }

  const query = searchQuery.value.toLowerCase();
  return locations.value.filter(
    (location) =>
      location.name.toLowerCase().includes(query) ||
      (location.address && location.address.toLowerCase().includes(query)),
  );
});

// Handle location creation
function handleLocationCreated(newLocation: Location) {
  toast.add({
    title: "Standort erstellt",
    description: `Standort "${newLocation.name}" wurde erfolgreich erstellt.`,
    color: "success",
    icon: "i-heroicons-check-circle",
  });
  // Refresh the locations list
  refresh();
}

// Watch for component open state to refresh data
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      refresh();
    }
  },
);

function editLocation(location: Location) {
  selectedLocation.value = location;
  showEditLocation.value = true;
}

// Handle location update
function handleLocationUpdated(_updatedLocation: Location) {
  // Refresh the locations list to reflect changes
  refresh();
  selectedLocation.value = null;
}

// Handle location deletion
async function deleteLocation(location: Location) {
  // Show confirmation dialog
  const confirmed = confirm(
    `Sind Sie sicher, dass Sie den Standort "${location.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`,
  );

  if (!confirmed) return;

  try {
    await $fetch(`/api/locations/${location.id}/delete`, {
      method: "DELETE",
    });

    toast.add({
      title: "Standort gelöscht",
      description: `Standort "${location.name}" wurde erfolgreich gelöscht.`,
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    // Refresh the locations list
    refresh();
  } catch (error: unknown) {
    console.error("Error deleting location:", error);

    // Use friendly error mapping
    const friendlyError = errorMap(error);

    toast.add({
      title: friendlyError.title || "Fehler beim Löschen",
      description:
        friendlyError.description ||
        "Der Standort konnte nicht gelöscht werden.",
      color: friendlyError.color || "error",
      icon: friendlyError.icon || "i-heroicons-exclamation-triangle",
    });
  }
}
</script>
