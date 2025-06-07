<template>
  <div class="flex w-full max-w-xl flex-col gap-4">
    <div class="mx-auto flex items-center gap-2">
      <UIcon name="ic:baseline-outlet" class="h-4 w-4" />
      <label class="text-md font-medium"> Abgänge hinzufügen </label>
    </div>

    <!-- Socket Type Selection -->
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-plug" class="h-4 w-4" />
        <label class="text-sm font-medium"> Steckertyp </label>
      </div>
      <USelect
        :model-value="selected"
        :items="options"
        size="lg"
        placeholder="Steckertyp auswählen"
        class="w-full"
        @update:model-value="$emit('update:selected', $event)"
      />
    </div>

    <!-- Quantity Input -->
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-hash" class="h-4 w-4" />
        <label class="text-sm font-medium"> Anzahl </label>
      </div>
      <div class="flex gap-2">
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
