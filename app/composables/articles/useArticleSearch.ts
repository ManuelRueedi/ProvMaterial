import { ref, computed } from "vue";
import type {
  Config,
  ArticleSearchResult,
  ArticleSearchResponse,
  TableItem,
} from "@/composables/articles/types";
import { errorMap } from "@/composables/useFriendlyError";

// Transform article to table item
const articleToTableItem = (a: ArticleSearchResult): TableItem => ({
  number: a.id,
  length: `${a.lengthInMeter}m`,
  locationName: a.storageLocation.name,
  storageLocationId: a.storageLocationSection,
  type: a.type,
  connector: a.connector,
  outputs: a.outputs,
  tags: a.tags,
});

export function useArticleSearch() {
  const toast = useToast();

  // Search state
  const foundArticles = ref<ArticleSearchResponse | null>({
    items: [],
    bundles: [],
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed table data
  const tableItems = computed<TableItem[]>(() => {
    if (!foundArticles.value) return [];
    return foundArticles.value.items.map(articleToTableItem);
  });

  const tableBundles = computed<TableItem[][]>(() => {
    if (!foundArticles.value || !("bundles" in foundArticles.value)) return [];
    return foundArticles.value.bundles.map((bundle) =>
      bundle.map(articleToTableItem),
    );
  });

  // Search function
  async function findArticles(config: Config) {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await $fetch<ArticleSearchResponse>("/api/articles/search", {
        method: "POST",
        body: config,
        headers: { "Content-Type": "application/json" },
      });
      foundArticles.value = data;
    } catch (err: any) {
      toast.add(errorMap(err));
      error.value = err;
      foundArticles.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    foundArticles,
    isLoading,
    error,
    tableItems,
    tableBundles,
    findArticles,
  };
}
