<template>
  <div v-if="isHydrated" class="w-full">
    <slot v-if="data" :data="data" />
    <div v-else-if="pending" class="flex items-center justify-center p-12">
      <UButton loading label="Tabelle wird geladen..." :disabled="true" />
    </div>
  </div>
  <div v-else class="flex items-center justify-center p-12">
    <UButton loading label="Tabelle wird geladen..." :disabled="true" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  data: any;
  pending: boolean;
}

defineProps<Props>();

// Track hydration state to prevent mismatches
const isHydrated = ref(false);

onMounted(() => {
  isHydrated.value = true;
});
</script>
