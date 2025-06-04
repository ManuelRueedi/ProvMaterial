<template>
  <div class="w-full">
    <!-- Search Form -->
    <div
      class="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-7 pt-5"
    >
      <!-- Type Selection -->
      <labeledSelection
        icon="ic:baseline-view-in-ar"
        :items="TypeEnum.options"
        v-model="config.type"
      >
        Typ
      </labeledSelection>

      <!-- Ampacity Selection -->
      <labeledSelection
        icon="ic:baseline-electric-bolt"
        :items="ampacityOptions"
        v-model="config.ampacity"
      >
        Nennstrom
      </labeledSelection>

      <!-- Connector Selection -->
      <labeledSelection
        v-if="connectorOptions.length"
        icon="ic:baseline-power"
        :items="connectorOptions"
        v-model="config.connector"
      >
        Anschluss
      </labeledSelection>

      <!-- Length Input -->
      <SearchFormField icon="ic:baseline-settings-ethernet" label="Länge">
        <UInputNumber
          class="flex-2/3"
          :step="5"
          :min="0"
          :max="250"
          v-model="config.length"
        />
      </SearchFormField>

      <!-- Tags Selection -->
      <SearchFormField v-if="tagsEnabled" icon="ic:baseline-tag" label="Tags">
        <USelect
          class="flex-2/3"
          v-model="config.tags"
          multiple
          :items="tagsOptions"
        />
      </SearchFormField>

      <!-- Sockets Configuration -->
      <SocketsConfiguration
        v-if="socketsEnabled"
        :options="socketsOptions"
        v-model:selected="selectedSocket"
        v-model:number="selectedSocketNumber"
        @add="handleAddSocket"
      />
    </div>

    <!-- Selected Sockets Display -->
    <SelectedSocketsList
      :sockets="config.sockets"
      @remove="removeSocketFromSelection"
    />

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
const emit = defineEmits<{
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

// Table configuration
const tableColumns = [
  {
    accessorKey: "id",
    header: "Nummer",
  },
  {
    accessorKey: "lengthInMeter",
    header: "Länge",
    cell: ({ row }: any) => `${row.getValue("lengthInMeter")}m`,
  },
  {
    accessorKey: "storageLocation",
    header: "Ort",
    cell: ({ row }: any) => row.getValue("storageLocation")?.name || "",
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
