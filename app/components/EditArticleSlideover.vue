<template>
  <USlideover
    :open="localOpen"
    :side="isDesktop ? 'right' : 'bottom'"
    :ui="slideoverUi"
    :close="slideoverClose"
    @update:open="localOpen = $event"
  >
    <template #title>
      <h1>Bearbeiten</h1>
    </template>
    <template #description>
      <h2>
        {{ articleId ? `Artikel: ${articleId}` : "Artikeldaten bearbeiten" }}
      </h2>
    </template>

    <template #body>
      <div v-if="isLoading" class="flex items-center justify-center">
        <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
        <span class="ml-2">Artikel wird geladen...</span>
      </div>

      <div v-else-if="loadError" class="py-8 text-center">
        <p class="text-red-500">{{ loadError }}</p>
        <UButton class="mt-4" @click="loadArticleData">
          Erneut versuchen
        </UButton>
      </div>

      <div v-else class="space-y-10">
        <!-- Article ID Field (Read-only for editing) -->
        <div>
          <labeledInput
            :model-value="articleId"
            icon="i-lucide-id-card"
            badge-color="neutral"
            :disabled="true"
            placeholder=""
          >
            Artikel-ID
          </labeledInput>
          <p class="mt-2 px-4 text-xs text-gray-500">
            Die Artikel-ID kann nicht geändert werden
          </p>
        </div>

        <!-- Article Type Field -->
        <div>
          <labeledSelection
            v-model="config.type"
            :items="typeOptions"
            icon="i-lucide-package"
            :badge-color="validationErrors.type ? 'error' : 'primary'"
            placeholder="Typ auswählen"
            searchable
            @update:model-value="validateType"
          >
            Typ <span class="text-red-500">*</span>
          </labeledSelection>
          <p
            v-if="validationErrors.type"
            class="mt-2 px-4 text-xs text-red-500"
          >
            {{ validationErrors.type }}
          </p>
        </div>

        <!-- Ampacity Field -->
        <div>
          <labeledSelection
            v-model="ampacityModel"
            :items="ampacityOptions"
            icon="i-lucide-zap"
            :badge-color="validationErrors.ampacity ? 'error' : 'warning'"
            placeholder="Stromstärke auswählen"
            @update:model-value="validateAmpacity"
          >
            Stromstärke <span class="text-red-500">*</span>
          </labeledSelection>
          <p
            v-if="validationErrors.ampacity"
            class="mt-2 px-4 text-xs text-red-500"
          >
            {{ validationErrors.ampacity }}
          </p>
        </div>

        <!-- Length Field -->
        <div>
          <labeledNumberInput
            v-model="config.length"
            icon="i-lucide-ruler"
            placeholder="z.B. 10"
            :status="validationErrors.lengthInMeter ? 'error' : undefined"
            :badge-color="validationErrors.lengthInMeter ? 'error' : 'info'"
            :min="0"
            :step="0.5"
          >
            Länge in Metern
          </labeledNumberInput>
          <p
            v-if="validationErrors.lengthInMeter"
            class="mt-2 px-4 text-xs text-red-500"
          >
            {{ validationErrors.lengthInMeter }}
          </p>
        </div>

        <!-- Connector Field (Optional) -->
        <div>
          <labeledSelection
            v-model="connectorModel"
            :items="connectorOptions"
            icon="i-lucide-plug"
            badge-color="secondary"
            placeholder="Stecker auswählen"
          >
            Stecker
          </labeledSelection>
        </div>

        <!-- Outputs/Sockets Configuration -->
        <SocketsConfiguration
          v-if="socketsEnabled"
          v-model:selected="selectedSocket"
          v-model:number="selectedSocketNumber"
          :options="socketsOptions"
          @add="setSelectedSocket()"
        />
        <!-- Selected Sockets Display -->
        <SelectedSocketsList
          :sockets="config.sockets"
          @remove="removeSocketFromSelection"
        />

        <!-- Tags Field (Optional) -->
        <div v-if="tagsEnabled">
          <labeledMultiSelect
            v-model="config.tags"
            :items="tagsOptions"
            icon="i-lucide-tags"
            badge-color="info"
            placeholder="Tags auswählen"
          >
            Tags
          </labeledMultiSelect>
        </div>

        <!-- Location Field -->
        <div>
          <labeledObjectSelection
            v-model="selectedLocation"
            :items="locationOptions"
            icon="i-lucide-map-pin"
            :badge-color="validationErrors.locationId ? 'error' : 'success'"
            placeholder="Standort auswählen"
            @update:model-value="validateLocation"
          >
            Standort <span class="text-red-500">*</span>
          </labeledObjectSelection>
          <p
            v-if="validationErrors.locationId"
            class="mt-2 px-4 text-xs text-red-500"
          >
            {{ validationErrors.locationId }}
          </p>
        </div>

        <!-- Storage Location Field -->
        <div>
          <labeledObjectSelection
            v-model="selectedStorageLocation"
            :items="storageLocationOptions"
            icon="i-lucide-warehouse"
            :badge-color="
              validationErrors.storageLocationId ? 'error' : 'success'
            "
            placeholder="Lagerstandort auswählen"
            @update:model-value="validateStorageLocation"
          >
            Lagerstandort <span class="text-red-500">*</span>
          </labeledObjectSelection>
          <p
            v-if="validationErrors.storageLocationId"
            class="mt-2 px-4 text-xs text-red-500"
          >
            {{ validationErrors.storageLocationId }}
          </p>
        </div>

        <!-- Storage Location Section Field (Optional) -->
        <div>
          <labeledInput
            v-model="formData.storageLocationSection"
            icon="i-lucide-archive"
            badge-color="neutral"
            placeholder="z.B. Regal A, Fach 3"
          >
            Lagerbereich
          </labeledInput>
        </div>

        <!-- Current Project Field (Optional) -->
        <div>
          <labeledObjectSelection
            v-model="selectedProject"
            :items="projectOptions"
            icon="i-lucide-folder"
            badge-color="neutral"
            placeholder="Projekt auswählen"
            clearable
          >
            Aktuelles Projekt
          </labeledObjectSelection>
        </div>
      </div>

      <UButton
        v-if="!isLoading && !loadError"
        block
        color="primary"
        :loading="isSubmitting"
        :disabled="!isFormValid || !hasChanges"
        @click="submitForm"
      >
        {{ hasChanges ? "Änderungen speichern" : "Keine Änderungen" }}
      </UButton>
    </template>
    <slot></slot>
  </USlideover>
