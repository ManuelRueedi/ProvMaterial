<script setup lang="ts">
import type { HistoryView } from "~~/server/api/articles/[articleId]/history.get";
import type { Connector, Type, Tag } from "@/composables/articles/types";

/* external state — provide these from the parent */
const props = defineProps<{
  showDetails: boolean;
  selectedArticle: {
    id?: string;
    number?: string;
    type?: Type;
    length?: string;
    lengthInMeter?: number;
    connector?: Connector;
    outputs?: Partial<Record<Connector, number>>;
    tags?: Tag[];
    locationName?: string;
    storageLocation?: string;
    storageLocationSection?: number | string;
  } | null;
}>();

const emit = defineEmits<{
  (e: "update:showDetails", value: boolean): void;
}>();

const { isDesktop } = useDevice();

/* --- 1. lazy fetch ------------------------------------------------------- */
const {
  data: historyData,
  pending,
  error,
  refresh,
} = useLazyAsyncData<HistoryView[]>(
  "article-history",
  () => {
    const articleId =
      props.selectedArticle?.id || props.selectedArticle?.number;
    if (!articleId) throw new Error("No article ID available");
    return $fetch<HistoryView[]>(
      `/api/articles/${encodeURIComponent(articleId)}/history`,
    );
  },
  { immediate: false },
);

// Transform API data format to HistoryTimeline format
const transformedHistory = computed(() => {
  if (!historyData.value) return [];

  return historyData.value.map((item) => ({
    locationName: item.locationName,
    locationAddress: item.locationAddress,
    projectName: item.projectName || "Kein Projekt",
    projectDescription: item.projectDescription || "",
    // Convert milliseconds to seconds
    from: Math.floor(item.from / 1000),
    // Convert null to 0 for current entries
    to: item.to ? Math.floor(item.to / 1000) : 0,
    id: item.from.toString(),
  }));
});

/* --- 2. run every time the drawer opens ---------------------------------- */
watch(
  () => props.showDetails,
  (open) => {
    if (open && props.selectedArticle) refresh();
  },
);

/* --- 3. also refetch if another article is selected while the drawer stays open */
watch(
  () => props.selectedArticle?.number,
  () => {
    if (props.showDetails && props.selectedArticle) refresh();
  },
);
</script>

<template>
  <USlideover
    :side="isDesktop ? 'right' : 'bottom'"
    :open="props.showDetails"
    @update:open="emit('update:showDetails', $event)"
  >
    <!-- Hidden title for accessibility -->
    <template #title>
      <span class="sr-only">Artikelinfo</span>
    </template>

    <!-- Hidden description for accessibility -->
    <template #description>
      <span class="sr-only"
        >Zeigt Artikeldetails und Verlaufsinformationen an</span
      >
    </template>

    <!-- Scrollbarer Haupt-Content -->
    <template #content>
      <div class="flex h-full flex-col">
        <!-- Close Button -->
        <div class="absolute top-5 right-10 z-10 flex shadow-sm">
          <UButton
            icon="ic:baseline-close"
            variant="soft"
            color="error"
            size="xl"
            @click="emit('update:showDetails', false)"
          />
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto px-4 pt-16 pb-4">
          <ArticleInfoDisplay
            v-if="props.selectedArticle"
            :article="props.selectedArticle"
          />
          <USeparator label="Verlauf" />

          <!-- Verlauf -->
          <div class="mt-12">
            <div v-if="pending" class="flex justify-center">
              <UButton loading label="Lade Verlauf..." :disabled="true" />
            </div>

            <UAlert
              v-else-if="error"
              color="error"
              :title="error.statusMessage ?? 'Fehler'"
            />

            <HistoryTimeline v-else :history="transformedHistory" />
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
