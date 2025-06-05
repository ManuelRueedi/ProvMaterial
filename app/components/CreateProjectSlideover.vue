<template>
  <USlideover
    :open="localOpen"
    :side="isDesktop ? 'right' : 'bottom'"
    :ui="slideoverUi"
    :close="slideoverClose"
    @update:open="localOpen = $event"
  >
    <template #title>
      <h1>Projekt erstellen</h1>
    </template>
    <template #description>
      <h2>Projektdaten eingeben</h2>
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
const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  "update:open": [value: boolean];
  "project-created": [project: any];
}>();

const { isDesktop } = useDevice();
const toast = useToast();

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

// Form data
const formData = reactive({
  name: "",
  description: "",
});

// Form state
const isSubmitting = ref(false);
const validationErrors = ref({
  name: "",
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

// Reset form to initial state
function resetForm() {
  formData.name = "";
  formData.description = "";
  validationErrors.value = { name: "" };
  isSubmitting.value = false;
}

// Submit form to create project
async function submitForm() {
  if (!validateName()) return;

  isSubmitting.value = true;

  try {
    const createdProject = await $fetch("/api/projects/create", {
      method: "POST",
      body: formData,
    });

    toast.add({
      title: "Erfolg",
      description: `Projekt "${createdProject!.name}" wurde erstellt`,
      color: "success",
    });

    emit("project-created", createdProject);
    localOpen.value = false;
  } catch (error: any) {
    if (error.statusCode === 409) {
      validationErrors.value.name =
        "Ein Projekt mit diesem Namen existiert bereits";
    } else {
      toast.add({
        title: "Fehler",
        description: error.statusMessage || "Ein Fehler ist aufgetreten",
        color: "error",
      });
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>
