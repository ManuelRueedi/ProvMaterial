<template>
  <div class="flex w-full max-w-xl flex-col gap-3">
    <div class="flex items-center gap-2">
      <UIcon :name="icon" class="h-6 w-6" />
      <label class="text-lg font-medium">
        <slot></slot>
      </label>
    </div>
    <UInput
      v-model="innerValue"
      :type="type"
      :placeholder="placeholder"
      :status="status"
      :disabled="disabled"
      size="lg"
      class="w-full"
      v-bind="$attrs"
      @blur="$emit('blur', $event)"
    >
      <template v-if="clearable && innerValue" #trailing>
        <UButton
          v-show="innerValue !== ''"
          color="neutral"
          variant="link"
          icon="i-heroicons-x-mark-20-solid"
          :padded="false"
          @click="innerValue = ''"
        />
      </template>
    </UInput>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  /** Leading icon */
  icon: {
    type: String,
    default: "i-heroicons-pencil",
  },

  /** v‑model value */
  modelValue: {
    type: [String, Number] as PropType<string | number>,
    default: "",
  },

  /** Placeholder text for the input */
  placeholder: {
    type: String,
    default: "",
  },

  /** Input type */
  type: {
    type: String,
    default: "text",
  },

  /** Input status */
  status: {
    type: String as PropType<"success" | "error" | "warning" | undefined>,
    default: undefined,
  },

  /** Whether the input is disabled */
  disabled: {
    type: Boolean,
    default: false,
  },

  /** Whether the input has a clear button */
  clearable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  "update:modelValue": [string | number];
  blur: [Event];
}>();

const innerValue = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>
