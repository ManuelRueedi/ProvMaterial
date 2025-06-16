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
      <h2>Projekte erstellen und bearbeiten</h2>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Create new project button -->
        <UButton
          block
          color="primary"
          icon="i-heroicons-plus"
          @click="showCreateProject = true"
        >
          Neues Projekt erstellen
        </UButton>

        <!-- Search input -->
        <div class="form-group">
          <UInput
            v-model="searchQuery"
            placeholder="Projekte durchsuchen..."
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
          <span class="ml-2">Projekte werden geladen...</span>
        </div>
        <!-- Error state -->
        <div v-else-if="error" class="py-8 text-center">
          <p class="text-error">Fehler beim Laden der Projekte</p>
          <UButton color="neutral" variant="outline" @click="refresh()">
            Erneut versuchen
          </UButton>
        </div>

        <!-- Projects list -->
        <div
          v-else-if="filteredProjects && filteredProjects.length > 0"
          class="space-y-4"
        >
          <h3 class="text-lg font-semibold">
            {{
              searchQuery.trim()
                ? `Gefundene Projekte (${filteredProjects.length})`
                : "Vorhandene Projekte"
            }}
          </h3>
          <div class="space-y-2">
            <UCard
              v-for="project in filteredProjects"
              :key="project.id"
              class="hover:bg-accented cursor-pointer transition-colors"
              @click="editProject(project)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h4 class="font-medium">{{ project.name }}</h4>
                  <p v-if="project.description" class="text-sm">
                    {{ project.description }}
                  </p>
                </div>
                <UButton
                  color="error"
                  variant="outline"
                  icon="i-heroicons-trash"
                  @click.stop="deleteProject(project)"
                >
                  Löschen
                </UButton>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Empty search results -->
        <div
          v-else-if="
            projects && projects.length > 0 && filteredProjects.length === 0
          "
          class="py-8 text-center"
        >
          <UIcon
            name="i-heroicons-magnifying-glass"
            class="mx-auto mb-4 h-12 w-12 text-gray-400"
          />
          <h3 class="mb-2 text-lg font-semibold">Keine Projekte gefunden</h3>
          <p class="text-gray-500">
            Keine Projekte entsprechen Ihrer Suche "{{ searchQuery }}".
          </p>
        </div>

        <!-- No projects at all -->
        <div v-else-if="!pending && !error" class="py-8 text-center">
          <UIcon
            name="i-heroicons-folder"
            class="mx-auto mb-4 h-12 w-12 text-gray-400"
          />
          <h3 class="mb-2 text-lg font-semibold">Keine Projekte vorhanden</h3>
          <p class="text-gray-500">
            Erstellen Sie Ihr erstes Projekt, um zu beginnen.
          </p>
        </div>
      </div>
    </template>
    <slot></slot>
  </USlideover>

  <!-- Create Project Slideover -->
  <CreateProjectSlideover
    v-model:open="showCreateProject"
    @project-created="handleProjectCreated"
  />

  <!-- Edit Project Slideover -->
  <EditProjectSlideover
    v-model:open="showEditProject"
    :project="selectedProject"
    @project-updated="handleProjectUpdated"
  />
</template>

<script setup lang="ts">
import type { Project } from "@/composables/articles/types";
import { errorMap } from "@/composables/useFriendlyError";

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "project-created": [project: Project];
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
const showCreateProject = ref(false);
const showEditProject = ref(false);
const selectedProject = ref<Project | null>(null);
const searchQuery = ref("");

// Fetch projects data
const {
  data: projects,
  pending,
  error,
  refresh,
} = useFetch<Project[]>("/api/projects/getAll", {
  key: "ProjectManagementData",
  lazy: true,
  server: false,
  default: () => [],
});

// Filtered projects based on search query
const filteredProjects = computed(() => {
  if (!projects.value || !searchQuery.value.trim()) {
    return projects.value || [];
  }

  const query = searchQuery.value.toLowerCase();
  return projects.value.filter(
    (project) =>
      project.name.toLowerCase().includes(query) ||
      (project.description &&
        project.description.toLowerCase().includes(query)),
  );
});

// Handle project creation
function handleProjectCreated(newProject: Project) {
  // Refresh the projects list
  refresh();
  // Emit event to parent component for global refresh
  emit("project-created", newProject);
}

// Handle project editing
function editProject(project: Project) {
  selectedProject.value = project;
  showEditProject.value = true;
}

// Handle project update
function handleProjectUpdated(_updatedProject: Project) {
  // Refresh the projects list to reflect changes
  refresh();
  selectedProject.value = null;
}

// Handle project deletion
async function deleteProject(project: Project) {
  // Show confirmation dialog
  const confirmed = confirm(
    `Sind Sie sicher, dass Sie das Projekt "${project.name}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`,
  );

  if (!confirmed) return;

  try {
    await $fetch(`/api/projects/${project.id}/delete`, {
      method: "DELETE",
    });

    toast.add({
      title: "Projekt gelöscht",
      description: `Projekt "${project.name}" wurde erfolgreich gelöscht.`,
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    // Refresh the projects list
    refresh();
  } catch (error: unknown) {
    console.error("Error deleting project:", error);

    // Use friendly error mapping
    const friendlyError = errorMap(error);

    toast.add({
      title: friendlyError.title || "Fehler beim Löschen",
      description:
        friendlyError.description ||
        "Das Projekt konnte nicht gelöscht werden.",
      color: friendlyError.color || "error",
      icon: friendlyError.icon || "i-heroicons-exclamation-triangle",
    });
  }
}
</script>
