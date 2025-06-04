<template>
  <h1 class="my-5 text-center text-3xl font-bold">Artikel einlagern</h1>
  <!-- Project Selection -->
  <UCard class="shadow-sm">
    <template #header>
      <h2 class="text-xl font-semibold">Projekt auswählen</h2>
    </template>

    <div
      v-if="!loadingProjects && projects.length === 0"
      class="py-8 text-center"
    >
      <UIcon
        name="i-heroicons-folder-plus"
        class="mx-auto mb-4 h-12 w-12 text-gray-400"
      />
      <h3 class="mb-2 text-lg font-medium">Keine Projekte vorhanden</h3>
      <p class="mb-4">
        Es sind noch keine Projekte in der Datenbank vorhanden.
      </p>
    </div>

    <USelectMenu
      v-else
      v-model="selectedProject"
      :items="projects"
      labelKey="name"
      placeholder="Wählen Sie ein Projekt..."
      searchable
      class="w-full max-w-md"
      :loading="loadingProjects"
    />
  </UCard>

  <!-- QR Code Scanner Integration -->
  <UAlert
    v-if="ScannedQrCodes.length > 0"
    color="primary"
    variant="subtle"
    :title="`${ScannedQrCodes.length} gescannte QR Codes`"
  >
    <template #description>
      <div class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="code in ScannedQrCodes"
            :key="code"
            :label="code"
            color="primary"
            variant="subtle"
          />
        </div>
        <div class="flex gap-2">
          <UButton
            @click="addScannedToSelection"
            color="primary"
            :disabled="ScannedQrCodes.length === 0"
            icon="i-heroicons-plus"
            size="sm"
          >
            Zur Auswahl hinzufügen
          </UButton>
          <UButton
            @click="clearScannedCodes"
            color="neutral"
            variant="outline"
            icon="i-heroicons-trash"
            size="sm"
          >
            Codes löschen
          </UButton>
        </div>
      </div>
    </template>
  </UAlert>

  <!-- Articles Table -->
  <UCard v-if="selectedProject" class="shadow-sm">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Ausgelagerte Artikel</h2>
        <div class="flex gap-2">
          <UButton
            @click="selectAll"
            variant="outline"
            size="sm"
            :disabled="!deployedArticles.length"
          >
            Alle auswählen
          </UButton>
          <UButton
            @click="deselectAll"
            variant="outline"
            size="sm"
            :disabled="selectedArticles.length === 0"
          >
            Auswahl aufheben
          </UButton>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <UCard class="p-4">
          <p class="text-sm">Gesamt ausgelagert</p>
          <p class="text-2xl font-bold">{{ deployedArticles.length }}</p>
        </UCard>
        <UCard class="border-default border p-4">
          <p class="text-sm">Ausgewählt</p>
          <p class="text-2xl font-bold">
            {{ selectedArticles.length }}
          </p>
        </UCard>
        <UCard class="p-4">
          <p class="text-sm">Standorte</p>
          <p class="text-2xl font-bold">
            {{ uniqueLocations.length }}
          </p>
        </UCard>
      </div>
    </template>

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
    <div v-else class="divide-y">
      <div
        v-for="location in groupedArticles"
        :key="location.locationName"
        class="p-6"
      >
        <!-- Location Header -->
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-map-pin" class="h-5 w-5" />
            <h3 class="text-lg font-semibold">{{ location.locationName }}</h3>
            <UBadge
              :label="`${location.articles.length} Artikel`"
              color="neutral"
            />
          </div>
          <UButton
            @click="selectLocationArticles(location.locationName)"
            variant="outline"
            size="sm"
            :disabled="isLocationFullySelected(location.locationName)"
          >
            Alle von hier
          </UButton>
        </div>

        <!-- Articles by Type within Location -->
        <div class="space-y-4">
          <div
            v-for="typeGroup in location.typeGroups"
            :key="typeGroup.type"
            class="border-default overflow-hidden rounded-md border"
          >
            <!-- Type Header -->
            <div class="px-4 py-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon :name="getTypeIcon(typeGroup.type)" class="h-4 w-4" />
                  <span class="font-medium">{{ typeGroup.type }}</span>
                  <UBadge
                    :label="`${typeGroup.articles.length}`"
                    color="neutral"
                    size="sm"
                  />
                </div>
                <UButton
                  @click="
                    selectTypeArticles(location.locationName, typeGroup.type)
                  "
                  variant="ghost"
                  size="sm"
                  :disabled="
                    isTypeFullySelected(location.locationName, typeGroup.type)
                  "
                >
                  Alle auswählen
                </UButton>
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
                      Artikel-Nr.
                    </th>
                    <th class="px-4 py-3 text-left text-sm font-medium">Typ</th>
                    <th class="px-4 py-3 text-left text-sm font-medium">
                      Länge (m)
                    </th>
                    <th class="px-4 py-3 text-left text-sm font-medium">
                      Anschluss
                    </th>
                    <th class="px-4 py-3 text-left text-sm font-medium">
                      Tags
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
                        @update:model-value="toggleArticleSelection(article.id)"
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
                      {{ article.lengthInMeter }}
                    </td>
                    <td class="px-4 py-3 text-sm">
                      {{ article.connector || "-" }}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-1">
                        <UBadge
                          v-for="tag in article.tags"
                          :key="tag"
                          :label="tag"
                          color="neutral"
                          size="sm"
                          variant="subtle"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>

  <!-- Action Buttons -->
  <UCard
    v-if="selectedArticles.length > 0"
    class="border-default fixed bottom-24 left-1/2 z-10 -translate-x-1/2 transform rounded-md border px-2 py-2 shadow-lg"
  >
    <div class="flex items-center gap-4">
      <span class="text-sm font-medium">
        {{ selectedArticles.length }} Artikel ausgewählt
      </span>
      <UButton
        @click="bringBackSelected"
        color="primary"
        size="lg"
        :loading="bringingBack"
        :disabled="selectedArticles.length === 0"
        icon="i-heroicons-archive-box-arrow-down"
      >
        Einlagern
      </UButton>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import type {
  Article,
  Project,
  Connector,
  Type,
  Tag,
} from "@/composables/articles/types";
import { useBringBack } from "@/composables/articles/useBringBack";

