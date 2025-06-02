<template>
  <!-- Article Details Section -->
  <div class="flex flex-col gap-6">
    <ArticleInfoDisplay v-if="article" :article="article" />

    <slot></slot>

    <USeparator label="Austragen" />
    <!-- Take Out Form Section -->
    <TakeOutForm :disabled="!article" @take-out="handleTakeOut" />
  </div>
</template>

<script lang="ts" setup>
import type { TableItem } from "@/composables/articles/types";
const props = defineProps<{
  article: TableItem | null;
}>();

const emit = defineEmits<{
  takeOut: [articleId: string, locationId: number, projectId?: number];
}>();

async function handleTakeOut(locationId: number, projectId?: number) {
  if (!props.article) return;

  emit("takeOut", props.article.number, locationId, projectId);
}
</script>
