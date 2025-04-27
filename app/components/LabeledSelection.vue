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
    <USelect class="flex-2/3" :items="items" v-model="innerValue" />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  /** The list of options for the select */
  icon: {
    type: String,
    default: "i-lucide-rocket", // fallback if parent omits it
  },
  items: {
    type: Array,
    required: true,
  },
  /** Bound value for the select */
  modelValue: {
    type: [String, Number, null],
    default: null,
  },
});

const emit = defineEmits(["update:modelValue"]);

// proxy prop → emit
const innerValue = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>

<style></style>