interface GroupedByLocation {
  locationName: string;
  articles: Article[];
  typeGroups: { type: Type; articles: Article[] }[];
}

// State
const selectedProject = ref<any>(null);
const selectedArticles = ref<string[]>([]);
const projects = ref<Project[]>([]);
const deployedArticles = ref<Article[]>([]);
const loadingProjects = ref(false);
const loadingArticles = ref(false);
const bringingBack = ref(false);

// External state
const toast = useToast();
const ScannedQrCodes = useState("ScannedQrCodes", () => []);
const selectedQrCodes = useState("selectedQrCodes", () => []);

// Use composable for selection logic
const {
  isArticleSelected,
  toggleArticleSelection,
  selectAll,
  deselectAll,
  selectLocationArticles,
  selectTypeArticles,
  isLocationFullySelected,
  isTypeFullySelected,
  isTypePartiallySelected,
  toggleTypeSelection,
} = useBringBack(deployedArticles, selectedArticles);

// Computed
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

// API Methods
const fetchProjects = async () => {
  loadingProjects.value = true;
  try {
    const response = await $fetch<Project[]>("/api/projects/getAll");
    projects.value = response;
  } catch (error) {
    console.error("Error fetching projects:", error);
  } finally {
    loadingProjects.value = false;
  }
};

const fetchDeployedArticles = async () => {
  if (!selectedProject.value) return;

  loadingArticles.value = true;
  try {
    const response = await $fetch<Article[]>("/api/articles/getAll", {
      query: { projectId: selectedProject.value.id, inStorage: false },
    });
    deployedArticles.value = response;
    selectedArticles.value = [];
  } catch (error) {
    console.error("Error fetching articles:", error);
    deployedArticles.value = [];
  } finally {
    loadingArticles.value = false;
    console.log(
      selectedProject.value.id,
      "articles fetched:",
      deployedArticles.value,
    );
  }
};

// Utility Methods
const getTypeIcon = (type: Type): string => {
  const icons: Record<Type, string> = {
    Kabel: "ic:baseline-cable",
    Verlängerung: "ic:baseline-extension",
    Verteiler: "ic:baseline-distribution",
    Box: "ic:baseline-box",
    Kabelrolle: "ic:baseline-cable-reel",
    Steckerleiste: "ic:baseline-power-strip",
  };
  return icons[type] || "ic:baseline-box";
};

// QR Code Methods
const addScannedToSelection = () => {
  ScannedQrCodes.value.forEach((code) => {
    if (!selectedArticles.value.includes(code)) {
      selectedArticles.value.push(code);
    }
  });
  clearScannedCodes();
};

const clearScannedCodes = () => {
  ScannedQrCodes.value = [];
  selectedQrCodes.value = [];
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
    selectedArticles.value = [];
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
  if (selectedProject.value) {
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
