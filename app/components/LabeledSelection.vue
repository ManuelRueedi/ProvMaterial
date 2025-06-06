<template>
  <div class="flex w-full max-w-xl flex-col gap-3">
    <div class="flex items-center gap-2">
      <UIcon :name="icon" class="h-6 w-6" />
      <label class="text-lg font-medium">
        <slot></slot>
      </label>
    </div>
    <USelectMenu
      v-if="searchable"
      v-model="innerValue"
      :items="items"
      size="lg"
      :placeholder="placeholder"
      class="w-full"
    />
    <USelect
      v-else
      v-model="innerValue"
      :items="items"
      size="lg"
      :placeholder="placeholder"
      class="w-full"
    />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import type { SelectItem, ArrayOrNested } from "@nuxt/ui";

const props = defineProps({
  /** Leading icon */
  icon: {
    type: String,
    default: "i-heroicons-rocket-launch",
  },

  /** Options for the select */
  items: {
    /*  strings | numbers | booleans | SelectItem objects,
        or nested arrays of those                         */
    type: Array as PropType<ArrayOrNested<SelectItem>>,
    required: true,
  },

  /** v‑model value */
  modelValue: {
    type: [String, Number, null] as PropType<string | number | null>,
    default: null,
  },

  /** Placeholder text for the select */
  placeholder: {
    type: String,
    default: "Auswählen...",
  },

  /** Whether to use USelectMenu (searchable) or USelect */
  searchable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  "update:modelValue": [string | number | null];
}>();

const innerValue = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>

<style></style>