</template>

<script setup lang="ts">
import type { Location, Project, Article } from "~/composables/articles/types";
import { TypeEnum } from "~/composables/articles/types";
import { useConfigurator } from "~/composables/articles/useConfigurator";
import { useSocketSelection } from "~/composables/articles/useSocketSelection";

interface EditedArticleResponse {
  success: boolean;
  articleId: string;
  message: string;
}

const props = defineProps<{
  open: boolean;
  articleId: string;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "article-updated": [response: EditedArticleResponse];
}>();

const { isDesktop } = useDevice();
const toast = useToast();

// Use configurator for article validation and options
const {
  config,
  ampacityOptions,
  connectorOptions,
  socketsEnabled,
  socketsOptions,
  tagsOptions,
  tagsEnabled,
} = useConfigurator();

const {
  selectedSocket,
  selectedSocketNumber,
  handleAddSocket: setSelectedSocket,
  removeSocketFromSelection,
} = useSocketSelection(config);

// Create computed wrappers to handle null/undefined conversion for USelectMenu
const ampacityModel = computed({
  get: () => config.ampacity || undefined,
  set: (value) => {
    config.ampacity = value || null;
  },
});

const connectorModel = computed({
  get: () => config.connector || undefined,
  set: (value) => {
    config.connector = value || null;
  },
});

