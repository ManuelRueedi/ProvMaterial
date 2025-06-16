<script setup lang="ts">
import { upperFirst } from "scule";
import type { TableRow } from "@nuxt/ui";
import { useArticleTable } from "@/composables/articles/useArticleTable";
import type { Article, Project, Location } from "@/composables/articles/types";
import { useShowSelectedOnly } from "@/composables/useScannedArticles";
import { errorMap } from "@/composables/useFriendlyError";

// Fetch article data with proper SSR/client hydration
const {
  data: allArticles,
  pending: articlesPending,
  error: articlesError,
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

// Error handling for articles fetch
async function showErrorToast(
  error: unknown,
  defaultTitle: string,
  defaultDescription: string,
) {
  const friendlyError = errorMap(error);

  // Check if this error requires logout
  if (friendlyError.requiresLogout) {
    // Clear the user session
    const { clear: logout } = useUserSession();
    await logout();

    // Show the error message
    toast.add({
      title: friendlyError.title || defaultTitle,
      description: friendlyError.description || defaultDescription,
      color: friendlyError.color || "warning",
      icon: friendlyError.icon || "ph:warning-circle",
    });

    // Redirect to login after a short delay
    setTimeout(() => {
      navigateTo("/login?error=session_expired");
    }, 2000);

    return;
  }

  // Regular error handling
  toast.add({
    title: friendlyError.title || defaultTitle,
    description: friendlyError.description || defaultDescription,
    color: friendlyError.color || "error",
    icon: friendlyError.icon || "ph:warning-circle",
  });
}

// Watch for fetch errors
watch(articlesError, (error) => {
  if (error) {
    showErrorToast(
      error,
      "Fehler beim Laden der Artikel",
      "Die Artikel konnten nicht geladen werden. Bitte versuchen Sie es erneut.",
    );
  }
});

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
  columnFilters,
  typeFilterOpen,
  tagsFilterOpen,
  groupingOptions,
  handleRowClick,
  expanded,
  expandAllRows,
} = useArticleTable();

// Component state
const table = useTemplateRef("table");
const showDetails = ref(false);
const selectedArticle = ref<Article | null>(null);
const showCreateArticle = ref(false);
const showEditArticle = ref(false);
const showProjectManagement = ref(false);
const showLocationManagement = ref(false);

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

// Watch for column filter changes and expand all grouped rows when filter is applied
watch(
  columnFilters,
  (newFilters) => {
    if (newFilters && newFilters.length > 0 && table.value?.tableApi) {
      // Use nextTick to ensure the table has processed the filter
      nextTick(() => {
        if (table.value?.tableApi) {
          expandAllRows(table.value.tableApi);
        }
      });
    }
  },
  { deep: true },
);

// Close dropdown when clicking outside
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement;
    if (typeFilterOpen.value && !target.closest("[data-filter-dropdown]")) {
      typeFilterOpen.value = false;
    }
    if (tagsFilterOpen.value && !target.closest("[data-filter-dropdown]")) {
      tagsFilterOpen.value = false;
    }
  };

  document.addEventListener("click", handleClickOutside);

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
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
async function handleRefresh(silent = false) {
  try {
    await refreshArticles();
    if (!silent) {
      toast.add({
        title: "Artikel aktualisiert",
        description: `${allArticles.value?.length || 0} Artikel geladen`,
        color: "success",
        icon: "i-heroicons-check-circle",
      });
    }
  } catch (error) {
    console.error("Error refreshing articles:", error);
    await showErrorToast(
      error,
      "Fehler beim Aktualisieren",
      "Die Artikel konnten nicht aktualisiert werden",
    );
  }
}

// Handle manual refresh (with toast)
async function handleManualRefresh() {
  await handleRefresh(false);
}

// Handle article creation
function handleArticleCreated(newArticle: {
  articleId: string;
  success: boolean;
  message: string;
}) {
  toast.add({
    title: "Artikel erstellt",
    description: `Artikel "${newArticle.articleId}" wurde erfolgreich erstellt.`,
    color: "success",
    icon: "i-heroicons-check-circle",
  });
  // Refresh articles to show the new one (silent refresh since we show our own toast)
  handleRefresh(true);
}

