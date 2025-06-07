<template>
  <div class="flex flex-col items-center gap-2">
    <div
      v-for="(value, key) in sockets"
      :key="key"
      class="flex w-full max-w-xl gap-2 justify-self-center pb-2"
    >
      <UButton
        class="min-w-30 flex-1/3 justify-center"
        color="error"
        icon="ic:baseline-remove"
        @click="$emit('remove', key)"
      />
      <UBadge color="neutral" class="flex-2/3 justify-center">
        {{ value }} X {{ key }}
      </UBadge>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Config } from "@/composables/articles/types";

interface Props {
  sockets: Config["sockets"];
}

defineProps<Props>();

defineEmits<{
  remove: [key: keyof NonNullable<Config["sockets"]>];
}>();
</script>
