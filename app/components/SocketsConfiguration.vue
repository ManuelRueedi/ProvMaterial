<template>
  <div class="flex w-full max-w-xl flex-col gap-3">
    <div class="flex w-full flex-col gap-2 [@media(min-width:400px)]:flex-row">
      <UBadge
        icon="ic:baseline-outlet"
        class="min-w-30 flex-1/3 justify-center"
        size="md"
        color="neutral"
        variant="solid"
      >
        Abgänge
      </UBadge>
      <USelect
        class="flex-2/3"
        :items="options"
        :model-value="selected"
        @update:model-value="$emit('update:selected', $event)"
      />
    </div>
    <div class="mb-5 flex w-full gap-2">
      <UButton class="min-w-30 flex-1/3 justify-center" @click="$emit('add')">
        hinzufügen
      </UButton>
      <UInputNumber
        :model-value="number"
        class="flex-2/3"
        @update:model-value="$emit('update:number', $event)"
      />
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
