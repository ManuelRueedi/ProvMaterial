<template>
  <div
    class="max-w-8xl mx-auto flex w-full flex-wrap justify-center gap-8 pt-5"
  >
    <!-- Individual Items Results -->
    <UCard v-if="items.length" class="h-fit w-full max-w-xl shadow-sm">
      <UTable
        class="w-full"
        @select="$emit('selectArticle', $event)"
        :loading="loading"
        :columns="columns"
        :data="items"
      />
    </UCard>

    <!-- Bundle Results -->
    <div v-if="bundles.length" class="flex w-full max-w-xl flex-col gap-4">
      <UCard
        v-for="(bundle, index) in bundles"
        :key="index"
        class="flex w-full max-w-xl flex-col shadow-sm"
      >
        <UTable
          @select="$emit('selectArticle', $event)"
          :loading="loading"
          :columns="columns"
          :data="bundle"
        />

        <template #footer>
          <UButton
            block
            variant="subtle"
            label="Alle austragen"
            @click="handleSelectAllFromBundle(bundle)"
          />
        </template>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Article } from "@/composables/articles/types";

interface Props {
  items: Article[];
  bundles: Article[][];
  columns: any[];
  loading: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  selectArticle: [row: { original: Article }];
  selectBundle: [bundle: Article[]];
}>();

const handleSelectAllFromBundle = (bundle: Article[]) => {
  emit("selectBundle", bundle);
};
</script>
