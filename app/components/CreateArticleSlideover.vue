<template>
  <USlideover
    :open="localOpen"
    :side="isDesktop ? 'right' : 'bottom'"
    :ui="slideoverUi"
    :close="slideoverClose"
    @update:open="localOpen = $event"
  >
    <template #title>
      <h1>Artikel erstellen</h1>
    </template>
    <template #description>
      <h2>Artikeldaten eingeben</h2>
    </template>

    <template #body>
      <div class="space-y-6">
        <!-- Article ID Field (Required) -->
        <div class="form-group">
          <label class="mb-1 block text-sm font-medium">
            Artikel-ID <span class="text-red-500">*</span>
          </label>
          <UInput
            v-model="formData.id"
            placeholder="z.B. KEL-001"
            :status="validationErrors.id ? 'error' : undefined"
            size="xl"
            class="w-full"
            @blur="validateId"
          />
          <p v-if="validationErrors.id" class="mt-1 text-xs text-red-500">
            {{ validationErrors.id }}
          </p>
        </div>

        <!-- Article Type Field (Required) -->
        <div class="form-group">
          <label class="mb-1 block text-sm font-medium">
            Typ <span class="text-red-500">*</span>
          </label>
          <USelectMenu
            v-model="config.type"
            :items="typeOptions"
            placeholder="Typ auswählen"
            size="xl"
            class="w-full"
            @change="validateType"
          />
          <p v-if="validationErrors.type" class="mt-1 text-xs text-red-500">
            {{ validationErrors.type }}
          </p>
        </div>

        <!-- Ampacity Field (Required) -->
        <div class="form-group">
          <label class="mb-1 block text-sm font-medium">
            Stromstärke <span class="text-red-500">*</span>
          </label>
          <USelectMenu
            v-model="ampacityModel"
            :items="ampacityOptions"
            placeholder="Stromstärke auswählen"
            size="xl"
            class="w-full"
            @change="validateAmpacity"
          />
          <p v-if="validationErrors.ampacity" class="mt-1 text-xs text-red-500">
            {{ validationErrors.ampacity }}
          </p>
        </div>

        <!-- Length Field (Required) -->
        <div class="form-group">
          <label class="mb-1 block text-sm font-medium">
            Länge in Metern
          </label>
          <UInputNumber
            v-model.number="config.length"
            type="number"
            placeholder="z.B. 10"
            :status="validationErrors.lengthInMeter ? 'error' : undefined"
            size="xl"
            class="w-full"
            :min="0"
            :step="0.5"
          />
          <p
            v-if="validationErrors.lengthInMeter"
            class="mt-1 text-xs text-red-500"
          >
            {{ validationErrors.lengthInMeter }}
          </p>
        </div>

        <!-- Connector Field (Optional) -->
        <div class="form-group">
          <label class="mb-1 block text-sm font-medium">Stecker</label>
          <USelectMenu
            v-model="connectorModel"
            :items="connectorOptions"
            placeholder="Stecker auswählen"
            size="xl"
            class="w-full"
            clearable
          />
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
        <div v-if="tagsEnabled" class="form-group">
          <label class="mb-1 block text-sm font-medium">Tags (optional)</label>
          <USelectMenu
            v-model="config.tags"
            :items="tagsOptions"
            placeholder="Tags auswählen"
            size="xl"
            class="w-full"
            multiple
          />
        </div>

        <!-- Location Field (Required) -->
        <div class="form-group">
          <label class="mb-1 block text-sm font-medium">
            Standort <span class="text-red-500">*</span>
          </label>
          <USelectMenu
            v-model="selectedLocation"
            :items="locationOptions"
            placeholder="Standort auswählen"
            size="xl"
            class="w-full"
            @change="validateLocation"
          />
          <p
            v-if="validationErrors.locationId"
            class="mt-1 text-xs text-red-500"
          >
            {{ validationErrors.locationId }}
          </p>
        </div>

        <!-- Storage Location Field (Required) -->
        <div class="form-group">
          <label class="mb-1 block text-sm font-medium">
            Lagerstandort <span class="text-red-500">*</span>
          </label>
          <USelectMenu
            v-model="selectedStorageLocation"
            :items="storageLocationOptions"
            placeholder="Lagerstandort auswählen"
            size="xl"
            class="w-full"
            @change="validateStorageLocation"
          />
          <p
            v-if="validationErrors.storageLocationId"
            class="mt-1 text-xs text-red-500"
          >
            {{ validationErrors.storageLocationId }}
          </p>
        </div>

        <!-- Storage Location Section Field (Optional) -->
        <div class="form-group">
          <label class="mb-1 block text-sm font-medium"
            >Lagerbereich (optional)</label
          >
          <UInput
            v-model="formData.storageLocationSection"
            placeholder="z.B. Regal A, Fach 3"
            size="xl"
            class="w-full"
          />
        </div>

        <!-- Current Project Field (Optional) -->
        <div class="form-group">
          <label class="mb-1 block text-sm font-medium"
            >Aktuelles Projekt (optional)</label
          >
          <USelectMenu
            v-model="selectedProject"
            :items="projectOptions"
            placeholder="Projekt auswählen"
            size="xl"
            class="w-full"
            clearable
          />
        </div>
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
import type { Location, Project } from "~/composables/articles/types";
import { useConfigurator } from "~/composables/articles/useConfigurator";
import { useSocketSelection } from "~/composables/articles/useSocketSelection";

