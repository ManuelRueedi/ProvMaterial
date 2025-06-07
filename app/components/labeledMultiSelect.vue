<template>
  <div class="flex w-full max-w-xl flex-col gap-3">
    <div class="flex items-center gap-2">
      <UIcon :name="icon" class="h-6 w-6" />
      <label class="text-lg font-medium">
        <slot></slot>
      </label>
    </div>
    <USelectMenu
      v-model="innerValue"
      :items="items"
      :placeholder="placeholder"
      :clearable="clearable"
      size="lg"
      class="w-full"
      multiple
    />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import type { SelectItem, ArrayOrNested } from "@nuxt/ui";

const props = defineProps({
  /** Leading icon on the badge */
  icon: {
    type: String,
    default: "i-lucide-tags",
  },

  /** Options for the select */
  items: {
    type: Array as PropType<ArrayOrNested<SelectItem>>,
    required: true,
  },

  /** v‑model value */
  modelValue: {
    type: Array as PropType<(string | number)[]>,
    default: () => [],
  },

  /** Placeholder text for the select */
  placeholder: {
    type: String,
    default: "Auswählen...",
  },

  /** Whether the select can be cleared */
  clearable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  "update:modelValue": [(string | number)[]];
}>();

const innerValue = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>