// Handle article deletion
function handleArticleDeleted(articleId: string) {
  // Clear selected article if it was the one that got deleted
  if (selectedArticle.value?.id === articleId) {
    selectedArticle.value = null;
  }

  // Close the details slideover
  showDetails.value = false;

  // Refresh the articles list to reflect the deletion (silent refresh since we show our own toast)
  handleRefresh(true);

  toast.add({
    title: "Artikel entfernt",
    description: `Artikel "${articleId}" wurde aus der Liste entfernt.`,
    color: "info",
    icon: "i-heroicons-information-circle",
  });
}

// Handle article edit (placeholder for future implementation)
function handleArticleEdited(articleId: string) {
  // Show the edit slideover for the selected article
  if (selectedArticle.value && selectedArticle.value.id === articleId) {
    showEditArticle.value = true;
  }

  // Close the details slideover
  showDetails.value = false;
}

// Handle article update completion
function handleArticleUpdated(response: {
  success: boolean;
  articleId: string;
  message: string;
}) {
  // Refresh the articles list to reflect the changes (silent refresh since we show our own toast)
  handleRefresh(true);

  toast.add({
    title: "Artikel aktualisiert",
    description: `Artikel "${response.articleId}" wurde erfolgreich aktualisiert.`,
    color: "success",
    icon: "i-heroicons-check-circle",
  });
}

// Handle project creation
function handleProjectCreated(newProject: Project) {
  toast.add({
    title: "Projekt erstellt",
    description: `Projekt "${newProject.name}" wurde erfolgreich erstellt.`,
    color: "success",
    icon: "i-heroicons-check-circle",
  });
  // Refresh articles to show updated project references (silent refresh since we show our own toast)
  handleRefresh(true);
}

// Handle location creation
function handleLocationCreated(newLocation: Location) {
  toast.add({
    title: "Standort erstellt",
    description: `Standort "${newLocation.name}" wurde erfolgreich erstellt.`,
    color: "success",
    icon: "i-heroicons-check-circle",
  });
  // Refresh articles to show updated location references (silent refresh since we show our own toast)
  handleRefresh(true);
}
</script>

