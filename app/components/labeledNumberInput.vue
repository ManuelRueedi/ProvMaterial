<template>
  <div class="flex w-full max-w-xl flex-col gap-3">
    <div class="flex items-center gap-2">
      <UIcon :name="icon" class="h-6 w-6" />
      <label class="text-lg font-medium">
        <slot></slot>
      </label>
    </div>
    <UInputNumber
      v-model="innerValue"
      :placeholder="placeholder"
      :status="status"
      :min="min"
      :max="max"
      :step="step"
      size="lg"
      class="w-full"
    />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
  /** Leading icon */
  icon: {
    type: String,
    default: "i-heroicons-hashtag",
  },

  /** v‑model value */
  modelValue: {
    type: Number,
    default: 0,
  },

  /** Placeholder text for the input */
  placeholder: {
    type: String,
    default: "",
  },

  /** Input status */
  status: {
    type: String as PropType<"success" | "error" | "warning" | undefined>,
    default: undefined,
  },

  /** Minimum value */
  min: {
    type: Number,
    default: 0,
  },

  /** Maximum value */
  max: {
    type: Number,
    default: undefined,
  },

  /** Step value */
  step: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits<{
  "update:modelValue": [number];
}>();

const innerValue = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>
