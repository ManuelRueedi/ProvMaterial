<template>
  <h1 class="my-5 text-center text-3xl font-bold">Einlagern</h1>

  <!-- Scanned Articles Integration -->
  <UCard
    v-if="transformedScannedArticles.length > 0"
    class="border shadow-lg"
    variant="outline"
  >
    <template #header>
      <div class="flex items-center justify-center gap-3">
        <UIcon name="i-heroicons-qr-code" :size="30" />
        <h1 class="text-lg font-semibold">Gescannte Artikel</h1>
      </div>
    </template>
    <UTable
      :ui="{
        td: 'px-4 py-3 text-sm text-default',
      }"
      :columns="scannedArticlesColumns"
      :data="transformedScannedArticles"
    />
    <div class="mt-4 flex justify-center">
      <UButton
        variant="outline"
        color="primary"
        size="lg"
        :disabled="transformedScannedArticles.length === 0"
        @click="addScannedToSelection"
      >
        {{ transformedScannedArticles.length }} Artikel zur Auswahl hinzufügen
      </UButton>
    </div>
  </UCard>

  <!-- Project Selection -->
  <UCard class="mb-4 shadow-sm">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Projekt auswählen</h2>
        <UButton
          variant="ghost"
          size="lg"
          icon="i-heroicons-arrow-path"
          :loading="loadingProjects"
          @click="fetchProjects"
        >
          Aktualisieren
        </UButton>
      </div>
    </template>

    <!-- No Projects with Articles Message -->
    <div
      v-if="!loadingProjects && projects.length === 0"
      class="p-8 text-center"
    >
      <UIcon
        name="i-heroicons-folder-open"
        class="mx-auto h-12 w-12 text-gray-400"
      />
      <h3 class="mt-2 text-lg font-medium">
        Keine Projekte mit ausgelagerten Artikeln
      </h3>
      <p class="text-muted">
        Derzeit sind keine Projekte mit ausgelagerten Artikeln vorhanden. Lagern
        Sie zunächst Artikel aus, bevor Sie sie wieder einlagern können.
      </p>
    </div>

    <!-- Project Selection -->
    <USelectMenu
      v-else
      :model-value="displaySelectedProject"
      :items="projectSelectItems"
      label-key="name"
      placeholder="Wählen Sie ein Projekt..."
      searchable
      class="w-full max-w-md"
      :loading="loadingProjects"
      @update:model-value="handleProjectSelection"
    />
  </UCard>

  <!-- Articles Interface -->
  <UCard v-if="selectedProject !== undefined" class="shadow-sm">
    <template #header>
      <div class="flex flex-col items-center justify-between">
        <h2 class="pt-4 pb-2 text-2xl font-semibold">
          {{
            deployedArticles.length === 1
              ? "Ein Ausgelagerter Artikel"
              : `${deployedArticles.length} Ausgelagerte Artikel`
          }}
        </h2>
        <h3 class="text-md pb-3 font-medium">
          {{
            uniqueLocations.length === 1
              ? "An einem Standort"
              : `An ${uniqueLocations.length} Standorten`
          }}
        </h3>
        <div class="flex gap-2">
          <UButton
            variant="outline"
            size="md"
            :disabled="!deployedArticles.length"
            @click="selectAll"
          >
            Alle auswählen
          </UButton>
          <UButton
            variant="outline"
            size="md"
            :disabled="selectedArticles.length === 0"
            @click="deselectAll"
          >
            Auswahl aufheben
          </UButton>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mt-6">
        <UTabs v-model="activeTab" :items="tabItems" />
      </div>
    </template>

    <!-- Tab Content -->
    <div class="mt-4 mb-10">
      <!-- Table View -->
      <div v-if="activeTab === 'table'">
        <!-- Loading State -->
        <div v-if="loadingArticles" class="p-8 text-center">
          <UIcon
            name="i-heroicons-arrow-path"
            class="mx-auto h-8 w-8 animate-spin"
          />
          <p class="mt-2">Artikel werden geladen...</p>
        </div>

        <!-- No Articles -->
        <div v-else-if="!deployedArticles.length" class="p-8 text-center">
          <UIcon name="i-heroicons-inbox" class="mx-auto h-12 w-12" />
          <h3 class="mt-2 text-lg font-medium">Keine ausgelagerten Artikel</h3>
          <p class="text-muted">
            Für das ausgewählte Projekt sind derzeit keine Artikel ausgelagert.
          </p>
        </div>

        <!-- Articles by Location and Type -->
        <div v-else>
          <div
            v-for="location in groupedArticles"
            :key="location.locationName"
            class="p-6"
          >
            <!-- Location Header -->
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <UIcon name="i-heroicons-map-pin" class="h-5 w-5" />
                <h3 class="text-lg font-semibold">
                  {{ location.locationName }}
                </h3>
                <UBadge
                  size="md"
                  :label="`${location.articles.length} Artikel`"
                  color="neutral"
                />
              </div>
              <UButton
                variant="outline"
                size="md"
                :disabled="isLocationFullySelected(location.locationName)"
                @click="selectLocationArticles(location.locationName)"
              >
                Alle von hier
              </UButton>
            </div>

            <!-- Articles by Type within Location -->
            <div class="w-full">
              <div
                v-for="typeGroup in location.typeGroups"
                :key="typeGroup.type"
                class="border-default overflow-hidden rounded-md border"
              >
                <!-- Type Header -->
                <div class="border-b px-4 py-3">
                  <div class="flex w-full items-center gap-2">
                    <UIcon
                      :name="getTypeIcon(typeGroup.type)"
                      class="h-4 w-4"
                    />
                    <span class="font-medium">{{ typeGroup.type }}</span>
                    <UBadge
                      :label="`${typeGroup.articles.length}`"
                      color="neutral"
                      size="sm"
                    />
                  </div>
                </div>

                <!-- Articles Table -->
                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead>
                      <tr>
                        <th class="w-12 px-4 py-3 text-left">
                          <UCheckbox
                            :model-value="
                              isTypeFullySelected(
                                location.locationName,
                                typeGroup.type,
                              )
                            "
                            :indeterminate="
                              isTypePartiallySelected(
                                location.locationName,
                                typeGroup.type,
                              )
                            "
                            @update:model-value="
                              toggleTypeSelection(
                                location.locationName,
                                typeGroup.type,
                              )
                            "
                          />
                        </th>
                        <th class="px-4 py-3 text-left text-sm font-medium">
                          Nr.
                        </th>
                        <th class="px-4 py-3 text-left text-sm font-medium">
                          Typ
                        </th>
                        <th class="px-4 py-3 text-left text-sm font-medium">
                          Länge
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-default divide-y">
                      <tr
                        v-for="article in typeGroup.articles"
                        :key="article.id"
                        class="cursor-pointer"
                        :class="{
                          'bg-elevated': isArticleSelected(article.id),
                        }"
                        @click="toggleArticleSelection(article.id)"
                      >
                        <td class="px-4 py-3">
                          <UCheckbox
                            :model-value="isArticleSelected(article.id)"
                            @update:model-value="
                              toggleArticleSelection(article.id)
                            "
                            @click.stop
                          />
                        </td>
                        <td class="px-4 py-3 font-mono text-sm">
                          {{ article.id }}
                        </td>
                        <td class="px-4 py-3 text-sm">
                          {{ article.type }}
                        </td>
                        <td class="px-4 py-3 text-sm">
                          {{ article.lengthInMeter }}m
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map View -->
      <div v-else-if="activeTab === 'map'">
        <!-- Loading State -->
        <div v-if="loadingArticles" class="p-8 text-center">
          <UIcon
            name="i-heroicons-arrow-path"
            class="mx-auto h-8 w-8 animate-spin"
          />
          <p class="mt-2">Artikel werden geladen...</p>
        </div>

        <!-- No Articles -->
        <div v-else-if="!deployedArticles.length" class="p-8 text-center">
          <UIcon name="i-heroicons-inbox" class="mx-auto h-12 w-12" />
          <h3 class="mt-2 text-lg font-medium">Keine ausgelagerten Artikel</h3>
          <p class="text-muted">
            Für das ausgewählte Projekt sind derzeit keine Artikel ausgelagert.
          </p>
        </div>

        <!-- Location Map -->
        <div v-else>
          <LocationMap
            :locations="locationsWithArticleCount"
            :pending="loadingArticles"
            height="500px"
            empty-state-title="Keine Standorte mit Artikeln"
            empty-state-description="Für das ausgewählte Projekt sind keine Artikel an Standorten ausgelagert."
            :show-create-button="false"
            :show-edit-button="false"
            :show-legend="false"
          />
        </div>
      </div>
    </div>
  </UCard>

  <!-- Action Buttons -->
  <UButton
    v-if="selectedArticles.length > 0"
    class="fixed bottom-24 left-1/2 z-10 -translate-x-1/2 transform shadow-2xl"
    color="primary"
    size="xl"
    :loading="bringingBack"
    :disabled="selectedArticles.length === 0"
    icon="i-heroicons-archive-box-arrow-down"
    @click="bringBackSelected"
  >
    {{ selectedArticles.length }} Artikel Einlagern
  </UButton>