<template>
  <h1 class="my-5 text-center text-3xl font-bold">Übersicht</h1>

  <!-- Controls section with consistent spacing -->
  <div class="mb-6 flex w-full flex-col gap-4 sm:flex-row sm:justify-end">
    <!-- Active filter indicators -->
    <div
      v-if="
        showSelectedOnly ||
        (globalFilter && globalFilter.trim()) ||
        (columnFilters && columnFilters.length > 0)
      "
      class="flex flex-wrap justify-center gap-2 sm:justify-start"
    >
      <!-- Global search indicator -->
      <UBadge
        v-if="globalFilter && globalFilter.trim()"
        color="primary"
        variant="soft"
        size="md"
        class="flex items-center gap-1"
      >
        <UIcon name="i-heroicons-magnifying-glass" class="h-3 w-3" />
        Suche: "{{
          globalFilter.length > 15
            ? globalFilter.slice(0, 15) + "..."
            : globalFilter
        }}"
        <UButton
          color="primary"
          variant="ghost"
          icon="i-heroicons-x-mark"
          size="xs"
          @click="globalFilter = ''"
        />
      </UBadge>

      <!-- Column filter indicators -->
      <UBadge
        v-if="columnFilters && columnFilters.length > 0"
        color="info"
        variant="soft"
        size="md"
        class="flex items-center gap-1"
      >
        <UIcon name="i-heroicons-funnel" class="h-3 w-3" />
        {{ columnFilters.length }} Spaltenfilter aktiv
        <UButton
          color="info"
          variant="ghost"
          icon="i-heroicons-x-mark"
          size="xs"
          @click="columnFilters = []"
        />
      </UBadge>

      <!-- Show only scanned indicator -->
      <UBadge
        v-if="showSelectedOnly"
        color="success"
        variant="soft"
        size="md"
        class="flex items-center gap-1"
      >
        <UIcon name="ic:baseline-qr-code" class="h-3 w-3" />
        Nur gescannte ({{ selectedArticles.length }})
        <UButton
          color="success"
          variant="ghost"
          icon="i-heroicons-x-mark"
          size="xs"
          @click="showSelectedOnly = false"
        />
      </UBadge>
    </div>

    <!-- Filter and actions -->
    <div class="flex flex-row justify-center gap-4 sm:justify-end">
      <!-- Filter input -->
      <UInput
        v-model="globalFilter"
        class="sm:size-md w-full sm:w-64"
        placeholder="Filter..."
        size="lg"
        :color="globalFilter && globalFilter.trim() ? 'primary' : undefined"
        :icon="
          globalFilter && globalFilter.trim()
            ? 'i-heroicons-magnifying-glass-solid'
            : 'i-heroicons-magnifying-glass'
        "
      >
        <template v-if="globalFilter && globalFilter.trim()" #trailing>
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-heroicons-x-mark"
            size="xs"
            @click="globalFilter = ''"
          />
        </template>
      </UInput>

      <!-- Actions dropdown with column visibility -->
      <UDropdownMenu
        size="xl"
        :items="[
          [
            {
              label: 'Artikel hinzufügen',
              icon: 'ic:baseline-add',
              onSelect: () => (showCreateArticle = true),
            },
            {
              label: 'Artikel aktualisieren',
              icon: 'i-heroicons-arrow-path',
              onSelect: handleManualRefresh,
              disabled: articlesPending,
            },
            {
              label: 'Projekte verwalten',
              icon: 'i-heroicons-folder',
              onSelect: () => (showProjectManagement = true),
            },
            {
              label: 'Standorte verwalten',
              icon: 'i-heroicons-map-pin',
              onSelect: () => (showLocationManagement = true),
            },
            ...(isMobile
              ? [
                  {
                    label: showSelectedOnly
                      ? 'Alle anzeigen'
                      : 'Nur gescannte anzeigen',
                    icon: showSelectedOnly
                      ? 'i-heroicons-eye'
                      : 'ic:baseline-qr-code',
                    onSelect: () => (showSelectedOnly = !showSelectedOnly),
                  },
                ]
              : []),
            {
              label: 'Spalten verwalten',
              icon: 'i-heroicons-view-columns',
              children:
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
                  })) || [],
            },
          ],
        ]"
        :popper="{ placement: 'bottom-start' }"
      >
        <UButton
          label="Aktionen"
          color="primary"
          variant="solid"
          trailing-icon="i-heroicons-chevron-down"
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

    <!-- Error state -->
    <div
      v-else-if="articlesError"
      class="flex items-center justify-center p-12"
    >
      <UCard class="max-w-md shadow-lg">
        <div class="flex flex-col items-center space-y-6 p-8">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="h-16 w-16 text-red-500"
          />
          <div class="space-y-3 text-center">
            <h3 class="text-xl font-semibold text-red-600">
              Fehler beim Laden
            </h3>
            <p class="text-base">
              Die Artikel konnten nicht geladen werden. Bitte versuchen Sie es
              erneut.
            </p>
            <UButton
              color="primary"
              variant="solid"
              :loading="articlesPending"
              @click="handleManualRefresh"
            >
              Erneut versuchen
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
    <!-- Mobile-friendly table container -->
    <div
      v-else-if="!articlesError"
      class="relative min-h-96 w-full overflow-x-auto pb-4"
    >
      <!-- Empty state overlay for viewport centering -->
      <div
        v-if="articles.length === 0"
        class="absolute inset-0 z-10 flex items-center justify-center"
      >
        <div class="flex w-screen items-center justify-center px-4">
          <UCard class="max-w-md shadow-lg">
            <div class="flex flex-col items-center space-y-6 p-8">
              <UIcon name="i-heroicons-inbox" class="h-16 w-16" />
              <div class="space-y-3 text-center">
                <h3 class="text-xl font-semibold">Keine Daten</h3>
                <p class="text-base">
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
      </div>
      <ClientOnly>
        <UTable
          ref="table"
          v-model:column-visibility="columnVisibility"
          v-model:global-filter="globalFilter"
          v-model:column-pinning="columnPinning"
          v-model:expanded="expanded"
          v-model:sorting="sorting"
          v-model:column-filters="columnFilters"
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
            <!-- Empty state is handled by overlay above -->
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
      @article-deleted="handleArticleDeleted"
      @article-edited="handleArticleEdited"
    />
    <CreateArticleSlideover
      v-model:open="showCreateArticle"
      @article-created="handleArticleCreated"
    />
    <EditArticleSlideover
      v-model:open="showEditArticle"
      :article-id="selectedArticle?.id || ''"
      @article-updated="handleArticleUpdated"
    />
    <ProjectManagementSlideover
      v-model:open="showProjectManagement"
      @project-created="handleProjectCreated"
    />
    <LocationManagementSlideover
      v-model:open="showLocationManagement"
      @location-created="handleLocationCreated"
    />
  </ClientOnly>
</template>
