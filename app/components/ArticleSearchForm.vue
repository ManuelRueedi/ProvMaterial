<template>
  <div class="w-full">
    <UCard
      v-if="selectedArticles.length > 0"
      class="mb-4 w-full max-w-xl justify-self-center border pb-4 shadow-lg"
      variant="outline"
    >
      <template #header>
        <div class="flex items-center justify-center gap-3">
          <UIcon name="i-heroicons-qr-code" :size="30" />
          <h1 class="text-lg font-semibold">Gescannte Artikel</h1>
        </div>
      </template>
      <SearchResults
        v-if="selectedArticles.length == 1"
        :items="selectedArticles"
        :bundles="[]"
        :columns="tableColumns"
        :loading="false"
        @select-article="(row) => $emit('selectArticle', row.original)"
        @select-bundle="(bundle) => $emit('selectBundle', bundle)"
      />
      <SearchResults
        v-if="selectedArticles.length > 1"
        :items="[]"
        :bundles="[selectedArticles]"
        :columns="tableColumns"
        :loading="false"
        @select-article="(row) => $emit('selectArticle', row.original)"
        @select-bundle="(bundle) => $emit('selectBundle', bundle)"
      />
    </UCard>
    <!-- Selected Scanned Articles Display -->

    <!-- Search Form -->
    <div
      class="mx-auto flex w-full max-w-7xl flex-wrap items-start justify-center gap-7 pt-5"
    >
      <!-- Type Selection -->
      <LabeledField
        v-model="config.type"
        type="select"
        icon="ic:baseline-view-in-ar"
        :items="TypeEnum.options"
        searchable
      >
        Typ
      </LabeledField>

      <!-- Ampacity Selection -->
      <LabeledField
        v-model="config.ampacity"
        type="select"
        icon="ic:baseline-electric-bolt"
        :items="ampacityOptions"
      >
        Nennstrom
      </LabeledField>

      <!-- Connector Selection -->
      <LabeledField
        v-if="connectorOptions.length"
        v-model="config.connector"
        type="select"
        icon="ic:baseline-power"
        :items="connectorOptions"
      >
        Anschluss
      </LabeledField>

      <!-- Length Input -->
      <LabeledField
        v-model="config.length"
        type="number"
        icon="i-lucide-ruler"
        placeholder="Länge in Metern"
        :step="5"
        :min="0"
        :max="250"
      >
        Länge
      </LabeledField>

      <!-- Tags Selection -->
      <LabeledField
        v-if="tagsEnabled"
        v-model="config.tags"
        type="multi-select"
        :items="tagsOptions"
        icon="i-lucide-tags"
        placeholder="Tags auswählen"
      >
        Tags
      </LabeledField>

      <!-- Sockets Configuration -->
      <div class="flex w-full max-w-xl flex-col gap-2">
        <SocketsConfiguration
          v-if="socketsEnabled"
          v-model:selected="selectedSocket"
          v-model:number="selectedSocketNumber"
          :options="socketsOptions"
          @add="handleAddSocket"
        />
        <SelectedSocketsList
          :sockets="config.sockets"
          @remove="removeSocketFromSelection"
        />
      </div>
    </div>
    <!-- Selected Sockets Display -->

    <!-- Separator -->
    <div class="flex w-full justify-center">
      <USeparator
        class="h-2 w-full max-w-xl p-3"
        color="neutral"
        type="solid"
      />
    </div>

    <!-- Search Button -->
    <UButton
      :color="error ? 'warning' : 'primary'"
      :loading="isLoading"
      class="mx-auto my-5 flex w-full max-w-xl justify-center"
      @click="handleSearch"
    >
      Suchen
    </UButton>
    <!-- Search Results -->
    <SearchResults
      v-if="articles.length > 0 || articleBundles.length > 0"
      :items="articles"
      :bundles="articleBundles"
      :columns="tableColumns"
      :loading="isLoading"
      @select-article="(row) => $emit('selectArticle', row.original)"
      @select-bundle="(bundle) => $emit('selectBundle', bundle)"
    />
    <!-- No Results Message -->
    <UCard
      v-if="!isLoading && foundArticles === null"
      class="mx-auto my-8 max-w-lg"
      :ui="emptyResultsUi"
    >
      <div class="flex flex-col items-center space-y-4">
        <div class="rounded-full">
          <UIcon name="i-heroicons-magnifying-glass" class="h-8 w-8" />
        </div>

        <div class="space-y-2">
          <h3 class="text-lg font-semibold">Keine Artikel gefunden</h3>
          <p class="max-w-sm text-sm">
            Es wurden keine Artikel gefunden, die Ihren Suchkriterien
            entsprechen. Versuchen Sie es mit anderen Filtereinstellungen.
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { useConfigurator } from "@/composables/articles/useConfigurator";
import { TypeEnum, type Article } from "@/composables/articles/types";
import { useArticleSearch } from "@/composables/articles/useArticleSearch";
import { useSocketSelection } from "@/composables/articles/useSocketSelection";

const emptyResultsUi = reactive({ body: "text-center space-y-4" });

// Define emits
defineEmits<{
  selectArticle: [article: Article];
  selectBundle: [bundle: Article[]];
}>();

// Define expose for parent component access
defineExpose({
  refreshSearch: () => {
    // Only refresh if we have some search criteria
    if (config.type) {
      findArticles(config);
    }
  },
});

// Add useScannedArticles composable
const { selectedArticles: rawSelectedArticles } = useScannedArticles();

// Convert readonly articles to mutable articles for SearchResults
const selectedArticles = computed(
  () =>
    rawSelectedArticles.value
      .filter((article) => article.location?.id === article.storageLocation.id)
      .map((article) => ({
        ...article,
        tags: [...article.tags],
        outputs: { ...article.outputs },
      })) as Article[],
);

// Table configuration
const tableColumns = [
  {
    accessorKey: "id",
    header: "Nummer",
  },
  {
    accessorKey: "lengthInMeter",
    header: "Länge",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) =>
      `${row.getValue("lengthInMeter")}m`,
  },
  {
    accessorKey: "storageLocation",
    header: "Ort",
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) => {
      const location = row.getValue("storageLocation") as
        | { name?: string }
        | null
        | undefined;
      return location?.name || "";
    },
  },
  {
    accessorKey: "storageLocationSection",
    header: "Platz",
  },
];

// Configuration and options
const {
  config,
  ampacityOptions,
  connectorOptions,
  socketsEnabled,
  socketsOptions,
  tagsOptions,
  tagsEnabled,
} = useConfigurator();

// Search functionality
const {
  foundArticles,
  isLoading,
  error,
  articles,
  articleBundles,
  findArticles,
} = useArticleSearch();

// Socket selection
const {
  selectedSocket,
  selectedSocketNumber,
  handleAddSocket: setSelectedSocket,
  removeSocketFromSelection,
} = useSocketSelection(config);

// Handle search button click
const handleSearch = () => {
  findArticles(config);
};

// Handle adding socket with validation
const handleAddSocket = () => {
  setSelectedSocket();
};
</script>
