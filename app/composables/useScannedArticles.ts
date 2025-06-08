import type { Article } from "@/composables/articles/types";

// Global state for showing selected articles only
export const useShowSelectedOnly = () =>
  useState("showSelectedOnly", () => false);

export const useScannedArticles = () => {
  // Global state for scanned and selected articles
  const scannedArticles = useState<Article[]>("scannedArticles", () => []);
  const selectedArticles = useState<Article[]>("selectedArticles", () => []);

  // Global state for showing selected articles only
  const showSelectedOnly = useShowSelectedOnly();

  const toast = useToast();

  // Fetch article by ID and add to scanned list
  const fetchAndAddArticle = async (articleId: string) => {
    try {
      // Check if article already exists to prevent duplicates
      if (scannedArticles.value.some((article) => article.id === articleId)) {
        toast.add({
          title: "Artikel bereits gescannt",
          description: `Artikel ${articleId} ist bereits in der Liste`,
          color: "warning",
        });
        return;
      }

      const article = await $fetch<Article>(
        `/api/articles/${encodeURIComponent(articleId)}`,
      );

      // Add to scanned articles
      scannedArticles.value.push(article);

      // Also add to selected articles by default
      if (
        !selectedArticles.value.some((selected) => selected.id === articleId)
      ) {
        selectedArticles.value.push(article);
      }

      // Automatically switch to showing selected articles when QR code is scanned
      showSelectedOnly.value = true;

      toast.add({
        title: "Artikel gefunden",
        description: `${article.type} ${article.id} hinzugefügt`,
        color: "success",
      });
    } catch (error: unknown) {
      console.error("Error fetching article:", error);
      toast.add({
        title: "Artikel nicht gefunden",
        description: `Artikel mit ID "${articleId}" wurde nicht gefunden`,
        color: "error",
      });
    }
  };

  // Toggle article selection
  const toggleArticleSelection = (article: Article) => {
    const index = selectedArticles.value.findIndex(
      (selected) => selected.id === article.id,
    );
    if (index > -1) {
      selectedArticles.value.splice(index, 1);
    } else {
      selectedArticles.value.push(article);
    }

    // Set showSelectedOnly based on whether there are selected articles
    showSelectedOnly.value = selectedArticles.value.length > 0;
  };

  // Remove article from both scanned and selected lists
  const removeArticle = (articleId: string) => {
    scannedArticles.value = scannedArticles.value.filter(
      (article) => article.id !== articleId,
    );
    selectedArticles.value = selectedArticles.value.filter(
      (article) => article.id !== articleId,
    );

    // Set showSelectedOnly based on whether there are selected articles
    showSelectedOnly.value = selectedArticles.value.length > 0;
  };

  // Clear all articles
  const clearAll = () => {
    scannedArticles.value = [];
    selectedArticles.value = [];
    showSelectedOnly.value = false;
  };

  // Select all scanned articles
  const selectAll = () => {
    selectedArticles.value = [...scannedArticles.value];
  };

  // Deselect all articles
  const deselectAll = () => {
    selectedArticles.value = [];
    showSelectedOnly.value = false;
  };

  return {
    scannedArticles: readonly(scannedArticles),
    selectedArticles: readonly(selectedArticles),
    fetchAndAddArticle,
    toggleArticleSelection,
    removeArticle,
    clearAll,
    selectAll,
    deselectAll,
  };
};