interface CreatedArticleResponse {
  success: boolean;
  articleId: string;
  message: string;
}

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "article-created": [response: CreatedArticleResponse];
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
  id: "",
  locationId: undefined as number | undefined,
  storageLocationId: undefined as number | undefined,
  storageLocationSection: "",
  currentProjectId: undefined as number | undefined,
});

// Form state
const isSubmitting = ref(false);
const validationErrors = ref({
  id: "",
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

// Load data when component mounts
onMounted(async () => {
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
      description: "Daten konnten nicht geladen werden",
      color: "error",
    });
  }
});

// Type options for the select menu
const typeOptions = [
  "Kabel",
  "Verlängerung",
  "Verteiler",
  "Box",
  "Kabelrolle",
  "Steckerleiste",
];

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
    formData.locationId = value?.value;
  },
});

const selectedStorageLocation = computed({
  get: () =>
    storageLocationOptions.value.find(
      (opt) => opt.value === formData.storageLocationId,
    ) || undefined,
  set: (value) => {
    formData.storageLocationId = value?.value;
  },
});

const selectedProject = computed({
  get: () =>
    projectOptions.value.find(
      (opt) => opt.value === formData.currentProjectId,
    ) || undefined,
  set: (value) => {
    formData.currentProjectId = value?.value;
  },
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

// Form validation functions
const validateId = () => {
  if (!formData.id.trim()) {
    validationErrors.value.id = "Artikel-ID ist erforderlich";
    return false;
  }
  validationErrors.value.id = "";
  return true;
};

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
    formData.id.trim() !== "" &&
    config.type &&
    config.ampacity &&
    lengthValid &&
    formData.locationId !== undefined &&
    formData.storageLocationId !== undefined
  );
});

// Reset form to initial state
function resetForm() {
  formData.id = "";
  config.type = "Verlängerung";
  config.ampacity = "32A";
  config.length = 0;
  config.connector = null;
  config.sockets = {};
  config.tags = [];
  formData.locationId = undefined;
  formData.storageLocationId = undefined;
  formData.storageLocationSection = "";
  formData.currentProjectId = undefined;
  validationErrors.value = {
    id: "",
    type: "",
    ampacity: "",
    lengthInMeter: "",
    locationId: "",
    storageLocationId: "",
  };
  isSubmitting.value = false;
}

// Submit form to create article
async function submitForm() {
  // Validate all required fields
  const isValid = [
    validateId(),
    validateType(),
    validateAmpacity(),
    validateLocation(),
    validateStorageLocation(),
  ].every(Boolean);

  if (!isValid) return;

  isSubmitting.value = true;

  try {
    const articleData = {
      id: formData.id,
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

    const createdArticle = await $fetch<CreatedArticleResponse>(
      "/api/articles/create",
      {
        method: "POST",
        body: articleData,
      },
    );

    emit("article-created", createdArticle);
    localOpen.value = false;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      const httpError = error as { statusCode: number; statusMessage?: string };
      if (httpError.statusCode === 409) {
        validationErrors.value.id =
          "Ein Artikel mit dieser ID existiert bereits";
      } else {
        toast.add({
          title: "Fehler",
          description: httpError.statusMessage || "Ein Fehler ist aufgetreten",
          color: "error",
        });
      }
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
