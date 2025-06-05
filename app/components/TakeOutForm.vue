<template>
  <div>
    <div class="flex flex-col gap-5 px-3">
      <div class="flex flex-row justify-center gap-1">
        <USelectMenu
          v-model="selectedProject"
          class="w-4/4"
          size="lg"
          :items="projects"
          label-key="name"
          :loading="projectsPending"
          placeholder="Projekt"
        >
        </USelectMenu>
        <UButton
          class="ml-2 justify-center p-2"
          color="neutral"
          @click="openCreateProject = true"
        >
          Hinzufügen
        </UButton>
      </div>
      <div v-if="selectedProject">
        {{ selectedProject.description }}
      </div>

      <div class="flex flex-row justify-center gap-1">
        <USelectMenu
          v-model="selectedLocation"
          class="w-3/4"
          size="lg"
          :items="locations"
          label-key="name"
          :loading="locationsPending"
          placeholder="Standort"
        >
        </USelectMenu>
        <UButton
          class="ml-2 justify-center p-2"
          color="neutral"
          @click="openCreateLocation = true"
        >
          Hinzufügen
        </UButton>

        <CreateLocationSlideover
          v-model:open="openCreateLocation"
          @location-created="handleLocationCreated"
        >
        </CreateLocationSlideover>

        <CreateProjectSlideover
          v-model:open="openCreateProject"
          @project-created="handleProjectCreated"
        >
        </CreateProjectSlideover>
      </div>
      <div v-if="selectedLocation">
        {{ selectedLocation.address }}
      </div>

      <UButton
        size="xl"
        :disabled="!selectedLocation || disabled"
        class="mt-6 flex w-full justify-center"
        @click="handleTakeOut"
      >
        {{ buttonText || "Austragen" }}
      </UButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Project {
  id: number;
  name: string;
  description: string;
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

const {
  data: projects,
  pending: projectsPending,
  refresh: refreshProjects,
} = await useFetch<Project[]>("/api/projects/getAll", { lazy: true });

const {
  data: locations,
  pending: locationsPending,
  refresh: refreshLocations,
} = await useFetch<Location[]>("/api/locations/getAll", { lazy: true });

const selectedProject = ref<Project>();
const selectedLocation = ref<Location>();

async function handleTakeOut() {
  if (!selectedLocation.value) return;

  emit("takeOut", selectedLocation.value.id, selectedProject.value?.id);

  // Reset form
  selectedProject.value = undefined;
  selectedLocation.value = undefined;
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
