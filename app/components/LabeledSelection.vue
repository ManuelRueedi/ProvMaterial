<template>
  <div
    class="flex w-full max-w-xl flex-col gap-2 px-10 [@media(min-width:400px)]:flex-row"
  >
    <UBadge
      class="min-w-30 flex-1/3 justify-center"
      :icon="icon"
      size="md"
      color="neutral"
      variant="solid"
    >
      <slot></slot>
    </UBadge>
    <USelect v-model="innerValue" class="flex-2/3" :items="items" />
  </div>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import type { SelectItem, ArrayOrNested } from "@nuxt/ui"; // ← official types:contentReference[oaicite:0]{index=0}

const props = defineProps({
  /** Leading icon on the badge */
  icon: {
    type: String,
    default: "i‑lucide‑rocket",
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
