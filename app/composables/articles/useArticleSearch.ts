import { ref, computed } from "vue";
import type {
  Config,
  Article,
  ArticleSearchResponse,
} from "@/composables/articles/types";
import { errorMap } from "@/composables/useFriendlyError";

export function useArticleSearch() {
  const toast = useToast();

  // Search state
  const foundArticles = ref<ArticleSearchResponse | null>({
    items: [],
    bundles: [],
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed article data (no transformation needed)
  const articles = computed<Article[]>(() => {
    if (!foundArticles.value) return [];
    return foundArticles.value.items;
  });

  const articleBundles = computed<Article[][]>(() => {
    if (!foundArticles.value || !("bundles" in foundArticles.value)) return [];
    return foundArticles.value.bundles;
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
    articles,
    articleBundles,
    findArticles,
  };
}