</template>

<script lang="ts" setup>
import { resolveComponent } from "vue";
import type { Article, Project, Type } from "@/composables/articles/types";
import type { TabsItem } from "@nuxt/ui";
import { useBringBack } from "@/composables/articles/useBringBack";
import { useScannedArticles } from "@/composables/useScannedArticles";

interface GroupedByLocation {
  locationName: string;
  articles: Article[];
  typeGroups: { type: Type; articles: Article[] }[];
}

// State
const selectedProject = ref<Project | null | undefined>(undefined); // Allow null for "No Project" option
const selectedArticles = ref<string[]>([]);
const activeTab = ref("table");
const projects = ref<Project[]>([]);
const deployedArticles = ref<Article[]>([]);
const loadingProjects = ref(false);
const loadingArticles = ref(false);
const bringingBack = ref(false);

// Tab configuration
const tabItems: TabsItem[] = [
  {
    value: "table",
    label: "Liste",
    icon: "i-heroicons-list-bullet",
  },
  {
    value: "map",
    label: "Karte",
    icon: "i-heroicons-map",
  },
];

// External state
const toast = useToast();
const {
  selectedArticles: scannedSelectedArticles,
  deselectAll: clearScannedArticles,
} = useScannedArticles();

// Use composable for selection logic
const {
  isArticleSelected,
  toggleArticleSelection,
  selectAll,
  deselectAll,
  selectLocationArticles,
  isLocationFullySelected,
  isTypeFullySelected,
  isTypePartiallySelected,
  toggleTypeSelection,
} = useBringBack(deployedArticles, selectedArticles);

