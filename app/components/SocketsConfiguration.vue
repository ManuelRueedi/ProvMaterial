<template>
  <div class="flex w-full max-w-xl flex-col gap-4">
    <div class="mx-auto flex items-center gap-2">
      <UIcon name="ic:baseline-outlet" class="h-4 w-4" />
      <label class="text-md font-medium"> Abgänge hinzufügen </label>
    </div>

    <!-- Socket Type Selection -->
    <div class="flex w-full items-center gap-2 sm:gap-3">
      <div class="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
        <UIcon name="i-lucide-plug" class="text-primary-500 h-4 w-4" />
        <label
          class="text-xs leading-tight font-medium whitespace-nowrap sm:text-sm"
        >
          Steckertyp
        </label>
      </div>
      <div class="min-w-0 flex-1">
        <USelect
          :model-value="selected"
          :items="options"
          size="lg"
          placeholder="Steckertyp auswählen"
          class="w-full"
          @update:model-value="$emit('update:selected', $event)"
        />
      </div>
    </div>

    <!-- Quantity Input -->
    <div class="flex w-full items-center gap-2 sm:gap-3">
      <div class="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
        <UIcon name="i-lucide-hash" class="text-primary-500 h-4 w-4" />
        <label
          class="text-xs leading-tight font-medium whitespace-nowrap sm:text-sm"
        >
          Anzahl
        </label>
      </div>
      <div class="flex min-w-0 flex-1 gap-2">
        <UInputNumber
          :model-value="number"
          class="flex-1"
          size="lg"
          placeholder="Anzahl"
          :min="1"
          @update:model-value="$emit('update:number', $event)"
        />
        <UButton
          color="primary"
          size="lg"
          icon="i-lucide-plus"
          @click="$emit('add')"
        >
          Hinzufügen
        </UButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Connector } from "@/composables/articles/types";

interface Props {
  options: Connector[];
  selected: Connector;
  number: number;
}

defineProps<Props>();

defineEmits<{
  "update:selected": [value: Connector];
  "update:number": [value: number];
  add: [];
}>();
</script>

<style scoped>
/* Label width control for horizontal layout */
.flex-shrink-0 {
  min-width: 80px; /* Smaller minimum label width for mobile */
  max-width: 120px; /* Smaller maximum label width for mobile */
}

@media (min-width: 640px) {
  .flex-shrink-0 {
    min-width: 120px;
    max-width: 200px;
  }
}

@media (min-width: 768px) {
  .flex-shrink-0 {
    min-width: 140px;
    max-width: 240px;
  }
}

/* Mobile responsive behavior - keep horizontal layout */
@media (max-width: 640px) {
  /* Ensure inputs have proper minimum height for touch */
  :deep(.ui-input input),
  :deep(.ui-select button) {
    min-height: 2.5rem;
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* Enhanced focus states for better accessibility */
:deep(.ui-input:focus-within),
:deep(.ui-select:focus-within) {
  transform: translateY(-1px);
  transition: transform 0.1s ease-in-out;
}
</style>
