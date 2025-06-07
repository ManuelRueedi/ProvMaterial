<script setup lang="ts">
import { upperFirst } from "scule";
import type { TableRow } from "@nuxt/ui";
import { useArticleTable } from "@/composables/articles/useArticleTable";
import type { Article } from "@/composables/articles/types";
import { useShowSelectedOnly } from "@/composables/useScannedArticles";

// Fetch article data with proper SSR/client hydration
const {
  data: allArticles,
  pending: articlesPending,
  error: _error,
  refresh: refreshArticles,
} = await useFetch<Article[]>("/api/articles/getAll", {
  key: "ArticleData",
  lazy: false, // Enable immediate loading for SSR
  server: true, // Enable server-side rendering
  default: () => [],
  transform: (data: Article[]) => {
    // Ensure consistent data structure for hydration
    return data.map((article) => ({
      ...article,
      outputs: article.outputs || {},
      tags: article.tags || [],
      // Ensure all optional fields have default values
      connector: article.connector || undefined,
      storageLocationSection: article.storageLocationSection || undefined,
      location: article.location || undefined,
      project: article.project || undefined,
    }));
  },
});

// Use scanned articles composable
const { selectedArticles } = useScannedArticles();
const toast = useToast();
const { isMobile } = useDevice();

// Switch between all articles and selected articles - use global state
const showSelectedOnly = useShowSelectedOnly();
const articles = computed<Article[]>(() => {
  return showSelectedOnly.value
    ? (selectedArticles.value as Article[])
    : allArticles.value;
});
const {
  tableUi,
  columns,
  columnVisibility,
  columnPinning,
  globalFilter,
  sorting,
  groupingOptions,
  handleRowClick,
  expanded,
  expandAllRows,
} = useArticleTable();

// Component state
const table = useTemplateRef("table");
const showDetails = ref(false);
const selectedArticle = ref<Article | null>(null);

// Watch for filter changes and expand all grouped rows when filter is applied
watch(globalFilter, (newFilter) => {
  if (newFilter && newFilter.trim() !== "" && table.value?.tableApi) {
    // Use nextTick to ensure the table has processed the filter
    nextTick(() => {
      if (table.value?.tableApi) {
        expandAllRows(table.value.tableApi);
      }
    });
  }
});

// Handle article details
function showArticleDetails(article: Article) {
  selectedArticle.value = article;
  showDetails.value = true;
}

// Handle row selection
function onRowSelect(row: TableRow<Article>, e?: Event) {
  handleRowClick(row, e, table, showArticleDetails);
}

// Handle refresh
async function handleRefresh() {
  try {
    await refreshArticles();
    toast.add({
      title: "Artikel aktualisiert",
      description: `${allArticles.value?.length || 0} Artikel geladen`,
      color: "success",
      icon: "i-heroicons-check-circle",
    });
  } catch (error) {
    console.error("Error refreshing articles:", error);
    toast.add({
      title: "Fehler beim Aktualisieren",
      description: "Die Artikel konnten nicht aktualisiert werden",
      color: "error",
      icon: "i-heroicons-exclamation-triangle",
    });
  }
}
</script>

