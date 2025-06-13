<template>
  <div
    v-if="Object.keys(sockets).length > 0"
    class="mt-2 flex w-full max-w-xl flex-col gap-3"
  >
    <div class="flex items-center gap-2">
      <UIcon name="i-lucide-list" class="text-primary-500 h-4 w-4" />
      <label class="text-md font-medium"> Ausgewählte Abgänge </label>
    </div>
    <div
      class="grid gap-2"
      :class="Object.keys(sockets).length > 1 ? 'grid-cols-2' : 'grid-cols-1'"
    >
      <div
        v-for="(value, key) in sockets"
        :key="key"
        class="border-default flex items-center gap-3 rounded-md border p-3"
      >
        <UButton
          color="error"
          icon="i-lucide-x"
          size="sm"
          variant="soft"
          @click="$emit('remove', key)"
        />
        <div class="flex flex-1 items-center justify-between">
          <span class="text-sm font-medium">
            {{ key }}
          </span>
          <span class="text-sm">{{ value }}x</span>
        </div>
      </div>
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