// Table columns for scanned articles
const UBadge = resolveComponent("UBadge");
const scannedArticlesColumns = [
  {
    accessorKey: "id",
    header: "Nummer",
  },
  {
    accessorKey: "type",
    header: "Typ",
  },
  {
    accessorKey: "lengthInMeter",
    header: "Länge",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) =>
      `${row.getValue("lengthInMeter")}m`,
  },
];

// Transform scanned articles for table display
const transformedScannedArticles = computed(() => {
  return scannedSelectedArticles.value
    .filter((article) => article.location?.id !== article.storageLocation.id)
    .map((article) => ({
      id: article.id,
      type: article.type,
      lengthInMeter: article.lengthInMeter,
    }));
});

// Computed
const projectSelectItems = computed(() => {
  // Return projects as they are - "No Project" option is now added conditionally in fetchProjects
  return [...projects.value];
});

const displaySelectedProject = computed(() => {
  if (selectedProject.value === null) {
    return {
      id: -1,
      name: "Kein Projekt (Artikel ohne Projektzuordnung)",
      description: "Zeigt alle ausgelagerten Artikel ohne Projektzuordnung an",
    } as Project;
  }
  return selectedProject.value;
});

const groupedArticles = computed<GroupedByLocation[]>(() => {
  const grouped = new Map<string, Article[]>();

  deployedArticles.value.forEach((article) => {
    if (!article.location) return; // Skip articles without location
    if (!grouped.has(article.location.name)) {
      grouped.set(article.location.name, []);
    }
    grouped.get(article.location.name)!.push(article);
  });

  return Array.from(grouped.entries())
    .map(([locationName, articles]) => {
      const typeGroups = new Map<Type, Article[]>();
      articles.forEach((article) => {
        if (!typeGroups.has(article.type)) {
          typeGroups.set(article.type, []);
        }
        typeGroups.get(article.type)!.push(article);
      });

      return {
        locationName,
        articles,
        typeGroups: Array.from(typeGroups.entries())
          .map(([type, typeArticles]) => ({
            type,
            articles: typeArticles.sort((a, b) => a.id.localeCompare(b.id)),
          }))
          .sort((a, b) => a.type.localeCompare(b.type)),
      };
    })
    .sort((a, b) => a.locationName.localeCompare(b.locationName));
});

const uniqueLocations = computed(() => [
  ...new Set(
    deployedArticles.value
      .filter((a) => a.location)
      .map((a) => a.location!.name),
  ),
]);

// Transform locations for map display with article counts
const locationsWithArticleCount = computed(() => {
  const locationCounts = new Map<string, number>();

  // Count articles per location
  deployedArticles.value.forEach((article) => {
    if (article.location) {
      const locationId = article.location.id.toString();
      locationCounts.set(locationId, (locationCounts.get(locationId) || 0) + 1);
    }
  });

  // Get unique locations and add article counts
  const uniqueLocationMap = new Map();
  deployedArticles.value.forEach((article) => {
    if (article.location) {
      const locationId = article.location.id.toString();
      if (!uniqueLocationMap.has(locationId)) {
        const location = {
          id: article.location.id,
          name: article.location.name,
          address: article.location.address,
          latitude: article.location.latitude,
          longitude: article.location.longitude,
          isStorageLocation: article.location.isStorageLocation,
          articleCount: locationCounts.get(locationId) || 0,
        };

        uniqueLocationMap.set(locationId, location);
      }
    }
  });

  const result = Array.from(uniqueLocationMap.values());
  return result;
});