<template>
  <h1 class="my-5 text-center text-3xl font-bold">Übersicht</h1>

  <div
    class="wrap mt-10 mb-3 flex w-full flex-wrap justify-center gap-8 sm:justify-start"
  >
    <!--Filter and Refresh button -->
    <div class="flex gap-4">
      <UButton
        icon="ic:baseline-add"
        variant="solid"
        color="primary"
        size="lg"
        class="sm:size-md"
      />
      <ClientOnly>
        <UTooltip text="Artikel aktualisieren">
          <UButton
            :loading="articlesPending"
            icon="i-heroicons-arrow-path"
            variant="solid"
            color="neutral"
            size="lg"
            @click="handleRefresh"
          />
        </UTooltip>
        <template #fallback>
          <UButton
            icon="i-heroicons-arrow-path"
            variant="outline"
            color="neutral"
            size="lg"
            disabled
          />
        </template>
      </ClientOnly>
      <UTooltip v-if="isMobile" text="Gescannte / Alle Artikel anzeigen">
        <div class="flex min-w-20 flex-row items-center gap-3">
          <USwitch v-model="showSelectedOnly" size="lg" class="sm:size-md" />
          <span class="text-sm font-medium sm:text-base">
            {{ showSelectedOnly ? `Gescannte` : `Alle` }}
          </span>
        </div>
      </UTooltip>
    </div>
    <div class="flex flex-row">
      <!-- Switch between all articles and selected articles -->
      <UInput
        v-model="globalFilter"
        class="w-full sm:max-w-sm"
        placeholder="Filter..."
        size="lg"
      />
      <UDropdownMenu
        :items="
          table?.tableApi
            ?.getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => ({
              label: upperFirst(column.id),
              type: 'checkbox' as const,
              checked: column.getIsVisible(),
              onUpdateChecked(checked: boolean) {
                table?.tableApi
                  ?.getColumn(column.id)
                  ?.toggleVisibility(!!checked);
              },
              onSelect(e?: Event) {
                e?.preventDefault();
              },
            }))
        "
        :content="{ align: 'end' }"
      >
        <UButton
          label="Spalten"
          color="neutral"
          variant="outline"
          trailing-icon="ic:baseline-arrow-downward"
          size="lg"
          class="sm:size-md"
        />
      </UDropdownMenu>
    </div>
  </div>

  <!-- Table with better hydration handling -->
  <div class="w-full">
    <!-- Loading state for SSR -->
    <div v-if="articlesPending" class="flex items-center justify-center p-12">
      <UButton loading label="Tabelle wird geladen..." :disabled="true" />
    </div>

    <!-- Mobile-friendly table container -->
    <div v-else class="w-full overflow-x-auto pb-4">
      <ClientOnly>
        <UTable
          ref="table"
          v-model:column-visibility="columnVisibility"
          v-model:global-filter="globalFilter"
          v-model:column-pinning="columnPinning"
          v-model:expanded="expanded"
          v-model:sorting="sorting"
          sticky
          :data="articles"
          :columns="columns"
          :grouping="['projectName', 'locationName']"
          :grouping-options="groupingOptions"
          :ui="tableUi"
          @select="onRowSelect"
        >
          <template #title-cell="{ row }">
            <div v-if="row.getIsGrouped()" class="flex items-center">
              <span
                class="inline-block"
                :style="{ width: `calc(${row.depth} * 1rem)` }"
              />

              <UButton
                variant="outline"
                color="neutral"
                class="mr-2"
                :size="isMobile ? 'xs' : 'sm'"
                :icon="
                  row.getIsExpanded() ? 'ic:baseline-minus' : 'ic:baseline-plus'
                "
                @click="row.toggleExpanded()"
              />
              <strong
                v-if="row.groupingColumnId === 'projectName'"
                class="truncate text-sm sm:text-base"
              >
                {{ row.original.project?.name || "Ohne Projekt" }}
              </strong>
              <strong
                v-else-if="row.groupingColumnId === 'locationName'"
                class="truncate text-sm sm:text-base"
              >
                {{ row.original.location?.name || "Unbekannt" }}
              </strong>
            </div>
          </template>
          <template #empty>
            <div class="w-[calc(100vw-30px)]">
              <UCard class="mx-auto max-w-sm">
                <div class="flex flex-col items-center space-y-4">
                  <UIcon
                    name="i-heroicons-inbox"
                    class="h-12 w-12 text-gray-400"
                  />
                  <div class="space-y-2">
                    <h3 class="text-lg font-semibold">Keine Daten</h3>
                    <p class="text-sm text-gray-500">
                      {{
                        showSelectedOnly
                          ? "Es wurden keine Artikel gescannt."
                          : "Es sind keine Artikel verfügbar."
                      }}
                    </p>
                  </div>
                </div>
              </UCard>
            </div>
          </template>
        </UTable>
        <template #fallback>
          <div class="flex items-center justify-center p-12">
            <UButton loading label="Tabelle wird geladen..." :disabled="true" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
  <ClientOnly>
    <ArticleHistoryDrawer
      v-model:show-details="showDetails"
      :selected-article="selectedArticle"
    />
  </ClientOnly>
</template>
