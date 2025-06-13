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
      <h2>Projektdaten ändern</h2>
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
            placeholder="Projektname"
            :status="validationErrors.name ? 'error' : undefined"
            size="xl"
            class="w-full"
            @blur="validateName"
          />
          <p v-if="validationErrors.name" class="mt-1 text-xs text-red-500">
            {{ validationErrors.name }}
          </p>
        </div>

        <!-- Description Field -->
        <div class="form-group">
          <label class="mb-1 block text-sm font-medium">Beschreibung</label>
          <UTextarea
            v-model="formData.description"
            placeholder="Projektbeschreibung (optional)"
            size="xl"
            :rows="4"
            class="w-full"
          />
        </div>
      </div>

      <UButton
        block
        color="primary"
        :loading="isSubmitting"
        :disabled="!isFormValid || !hasChanges"
        @click="submitForm"
      >
        Speichern
      </UButton>
    </template>
    <slot></slot>
  </USlideover>
</template>

<script setup lang="ts">
import type { Project } from "@/composables/articles/types";

const props = defineProps<{
  open: boolean;
  project: Project | null;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "project-updated": [project: Project];
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

// Form data
const formData = reactive({
  name: "",
  description: "",
});

// Original data for comparison
const originalData = ref({
  name: "",
  description: "",
});

// Form state
const isSubmitting = ref(false);
const validationErrors = ref({
  name: "",
});

// Watch for project changes and populate form
watch(
  () => props.project,
  (project) => {
    if (project) {
      formData.name = project.name;
      formData.description = project.description || "";
      originalData.value = {
        name: project.name,
        description: project.description || "",
      };
    }
  },
  { immediate: true },
);

// Reset form when opened
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.project) {
      resetForm();
    }
  },
);

// Check if form has changes
const hasChanges = computed(() => {
  return (
    formData.name !== originalData.value.name ||
    formData.description !== originalData.value.description
  );
});

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

// Reset form to original values
function resetForm() {
  if (props.project) {
    formData.name = props.project.name;
    formData.description = props.project.description || "";
    originalData.value = {
      name: props.project.name,
      description: props.project.description || "",
    };
  }
  validationErrors.value = { name: "" };
  isSubmitting.value = false;
}

// Submit form to update project
async function submitForm() {
  if (!validateName() || !props.project) return;

  isSubmitting.value = true;

  try {
    // Only send changed fields
    const updateData: Partial<typeof formData> = {};
    if (formData.name !== originalData.value.name) {
      updateData.name = formData.name;
    }
    if (formData.description !== originalData.value.description) {
      updateData.description = formData.description;
    }

    const updatedProject = await $fetch(
      `/api/projects/${props.project.id}/edit`,
      {
        method: "PUT",
        body: updateData,
      },
    );

    toast.add({
      title: "Erfolg",
      description: `Projekt "${updatedProject!.name}" wurde aktualisiert`,
      color: "success",
    });

    emit("project-updated", updatedProject);
    localOpen.value = false;
  } catch (error: unknown) {
    const err = error as { statusCode?: number; statusMessage?: string };
    if (err.statusCode === 409) {
      validationErrors.value.name =
        "Ein Projekt mit diesem Namen existiert bereits";
    } else if (err.statusCode === 404) {
      toast.add({
        title: "Fehler",
        description: "Projekt wurde nicht gefunden",
        color: "error",
      });
    } else {
      toast.add({
        title: "Fehler",
        description: err.statusMessage || "Ein Fehler ist aufgetreten",
        color: "error",
      });
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>
