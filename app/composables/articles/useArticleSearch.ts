import { ref, computed } from "vue";
import type {
  Config,
  Type,
  Connector,
  Tags,
} from "@/composables/articles/types";
import type {
  HandlerResult,
  Article,
} from "~~/server/api/articles/search.post";
import { errorMap } from "@/composables/useFriendlyError";

export interface TableItem {
  number: string;
  length: string;
  locationName: string;
  storageLocationId: string;
  type: Type;
  connector: Connector;
  outputs: Record<Connector, number>;
  tags: Tags[];
}

// Transform article to table item
const articleToTableItem = (a: Article): TableItem => ({
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
  const foundArticls = ref<HandlerResult | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed table data
  const tableItems = computed<TableItem[]>(() => {
    if (!foundArticls.value) return [];
    return foundArticls.value.items.map(articleToTableItem);
  });

  const tableBundles = computed<TableItem[][]>(() => {
    if (!foundArticls.value || !("bundles" in foundArticls.value)) return [];
    return foundArticls.value.bundles.map((bundle) =>
      bundle.map(articleToTableItem),
    );
  });

  // Search function
  async function findArticles(config: Config) {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await $fetch<HandlerResult>("/api/articles/search", {
        method: "POST",
        body: config,
        headers: { "Content-Type": "application/json" },
      });
      foundArticls.value = data;
    } catch (err: any) {
      toast.add(errorMap(err));
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    foundArticls,
    isLoading,
    error,
    tableItems,
    tableBundles,
    findArticles,
  };
}
