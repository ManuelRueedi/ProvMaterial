<template>
  <div class="container mx-auto p-4">
    <!-- Your existing index content -->

    <!-- Article details slideover -->
    <USlideover
      v-model:open="showDetails"
      :side="isDesktop ? 'right' : 'bottom'"
      :ui="{
        title: 'text-center text-3xl font-bold',
        description: 'text-center text-2xl',
        header: 'justify-center py-7',
        body: 'flex flex-col gap-5',
      }"
    >
      <template #title>
        {{ selectedArticle?.number }}
      </template>
      <template #description>
        {{ selectedArticle?.type }}
      </template>
      <template #body>
        <ArticleDetails :article="selectedArticle" />
      </template>
    </USlideover>
  </div>
</template>

<script lang="ts" setup>
import type { Type, Connector, Tags } from "@/composables/articles/types";
const { isDesktop } = useDevice();

// Define the article structure (same as in takeOut.vue)
interface ArticleDetailsItem {
  number: string;
  length: string;
  locationName: string;
  storageLocationId: string;
  type: Type;
  connector: Connector;
  outputs: Record<Connector, number>;
  tags: Tags[];
}

// Show/hide details panel
const showDetails = ref(false);
const selectedArticle = ref<ArticleDetailsItem | null>(null);

// Function to open article details
function openArticleDetails(article: ArticleDetailsItem) {
  selectedArticle.value = article;
  showDetails.value = true;
}

// Your existing logic for fetching and displaying articles
</script>
