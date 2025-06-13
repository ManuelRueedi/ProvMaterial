<template>
  <div
    class="flex w-full max-w-xl items-center"
    :class="[compact ? 'compact-mode gap-2' : 'gap-3 sm:gap-4']"
  >
    <div class="flex min-w-0 flex-shrink-0 items-center gap-2">
      <UIcon
        :name="computedIcon"
        :class="compact ? 'h-3.5 w-3.5' : 'h-4 w-4 sm:h-5 sm:w-5'"
        class="text-primary-500"
      />
      <label
        :class="
          compact ? 'text-xs font-medium' : 'text-sm font-medium sm:text-base'
        "
        class="leading-tight whitespace-nowrap text-gray-700 dark:text-gray-300"
      >
        <slot></slot>
      </label>
    </div>
    <div class="min-w-0 flex-1">
      <!-- Text Input -->
      <UInput
        v-if="type === 'text' || type === 'email' || type === 'password'"
        v-model="textValue"
        :type="type"
        :placeholder="placeholder"
        :status="status"
        :disabled="disabled"
        :size="inputSize"
        class="w-full"
        v-bind="$attrs"
        @blur="$emit('blur', $event)"
      >
        <template v-if="clearable && textValue" #trailing>
          <button
            v-show="textValue !== ''"
            type="button"
            class="inline-flex items-center justify-center rounded-full p-1 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            @click="clearValue"
          >
            <UIcon
              name="i-heroicons-x-mark-20-solid"
              class="h-3 w-3 sm:h-4 sm:w-4"
            />
          </button>
        </template>
      </UInput>

      <!-- Number Input -->
      <UInputNumber
        v-else-if="type === 'number'"
        v-model="numberValue"
        :placeholder="placeholder"
        :status="status"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :size="inputSize"
        class="w-full"
      />

      <!-- Single Select -->
      <template v-else-if="type === 'select'">
        <USelectMenu
          v-if="searchable"
          v-model="selectValue"
          :items="items"
          :size="inputSize"
          :placeholder="placeholder"
          :disabled="disabled"
          class="w-full"
        />
        <USelect
          v-else
          v-model="selectValue"
          :items="items"
          :size="inputSize"
          :placeholder="placeholder"
          :disabled="disabled"
          class="w-full"
        />
      </template>

      <!-- Object Selection -->
      <USelectMenu
        v-else-if="type === 'object-select'"
        v-model="objectValue"
        :items="items"
        :placeholder="placeholder"
        :disabled="disabled"
        :size="inputSize"
        class="w-full"
      >
        <template v-if="clearable && objectValue" #trailing>
          <button
            v-show="objectValue"
            type="button"
            class="inline-flex items-center justify-center rounded-full p-1 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            @click="clearValue"
          >
            <UIcon
              name="i-heroicons-x-mark-20-solid"
              class="h-3 w-3 sm:h-4 sm:w-4"
            />
          </button>
        </template>
      </USelectMenu>

      <!-- Multi Select -->
      <USelectMenu
        v-else-if="type === 'multi-select'"
        v-model="multiSelectValue"
        :items="items"
        :placeholder="placeholder"
        :clearable="clearable"
        :disabled="disabled"
        :size="inputSize"
        class="w-full"
        multiple
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import type { SelectItem, ArrayOrNested } from "@nuxt/ui";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps({
  /** Field type */
  type: {
    type: String as PropType<
      | "text"
      | "email"
      | "password"
      | "number"
      | "select"
      | "object-select"
      | "multi-select"
    >,
    default: "text",
  },

  /** Input size */
  size: {
    type: String as PropType<"xs" | "sm" | "md" | "lg" | "xl">,
    default: "md",
  },

  /** Compact mode for mobile optimization */
  compact: {
    type: Boolean,
    default: false,
  },

  /** Leading icon */
  icon: {
    type: String,
    default: () => {
      // Default icons based on type if not provided
      return "i-heroicons-pencil"; // Will be computed based on type
    },
  },

  /** v‑model value */
  modelValue: {
    type: [String, Number, Array, Object, null] as PropType<
      string | number | (string | number)[] | SelectItem | null
    >,
    default: null,
  },

  /** Placeholder text */
  placeholder: {
    type: String,
    default: "",
  },

  /** Field status */
  status: {
    type: String as PropType<"success" | "error" | "warning" | undefined>,
    default: undefined,
  },

  /** Whether the field is disabled */
  disabled: {
    type: Boolean,
    default: false,
  },

  /** Whether the field can be cleared */
  clearable: {
    type: Boolean,
    default: false,
  },

  /** Whether to use searchable select (USelectMenu vs USelect) */
  searchable: {
    type: Boolean,
    default: false,
  },

  /** Options for select types */
  items: {
    type: Array as PropType<ArrayOrNested<SelectItem>>,
    default: () => [],
  },

  /** Minimum value for number input */
  min: {
    type: Number,
    default: 0,
  },

  /** Maximum value for number input */
  max: {
    type: Number,
    default: undefined,
  },

  /** Step value for number input */
  step: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits<{
  "update:modelValue": [
    string | number | (string | number)[] | SelectItem | null,
  ];
  blur: [Event];
}>();

// Computed icon based on type
const computedIcon = computed(() => {
  if (props.icon !== "i-heroicons-pencil") {
    return props.icon; // Use provided icon
  }

  // Use type-specific default icons
  switch (props.type) {
    case "number":
      return "i-heroicons-hashtag";
    case "select":
      return "i-heroicons-rocket-launch";
    case "object-select":
      return "i-lucide-list";
    case "multi-select":
      return "i-lucide-tags";
    default:
      return "i-heroicons-pencil";
  }
});

// Responsive input size based on screen size and compact mode
const inputSize = computed((): "md" | "sm" | "xs" | "lg" | "xl" => {
  // Use smaller size in compact mode for mobile optimization
  if (props.compact) {
    return props.size === "lg" || props.size === "xl" ? "md" : "sm";
  }
  return props.size;
});

// Type-specific computed properties
const textValue = computed({
  get: () => (props.modelValue as string) || "",
  set: (v: string) => emit("update:modelValue", v),
});

const numberValue = computed({
  get: () => (props.modelValue as number) || 0,
  set: (v: number) => emit("update:modelValue", v),
});

const selectValue = computed({
  get: () => (props.modelValue as string | number) || null,
  set: (v: string | number | null) => emit("update:modelValue", v),
});

const objectValue = computed({
  get: () => (props.modelValue as SelectItem) || null,
  set: (v: SelectItem | null) => emit("update:modelValue", v),
});

const multiSelectValue = computed({
  get: () => (props.modelValue as (string | number)[]) || [],
  set: (v: (string | number)[]) => emit("update:modelValue", v),
});

function clearValue() {
  switch (props.type) {
    case "number":
      emit("update:modelValue", 0);
      break;
    case "multi-select":
      emit("update:modelValue", []);
      break;
    case "text":
    case "email":
    case "password":
      emit("update:modelValue", "");
      break;
    default:
      emit("update:modelValue", null);
  }
}
</script>

<style scoped>
/* Mobile-first approach with enhanced touch targets */
@media (max-width: 640px) {
  /* Switch to vertical layout on very small screens */
  .compact-mode {
    flex-direction: column;
    align-items: flex-start;
  }

  .compact-mode .flex-shrink-0 {
    width: 100%;
    margin-bottom: 0.375rem;
  }

  /* Ensure inputs have proper minimum height for touch */
  :deep(.ui-input input) {
    min-height: 2.5rem;
    font-size: 16px; /* Prevents zoom on iOS */
  }

  :deep(.ui-select-menu button),
  :deep(.ui-select button) {
    min-height: 2.5rem;
    font-size: 16px;
  }

  /* Better spacing for mobile */
  :deep(.ui-input),
  :deep(.ui-select-menu),
  :deep(.ui-select) {
    line-height: 1.4;
  }
}

/* Compact mode optimizations */
.compact-mode :deep(.ui-input input) {
  min-height: 2.25rem;
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
}

.compact-mode :deep(.ui-select-menu button),
.compact-mode :deep(.ui-select button) {
  min-height: 2.25rem;
  padding-top: 0.375rem;
  padding-bottom: 0.375rem;
}

/* Enhanced focus states for better accessibility */
:deep(.ui-input:focus-within),
:deep(.ui-select-menu:focus-within),
:deep(.ui-select:focus-within) {
  transform: translateY(-1px);
  transition: transform 0.1s ease-in-out;
}

/* Improved clear button styling */
button[type="button"] {
  min-height: 2rem;
  min-width: 2rem;
  touch-action: manipulation;
}

/* Label width control for horizontal layout */
.flex-shrink-0 {
  min-width: 120px; /* Minimum label width */
  max-width: 200px; /* Maximum label width */
}

@media (min-width: 768px) {
  .flex-shrink-0 {
    min-width: 140px;
    max-width: 240px;
  }
}

/* Ultra-compact mode for very small screens */
@media (max-width: 480px) {
  :deep(.ui-input input) {
    min-height: 2.25rem;
    font-size: 16px;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  :deep(.ui-select-menu button),
  :deep(.ui-select button) {
    min-height: 2.25rem;
    font-size: 16px;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
}
</style>
