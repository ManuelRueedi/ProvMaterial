<template>
  <div v-if="article?.length !== '0m'" class="flex flex-col items-center">
    <h1 class="mb-2 text-xl">Länge</h1>
    <UBadge class="text-lg" color="neutral">{{ article?.length }}</UBadge>
  </div>

  <div v-if="article?.connector !== null" class="flex flex-col items-center">
    <h1 class="mb-2 text-xl">Anschluss</h1>
    <UBadge class="text-lg" color="neutral">{{ article?.connector }}</UBadge>
  </div>

  <div
    v-if="article?.outputs && Object.keys(article.outputs).length"
    class="flex flex-col items-center"
  >
    <h1 class="mb-2 text-xl">Abgänge</h1>
    <div class="flex flex-wrap justify-center gap-2">
      <UBadge
        class="text-lg"
        v-for="(value, key) in article.outputs"
        :key="key"
        color="neutral"
      >
        {{ value }}x {{ key }}
      </UBadge>
    </div>
  </div>

  <div v-if="article?.tags?.length" class="flex flex-col items-center">
    <h1 class="mb-2 text-xl">Tags</h1>
    <div class="flex flex-wrap justify-center gap-2">
      <UBadge
        class="text-lg"
        v-for="tag in article.tags"
        :key="tag"
        color="neutral"
      >
        {{ tag }}
      </UBadge>
    </div>
  </div>

  <!-- Lagerort -->
  <div v-if="article?.locationName" class="flex flex-col items-center">
    <h3 class="mb-2 text-xl font-medium text-gray-800 dark:text-gray-200">
      Lagerort
    </h3>
    <div class="flex flex-wrap gap-1">
      <UBadge class="text-lg" color="neutral">
        {{ article.locationName }}
      </UBadge>
      <UBadge v-if="article.storageLocationId" class="text-lg" color="neutral">
        Nr.{{ article.storageLocationId }}
      </UBadge>
    </div>
  </div>

  <slot></slot>
</template>

<script lang="ts" setup>
import type { Type, Connector, Tags } from "@/composables/articles/types";

interface ArticleDetailsItem {
  number: string;
  length: string; // "12.5 m"
  locationName: string; // warehouse name
  storageLocationId: string; // section code
  type: Type;
  connector: Connector;
  outputs: Record<Connector, number>;
  tags: Tags[];
}

defineProps<{
  article: ArticleDetailsItem | null;
}>();
</script>