const slideoverUi = reactive({
  title: "text-center text-3xl font-bold",
  description: "text-center text-xl",
  header: "justify-center py-7",
  body: "flex flex-col gap-5 px-4 sm:px-6",
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

// Form data for additional fields not covered by configurator
const formData = reactive({
  locationId: undefined as number | undefined,
  storageLocationId: undefined as number | undefined,
  storageLocationSection: "",
  currentProjectId: undefined as number | undefined,
});

// Original data for change detection
const originalData = ref<Partial<Article> | null>(null);

// Form state
const isSubmitting = ref(false);
const isLoading = ref(false);
const loadError = ref("");
const validationErrors = ref({
  type: "",
  ampacity: "",
  lengthInMeter: "",
  locationId: "",
  storageLocationId: "",
});

// Data for select menus
const locations = ref<Location[]>([]);
const storageLocations = ref<Location[]>([]);
const projects = ref<Project[]>([]);

// Type options for the select menu
const typeOptions = TypeEnum.options;

const locationOptions = computed(
  () =>
    locations.value?.map((loc) => ({ label: loc.name, value: loc.id })) || [],
);

const storageLocationOptions = computed(
  () =>
    storageLocations.value?.map((loc) => ({
      label: loc.name,
      value: loc.id,
    })) || [],
);

const projectOptions = computed(
  () =>
    projects.value?.map((proj) => ({ label: proj.name, value: proj.id })) || [],
);

// Selected objects for USelectMenu
const selectedLocation = computed({
  get: () =>
    locationOptions.value.find((opt) => opt.value === formData.locationId) ||
    undefined,
  set: (value) => {
    formData.locationId = value?.value || undefined;
  },
});

const selectedStorageLocation = computed({
  get: () =>
    storageLocationOptions.value.find(
      (opt) => opt.value === formData.storageLocationId,
    ) || undefined,
  set: (value) => {
    formData.storageLocationId = value?.value || undefined;
  },
});

const selectedProject = computed({
  get: () =>
    projectOptions.value.find(
      (opt) => opt.value === formData.currentProjectId,
    ) || undefined,
  set: (value) => {
    formData.currentProjectId = value?.value || undefined;
  },
});

// Check if form has changes from original data
const hasChanges = computed(() => {
  if (!originalData.value) return false;

  const current = {
    type: config.type,
    ampacity: config.ampacity,
    lengthInMeter: config.length,
    connector: config.connector,
    outputs: config.sockets,
    tags: config.tags,
    locationId: formData.locationId,
    storageLocationId: formData.storageLocationId,
    storageLocationSection: formData.storageLocationSection || "",
    currentProjectId: formData.currentProjectId,
  };

  const original = {
    type: originalData.value.type,
    ampacity: originalData.value.ampacity,
    lengthInMeter: originalData.value.lengthInMeter,
    connector: originalData.value.connector,
    outputs: originalData.value.outputs || {},
    tags: originalData.value.tags || [],
    locationId: originalData.value.location?.id,
    storageLocationId: originalData.value.storageLocation?.id,
    storageLocationSection: originalData.value.storageLocationSection || "",
    currentProjectId: originalData.value.project?.id,
  };

  return JSON.stringify(current) !== JSON.stringify(original);
});

// Load data when component mounts
onMounted(async () => {
  await loadStaticData();
});

// Load article data when articleId changes or component opens
watch(
  [() => props.open, () => props.articleId],
  async ([isOpen, articleId]) => {
    if (isOpen && articleId) {
      await loadArticleData();
    }
  },
  { immediate: true },
);

async function loadStaticData() {
  try {
    const [locationsData, storageLocationsData, projectsData] =
      await Promise.all([
        $fetch<Location[]>("/api/locations/getAll"),
        $fetch<Location[]>("/api/locations/getAll?isStorageLocation=true"),
        $fetch<Project[]>("/api/projects/getAll"),
      ]);

    locations.value = locationsData || [];
    storageLocations.value = storageLocationsData || [];
    projects.value = projectsData || [];
  } catch (error) {
    console.error("Error loading form data:", error);
    toast.add({
      title: "Fehler",
      description: "Formular-Daten konnten nicht geladen werden",
      color: "error",
    });
  }
}

async function loadArticleData() {
  if (!props.articleId) return;

  isLoading.value = true;
  loadError.value = "";

  try {
    const article = await $fetch<Article>(
      `/api/articles/${encodeURIComponent(props.articleId)}`,
    );

    // Store original data for change detection
    originalData.value = { ...article };

    // Populate form with article data
    config.type = article.type;
    config.ampacity = article.ampacity;
    config.length = article.lengthInMeter;
    config.connector = article.connector || null;
    config.sockets = article.outputs || {};
    config.tags = article.tags || [];

    formData.locationId = article.location?.id;
    formData.storageLocationId = article.storageLocation?.id;
    formData.storageLocationSection = article.storageLocationSection || "";
    formData.currentProjectId = article.project?.id;

    // Clear validation errors
    validationErrors.value = {
      type: "",
      ampacity: "",
      lengthInMeter: "",
      locationId: "",
      storageLocationId: "",
    };
  } catch (error) {
    console.error("Error loading article:", error);
    if (error && typeof error === "object" && "statusCode" in error) {
      const httpError = error as { statusCode: number; statusMessage?: string };
      loadError.value =
        httpError.statusMessage || "Artikel konnte nicht geladen werden";
    } else {
      loadError.value = "Artikel konnte nicht geladen werden";
    }
  } finally {
    isLoading.value = false;
  }
}

// Form validation functions
const validateType = () => {
  if (!config.type) {
    validationErrors.value.type = "Typ ist erforderlich";
    return false;
  }
  validationErrors.value.type = "";
  return true;
};

const validateAmpacity = () => {
  if (!config.ampacity) {
    validationErrors.value.ampacity = "Stromstärke ist erforderlich";
    return false;
  }
  validationErrors.value.ampacity = "";
  return true;
};

const validateLocation = () => {
  if (!formData.locationId) {
    validationErrors.value.locationId = "Standort ist erforderlich";
    return false;
  }
  validationErrors.value.locationId = "";
  return true;
};

const validateStorageLocation = () => {
  if (!formData.storageLocationId) {
    validationErrors.value.storageLocationId = "Lagerstandort ist erforderlich";
    return false;
  }
  validationErrors.value.storageLocationId = "";
  return true;
};

const isFormValid = computed(() => {
  const lengthValid =
    config.type === "Verteiler" || config.type === "Box"
      ? config.length >= 0
      : config.length > 0;

  return (
    config.type &&
    config.ampacity &&
    lengthValid &&
    formData.locationId !== undefined &&
    formData.storageLocationId !== undefined
  );
});

// Submit form to update article
async function submitForm() {
  // Validate all required fields
  const isValid = [
    validateType(),
    validateAmpacity(),
    validateLocation(),
    validateStorageLocation(),
  ].every(Boolean);

  if (!isValid) return;

  if (!hasChanges.value) {
    toast.add({
      title: "Keine Änderungen",
      description: "Es wurden keine Änderungen vorgenommen",
      color: "warning",
    });
    return;
  }

  isSubmitting.value = true;

  try {
    const updateData = {
      type: config.type,
      ampacity: config.ampacity,
      lengthInMeter: config.length,
      connector: config.connector,
      outputs: config.sockets,
      tags: config.tags,
      locationId: formData.locationId,
      storageLocationId: formData.storageLocationId,
      storageLocationSection: formData.storageLocationSection || undefined,
      currentProjectId: formData.currentProjectId,
    };
    const updatedArticle = await $fetch<EditedArticleResponse>(
      `/api/articles/${props.articleId}/edit`,
      {
        method: "PUT",
        body: updateData,
      },
    );

    emit("article-updated", updatedArticle);
    localOpen.value = false;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      const httpError = error as { statusCode: number; statusMessage?: string };
      toast.add({
        title: "Fehler",
        description: httpError.statusMessage || "Ein Fehler ist aufgetreten",
        color: "error",
      });
    } else {
      toast.add({
        title: "Fehler",
        description: "Ein unbekannter Fehler ist aufgetreten",
        color: "error",
      });
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>
