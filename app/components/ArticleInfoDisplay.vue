<template>
  <div>
    <!-- Header Section with Number and Type -->
    <div class="border-default relative border-b p-4 sm:p-6">
      <div class="flex flex-col gap-3">
        <!-- Main Article Number -->
        <h2 class="text-3xl font-bold">
          {{ article.number }}
        </h2>

        <!-- Type and Length Group -->
        <div
          v-if="articleType || articleLength !== '0m'"
          class="flex items-center gap-3"
        >
          <UBadge
            v-if="articleType"
            size="xl"
            color="primary"
            variant="soft"
            class="font-medium"
          >
            {{ articleType }}
          </UBadge>
          <UBadge
            v-if="articleLength !== '0m'"
            size="xl"
            color="success"
            variant="outline"
            class="font-semibold"
          >
            {{ articleLength }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-4 sm:p-6">
      <!-- Connection Information -->
      <div v-if="article.connector" class="mb-4 sm:mb-6">
        <div class="mb-2 flex items-center gap-2 sm:mb-3">
          <div class="h-2 w-2 rounded-full bg-neutral-400"></div>
          <h3
            class="text-highlighted text-md font-semibold tracking-wide uppercase"
          >
            Anschluss
          </h3>
        </div>
        <UBadge
          size="xl"
          color="neutral"
          variant="soft"
          class="min-w-0 font-mono text-sm sm:text-base"
        >
          {{ article.connector }}
        </UBadge>
      </div>

      <!-- Outputs Section -->
      <div
        v-if="article.outputs && Object.keys(article.outputs).length"
        class="mb-4 sm:mb-6"
      >
        <div class="mb-2 flex items-center gap-2 sm:mb-3">
          <div class="h-2 w-2 rounded-full bg-neutral-400"></div>
          <h3
            class="text-highlighted text-md font-semibold tracking-wide uppercase"
          >
            Abgänge
          </h3>
        </div>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="(value, key) in article.outputs"
            :key="key"
            size="xl"
            color="neutral"
            variant="soft"
            class="min-w-0 font-mono text-sm"
          >
            {{ value }}× {{ key }}
          </UBadge>
        </div>
      </div>

      <!-- Storage Location -->
      <div v-if="locationName" class="mb-4 sm:mb-6">
        <div class="mb-2 flex items-center gap-2 sm:mb-3">
          <div class="h-2 w-2 rounded-full bg-neutral-400"></div>
          <h3
            class="text-highlighted text-md font-semibold tracking-wide uppercase"
          >
            Lagerort
          </h3>
        </div>
        <div class="flex flex-wrap gap-2">
          <UBadge
            size="xl"
            color="neutral"
            variant="soft"
            class="min-w-0 text-sm font-medium"
          >
            {{ locationName }}
          </UBadge>
          <UBadge
            v-if="storageLocationId"
            size="xl"
            color="neutral"
            variant="outline"
            class="min-w-0 font-mono text-sm"
          >
            #{{ storageLocationId }}
          </UBadge>
        </div>
      </div>

      <!-- Tags Section -->
      <div v-if="article.tags?.length">
        <div class="mb-2 flex items-center gap-2 sm:mb-3">
          <div class="h-2 w-2 rounded-full bg-neutral-400"></div>
          <h3
            class="text-highlighted text-md font-semibold tracking-wide uppercase"
          >
            Tags
          </h3>
        </div>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="tag in article.tags"
            :key="tag"
            size="lg"
            :color="tag === 'defekt' ? 'error' : 'neutral'"
            variant="soft"
            class="min-w-0 text-xs sm:text-sm"
          >
            {{ tag }}
          </UBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type {
  TableItem,
  Connector,
  Type,
  Tag,
} from "@/composables/articles/types";

type Article =
  | TableItem
  | {
      number: string;
      type?: Type;
      length?: string;
      connector?: Connector;
      outputs?: Partial<Record<Connector, number>>;
      tags?: Tag[];
      storageLocation?: string;
      storageLocationSection?: number | string;
    };

const props = defineProps<{
  article: Article;
}>();

// Computed properties to handle different property names
const locationName = computed(() => {
  if ("locationName" in props.article) {
    return props.article.locationName;
  }
  if ("storageLocation" in props.article) {
    return props.article.storageLocation;
  }
  return null;
});

const storageLocationId = computed(() => {
  if ("storageLocationId" in props.article) {
    return props.article.storageLocationId;
  }
  if ("storageLocationSection" in props.article) {
    return props.article.storageLocationSection;
  }
  return null;
});

const articleType = computed(() => {
  return props.article.type;
});

const articleLength = computed(() => {
  return props.article.length || "0m";
});
</script>
