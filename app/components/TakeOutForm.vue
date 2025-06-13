<template>
  <!-- Project Selection -->
  <div class="border-muted rounded-2xl border p-4 shadow-sm lg:p-8">
    <h3 class="mb-4 text-center text-xl font-semibold lg:mb-6 lg:text-2xl">
      Projekt
    </h3>
    <div class="mx-auto mb-3 flex flex-col items-center gap-4 lg:mb-6 lg:gap-6">
      <UInput
        v-model="formProjectSearchQuery"
        placeholder="Projekt suchen..."
        icon="i-heroicons-magnifying-glass"
        size="sm"
        class="w-full max-w-md shadow-lg lg:max-w-lg"
        :trailing-action="{
          icon: 'i-heroicons-x-mark',
          onClick: () => (formProjectSearchQuery = ''),
        }"
      />
      <span
        v-if="formProjectSearchQuery"
        class="justify-self-center text-xs lg:text-sm"
      >
        {{ filteredFormProjects.length }} von
        {{ projects?.length || 0 }} Projekten
      </span>
    </div>
    <div class="space-y-3 lg:space-y-4">
      <div
        class="border-default max-h-60 space-y-2 overflow-y-auto p-5 shadow-sm lg:max-h-80 lg:space-y-3 lg:p-6"
      >
        <div
          v-for="project in filteredFormProjects"
          :key="project.id"
          class="bg-elevated flex cursor-pointer items-center justify-between rounded-lg p-3 transition-all hover:shadow-sm lg:p-4"
          :class="{
            'border-primary bg-accented scale-[1.02] transform border-2 shadow-md':
              selectedProject?.id === project.id,
            'border-default border': selectedProject?.id !== project.id,
          }"
          @click="selectFormProject(project)"
        >
          <div class="flex-1">
            <div class="text-sm font-medium lg:text-base">
              {{ project.name }}
            </div>
            <div
              v-if="project.description"
              class="text-muted mt-1 text-sm lg:text-base"
            >
              {{ project.description }}
            </div>
          </div>
          <UIcon
            v-if="selectedProject?.id === project.id"
            name="i-heroicons-check-circle"
            class="text-primary ml-3 h-6 w-6 flex-shrink-0 lg:h-7 lg:w-7"
          />
        </div>
        <div
          v-if="!projectsPending && filteredFormProjects.length === 0"
          class="rounded-lg p-4 text-center text-sm lg:p-6 lg:text-base"
        >
          {{
            formProjectSearchQuery
              ? "Keine passenden Projekte gefunden"
              : "Keine Projekte vorhanden"
          }}
        </div>
      </div>
      <UButton
        class="w-full justify-center"
        color="neutral"
        size="lg"
        @click="openCreateProject = true"
      >
        Neues Projekt hinzufügen
      </UButton>
    </div>
  </div>

  <!-- Location Search -->
  <div class="border-muted rounded-2xl border p-4 shadow-sm lg:p-8">
    <h3 class="mb-4 text-center text-xl font-semibold lg:mb-6 lg:text-2xl">
      Standort
    </h3>
    <div class="mx-auto mb-3 flex flex-col items-center gap-4 lg:mb-6 lg:gap-6">
      <UInput
        v-model="locationSearchQuery"
        placeholder="Standort suchen..."
        icon="i-heroicons-magnifying-glass"
        size="sm"
        class="mb-2 w-full max-w-md shadow-lg lg:max-w-lg"
        :trailing-action="{
          icon: 'i-heroicons-x-mark',
          onClick: () => (locationSearchQuery = ''),
        }"
      />
      <span
        v-if="locationSearchQuery"
        class="justify-self-center text-xs lg:text-sm"
      >
        {{ filteredLocations.length }} von
        {{ locations?.length || 0 }} Standorten
      </span>
    </div>
    <UButton
      class="mb-5 w-full justify-center lg:mb-6"
      color="neutral"
      size="lg"
      @click="openCreateLocation = true"
    >
      Neuen Standort hinzufügen
    </UButton>

    <UTabs
      :items="[
        {
          key: 'form',
          label: 'Liste',
          icon: 'i-heroicons-list-bullet',
        },
        {
          key: 'map',
          label: 'Karte',
          icon: 'i-heroicons-map',
        },
      ]"
      class="w-full"
    >
      <template #content="{ item }">
        <div
          v-if="item.key === 'form'"
          class="flex flex-col gap-5 px-3 pt-4 lg:gap-6 lg:px-4 lg:pt-6"
        >
          <!-- Location List -->
          <div class="space-y-3 lg:space-y-4">
            <div
              class="border-default max-h-60 space-y-2 overflow-y-auto p-5 shadow-sm lg:max-h-80 lg:space-y-3 lg:p-6"
            >
              <div
                v-for="location in filteredLocations"
                :key="location.id"
                class="bg-elevated flex cursor-pointer items-center justify-between rounded-lg p-3 transition-all hover:shadow-sm lg:p-4"
                :class="{
                  'border-primary bg-accented scale-[1.02] transform border-2 shadow-md':
                    selectedLocation?.id === location.id,
                  'border-default border': selectedLocation?.id !== location.id,
                }"
                @click="selectFormLocation(location)"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium lg:text-base">
                    {{ location.name }}
                  </div>
                  <div
                    v-if="location.address"
                    class="text-muted mt-1 text-sm lg:text-base"
                  >
                    {{ location.address }}
                  </div>
                </div>
                <UIcon
                  v-if="selectedLocation?.id === location.id"
                  name="i-heroicons-check-circle"
                  class="text-primary ml-3 h-6 w-6 flex-shrink-0 lg:h-7 lg:w-7"
                />
              </div>
              <div
                v-if="!locationsPending && filteredLocations.length === 0"
                class="rounded-lg p-4 text-center text-sm lg:p-6 lg:text-base"
              >
                {{
                  locationSearchQuery
                    ? "Keine passenden Standorte gefunden"
                    : "Keine Standorte vorhanden"
                }}
              </div>
            </div>
          </div>

          <!-- Slideouts for creating new items -->
          <CreateLocationSlideover
            v-model:open="openCreateLocation"
            @location-created="handleLocationCreated"
          />

          <CreateProjectSlideover
            v-model:open="openCreateProject"
            @project-created="handleProjectCreated"
          />
        </div>

        <div
          v-else-if="item.key === 'map'"
          class="space-y-4 pt-4 lg:space-y-6 lg:pt-6"
        >
          <!-- Map -->
          <div class="space-y-3 lg:space-y-4">
            <div class="overflow-hidden rounded-lg shadow-sm">
              <LocationMap
                :locations="filteredLocations || []"
                :projects="projects || []"
                :pending="locationsPending"
                height="300px"
                mode="select"
                :show-select-button="true"
                :show-legend="false"
                :highlighted-location-id="selectedLocation?.id"
                :empty-state-title="
                  locationSearchQuery
                    ? 'Keine passenden Standorte gefunden'
                    : 'Keine Standorte vorhanden'
                "
                :empty-state-description="
                  locationSearchQuery
                    ? 'Versuchen Sie einen anderen Suchbegriff oder fügen Sie einen neuen Standort hinzu.'
                    : 'Fügen Sie Standorte hinzu, um sie hier zu sehen.'
                "
                @select-location="selectedLocation = $event"
              />
            </div>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
  <!-- Action Button -->
  <UButton
    size="xl"
    :disabled="!selectedLocation || disabled"
    class="mt-6 flex w-full justify-center py-3 text-base shadow-lg transition-shadow hover:shadow-xl lg:mt-8 lg:py-4 lg:text-lg"
    @click="handleTakeOut"
  >
    {{ buttonText || "Austragen" }}
  </UButton>
