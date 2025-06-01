<template>
  <USlideover
    :close="{
      color: 'primary',
      variant: 'solid',
      size: 'xl',
    }"
    :side="isDesktop ? 'right' : 'bottom'"
    v-model:open="open"
    :ui="{
      title: 'text-center text-3xl font-bold',
      description: 'text-center text-2xl ',
      header: 'justify-center py-7',
      body: 'flex flex-col gap-5',
    }"
  >
    <template #title>
      <h1>Austragen</h1>
    </template>
    <template #description>
      <h2>
        {{ article?.number }}
      </h2>
    </template>
    <template #body>
      <div class="flex flex-row justify-center gap-1">
        <USelectMenu
          class="w-4/4"
          size="lg"
          :items="projects"
          labelKey="name"
          :loading="projectsPending"
          v-model="selectedProject"
          placeholder="Projekt"
        >
        </USelectMenu>
        <UButton class="ml-2 justify-center p-2" color="neutral">
          Hinzufügen
        </UButton>
      </div>
      <div v-if="selectedProject">
        {{ selectedProject.description }}
      </div>

      <div class="flex flex-row justify-center gap-1">
        <USelectMenu
          class="w-3/4"
          size="lg"
          :items="locations"
          labelKey="name"
          :loading="locationsPending"
          v-model="selectedLocation"
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

        <CreateLocationSlideover v-model:open="openCreateLocation">
        </CreateLocationSlideover>
      </div>
      <div v-if="selectedLocation">
        {{ selectedLocation.address }}
      </div>
      <UButton
        size="xl"
        :disabled="selectedLocation === undefined"
        @click="handleTakeOut"
        class="mt-6 flex w-full justify-center"
        >Austragen
      </UButton>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
const { isDesktop } = useDevice();

interface Article {
  number: string;
  type: string;
}

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

const props = defineProps<{
  article?: Article | null;
}>();

const open = defineModel<boolean>("open", { required: true });

const emit = defineEmits<{
  takeOut: [articleId: string, locationId: number, projectId?: number];
}>();

const openCreateLocation = ref(false);

const { data: projects, pending: projectsPending } = await useFetch<Project[]>(
  "/api/projects/getAll",
  { lazy: true },
);

const { data: locations, pending: locationsPending } = await useFetch<
  Location[]
>("/api/locations/getAll", { lazy: true });

const selectedProject = ref<Project>();
const selectedLocation = ref<Location>();

async function handleTakeOut() {
  if (!props.article || !selectedLocation.value) return;

  emit(
    "takeOut",
    props.article.number,
    selectedLocation.value.id,
    selectedProject.value?.id,
  );

  // Reset form
  selectedProject.value = undefined;
  selectedLocation.value = undefined;
  open.value = false;
}

// Reset form when component is closed
watch(open, (newValue) => {
  if (!newValue) {
    selectedProject.value = undefined;
    selectedLocation.value = undefined;
  }
});
</script>
