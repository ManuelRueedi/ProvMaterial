<script setup lang="ts">
import type { HistoryView } from "~~/server/api/articles/[articleId]/history.get";
import type { Connector, Type, Tags } from "@/composables/articles/types";

/* external state — provide these from the parent */
const props = defineProps<{
  showDetails: boolean;
  selectedArticle: {
    number: string;
    type?: Type;
    length?: string;
    connector?: Connector;
    outputs?: Partial<Record<Connector, number>>;
    tags?: Tags[];
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
  () =>
    $fetch(
      `/api/articles/${encodeURIComponent(props.selectedArticle!.number)}/history`,
    ),
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
    :close="{
      color: 'primary',
      variant: 'solid',
      size: 'xl',
    }"
    :open="props.showDetails"
    @update:open="emit('update:showDetails', $event)"
    :ui="{
      title: 'text-center text-3xl font-bold',
      description: 'text-center text-2xl ',
      header: 'justify-center py-7',
    }"
  >
    <!-- Header mit Titel und Close-Icon -->
    <template #title>
      <h1>
        {{ props.selectedArticle?.number }}
      </h1>
    </template>

    <!-- Beschreibung unter dem Titel -->
    <template #description>
      <h2>
        {{ props.selectedArticle?.type }}
      </h2>
    </template>

    <!-- Scrollbarer Haupt-Content -->
    <template #body>
      <div class="flex-1 overflow-y-auto">
        <!-- Details -->
        <div class="space-y-6 px-4">
          <!-- Länge -->
          <div
            v-if="props.selectedArticle?.length !== '0m'"
            class="flex flex-col items-center"
          >
            <h3
              class="mb-2 text-xl font-medium text-gray-800 dark:text-gray-200"
            >
              Länge
            </h3>
            <UBadge class="text-lg" color="neutral">
              {{ props.selectedArticle?.length }}
            </UBadge>
          </div>

          <!-- Anschluss -->
          <div
            v-if="props.selectedArticle?.connector"
            class="flex flex-col items-center"
          >
            <h3
              class="mb-2 text-xl font-medium text-gray-800 dark:text-gray-200"
            >
              Anschluss
            </h3>
            <UBadge class="text-lg" color="neutral">
              {{ props.selectedArticle.connector }}
            </UBadge>
          </div>

          <!-- Abgänge -->
          <div
            v-if="
              props.selectedArticle?.outputs &&
              Object.keys(props.selectedArticle.outputs).length
            "
            class="flex flex-col items-center"
          >
            <h3
              class="mb-2 text-xl font-medium text-gray-800 dark:text-gray-200"
            >
              Abgänge
            </h3>
            <div class="flex flex-wrap justify-center gap-2">
              <UBadge
                class="text-lg"
                v-for="(value, key) in props.selectedArticle.outputs"
                :key="key"
                color="neutral"
              >
                {{ value }}x {{ key }}
              </UBadge>
            </div>
          </div>

          <!-- Tags -->
          <div
            v-if="
              props.selectedArticle?.tags && props.selectedArticle.tags.length
            "
            class="flex flex-col items-center"
          >
            <h3
              class="mb-2 text-xl font-medium text-gray-800 dark:text-gray-200"
            >
              Tags
            </h3>
            <div class="flex flex-wrap justify-center gap-2">
              <UBadge
                class="text-lg"
                v-for="tag in props.selectedArticle.tags"
                :key="tag"
                :color="tag === 'defekt' ? 'error' : 'neutral'"
              >
                {{ tag }}
              </UBadge>
            </div>
          </div>

          <!-- Lagerort -->
          <div
            v-if="props.selectedArticle?.storageLocation"
            class="flex flex-col items-center"
          >
            <h3
              class="mb-2 text-xl font-medium text-gray-800 dark:text-gray-200"
            >
              Lagerort
            </h3>
            <div class="flex flex-wrap gap-1">
              <UBadge class="text-lg" color="neutral">
                {{ props.selectedArticle.storageLocation }}
              </UBadge>
              <UBadge
                v-if="props.selectedArticle.storageLocationSection"
                class="text-lg"
                color="neutral"
              >
                Nr.{{ props.selectedArticle.storageLocationSection }}
              </UBadge>
            </div>
          </div>

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