// Project Selection Handler
const handleProjectSelection = (project: Project) => {
  if (project.id === -1) {
    selectedProject.value = null; // No project selected
  } else {
    selectedProject.value = project;
  }
};

// API Methods
const fetchProjects = async () => {
  loadingProjects.value = true;
  try {
    // Fetch only projects that have articles not in storage
    const response = await $fetch<Project[]>("/api/projects/getAll", {
      query: { hasDeployedArticles: true },
    });
    projects.value = response;

    // Check if there are articles without project assignment
    await checkNoProjectArticles();
  } catch (error) {
    console.error("Error fetching projects:", error);
  } finally {
    loadingProjects.value = false;
  }
};

const checkNoProjectArticles = async () => {
  try {
    const response = await $fetch<Article[]>("/api/articles/getAll", {
      query: { inStorage: false, noProject: "true" },
    });

    // If there are articles without project, add the "No Project" option to the list
    if (response.length > 0) {
      const noProjectOption = {
        id: -1,
        name: "Kein Projekt (Artikel ohne Projektzuordnung)",
        description:
          "Zeigt alle ausgelagerten Artikel ohne Projektzuordnung an",
      } as Project;

      // Check if "No Project" option is not already in the list
      if (!projects.value.some((p) => p.id === -1)) {
        projects.value.unshift(noProjectOption);
      }
    }
  } catch (error) {
    console.error("Error checking no project articles:", error);
  }
};

const fetchDeployedArticles = async () => {
  if (selectedProject.value === undefined) return;

  loadingArticles.value = true;
  try {
    const queryParams: {
      inStorage: boolean;
      projectId?: number;
      noProject?: string;
    } = {
      inStorage: false,
    };

    // If selectedProject is not null, add projectId to query
    if (selectedProject.value !== null) {
      queryParams.projectId = selectedProject.value.id;
    } else {
      // If selectedProject is null, we want articles without project assignment
      queryParams.noProject = "true";
    }

    const response = await $fetch<Article[]>("/api/articles/getAll", {
      query: queryParams,
    });
    deployedArticles.value = response;
    selectedArticles.value = [];
  } catch (error) {
    console.error("Error fetching articles:", error);
    deployedArticles.value = [];
  } finally {
    loadingArticles.value = false;
  }
};

// Utility Methods
const getTypeIcon = (type: Type): string => {
  const icons: Record<Type, string> = {
    Kabel: "ic:baseline-cable",
    Verlängerung: "ic:baseline-cable",
    Verteiler: "ic:baseline-call-split",
    Box: "ic:baseline-check-box-outline-blank",
    Kabelrolle: "ic:baseline-cable",
    Steckerleiste: "ic:baseline-outlet",
    Adapterkabel: "ic:baseline-cable",
  };
  return icons[type] || "ic:baseline-check-box-outline-blank";
};

// Scanned Articles Methods
const addScannedToSelection = () => {
  scannedSelectedArticles.value.forEach((article) => {
    if (!selectedArticles.value.includes(article.id)) {
      selectedArticles.value.push(article.id);
    }
  });
  clearScannedArticles();
};

// Main Action
const bringBackSelected = async () => {
  if (selectedArticles.value.length === 0) return;

  bringingBack.value = true;
  try {
    if (selectedArticles.value.length === 1) {
      await $fetch(
        `/api/articles/${encodeURIComponent(selectedArticles.value[0]!)}/bringBack`,
        { method: "PUT" as const, body: {} },
      );
    } else {
      await $fetch("/api/articles/bringBackMultiple", {
        method: "PUT" as const,
        body: { articleIds: selectedArticles.value },
      });
    }

    toast.add({
      title: "Artikel eingelagert",
      description: `${selectedArticles.value.length} Artikel erfolgreich eingelagert`,
      icon: "i-heroicons-check-circle",
      color: "success",
    });

    await fetchDeployedArticles();
    await fetchProjects(); // Refetch projects to update the list after bringing back articles
    selectedArticles.value = [];

    // If no more articles are deployed for the current project, reset selection
    if (deployedArticles.value.length === 0) {
      selectedProject.value = undefined;
    }
  } catch (error) {
    console.error("Error bringing back articles:", error);
    toast.add({
      title: "Fehler",
      description: "Fehler beim Einlagern der Artikel",
      icon: "i-heroicons-exclamation-triangle",
      color: "error",
    });
  } finally {
    bringingBack.value = false;
  }
};

// Watchers
watch(selectedProject, () => {
  if (selectedProject.value !== undefined) {
    fetchDeployedArticles();
  } else {
    deployedArticles.value = [];
    selectedArticles.value = [];
  }
});

// Lifecycle
onMounted(() => {
  fetchProjects();
});
</script>

<style scoped>
tr {
  transition: background-color 0.2s ease;
}
</style>