</template>

<script lang="ts" setup>
import LocationMap from "./LocationMap.vue";

interface Project {
  id: number;
  name: string;
  description?: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isStorageLocation: boolean;
}

interface Props {
  disabled?: boolean;
  buttonText?: string;
}

defineProps<Props>();

const emit = defineEmits<{
  takeOut: [locationId: number, projectId?: number];
}>();

const openCreateLocation = ref(false);
const openCreateProject = ref(false);

// Search queries
const locationSearchQuery = ref("");
const formProjectSearchQuery = ref("");

const {
  data: projects,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useFetch<Project[]>("/api/projects/getAll", { lazy: true });

const {
  data: locations,
  pending: locationsPending,
  refresh: refreshLocations,
} = await useFetch<Location[]>(
  "/api/locations/getAll?isStorageLocation=false",
  { lazy: true },
);

const selectedProject = ref<Project>();
const selectedLocation = ref<Location>();

// Computed properties for filtering
const filteredLocations = computed(() => {
  if (!locations.value) return [];
  if (!locationSearchQuery.value.trim()) return locations.value;

  const query = locationSearchQuery.value.toLowerCase().trim();
  return locations.value.filter(
    (location) =>
      location.name.toLowerCase().includes(query) ||
      location.address.toLowerCase().includes(query),
  );
});

const filteredFormProjects = computed(() => {
  if (!projects.value) return [];
  if (!formProjectSearchQuery.value.trim()) return projects.value;

  const query = formProjectSearchQuery.value.toLowerCase().trim();
  return projects.value.filter(
    (project) =>
      project.name.toLowerCase().includes(query) ||
      (project.description &&
        project.description.toLowerCase().includes(query)),
  );
});

async function handleTakeOut() {
  if (!selectedLocation.value) return;

  emit("takeOut", selectedLocation.value.id, selectedProject.value?.id);

  // Reset form
  selectedProject.value = undefined;
  selectedLocation.value = undefined;
}

// Selection functions for form tab
function selectFormProject(project: Project) {
  selectedProject.value = project;
}

function selectFormLocation(location: Location) {
  selectedLocation.value = location;
}

// Handle project creation and refresh the projects list
async function handleProjectCreated(newProject: Project) {
  await refreshProjects();
  selectedProject.value = newProject;
}

// Handle location creation and refresh the locations list
async function handleLocationCreated(newLocation: Location) {
  await refreshLocations();
  selectedLocation.value = newLocation;
}
</script>
