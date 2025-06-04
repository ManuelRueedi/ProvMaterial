import type { Type, Article } from "@/composables/articles/types";

export const useBringBack = (
  deployedArticles: Ref<Article[]>,
  selectedArticles: Ref<string[]>,
) => {
  const isArticleSelected = (articleId: string): boolean =>
    selectedArticles.value.includes(articleId);

  const toggleArticleSelection = (articleId: string) => {
    const index = selectedArticles.value.indexOf(articleId);
    if (index > -1) {
      selectedArticles.value.splice(index, 1);
    } else {
      selectedArticles.value.push(articleId);
    }
  };

  const selectAll = () => {
    selectedArticles.value = deployedArticles.value.map((a) => a.id);
  };

  const deselectAll = () => {
    selectedArticles.value = [];
  };

  const selectLocationArticles = (locationName: string) => {
    const locationArticles = deployedArticles.value
      .filter((a) => a.location && a.location.name === locationName)
      .map((a) => a.id);

    locationArticles.forEach((id) => {
      if (!selectedArticles.value.includes(id)) {
        selectedArticles.value.push(id);
      }
    });
  };

  const selectTypeArticles = (locationName: string, type: Type) => {
    const typeArticles = deployedArticles.value
      .filter(
        (a) =>
          a.location && a.location.name === locationName && a.type === type,
      )
      .map((a) => a.id);

    typeArticles.forEach((id) => {
      if (!selectedArticles.value.includes(id)) {
        selectedArticles.value.push(id);
      }
    });
  };

  const isLocationFullySelected = (locationName: string): boolean => {
    const locationArticles = deployedArticles.value
      .filter((a) => a.location && a.location.name === locationName)
      .map((a) => a.id);

    return (
      locationArticles.length > 0 &&
      locationArticles.every((id) => selectedArticles.value.includes(id))
    );
  };

  const isTypeFullySelected = (locationName: string, type: Type): boolean => {
    const typeArticles = deployedArticles.value
      .filter(
        (a) =>
          a.location && a.location.name === locationName && a.type === type,
      )
      .map((a) => a.id);

    return (
      typeArticles.length > 0 &&
      typeArticles.every((id) => selectedArticles.value.includes(id))
    );
  };

  const isTypePartiallySelected = (
    locationName: string,
    type: Type,
  ): boolean => {
    const typeArticles = deployedArticles.value
      .filter(
        (a) =>
          a.location && a.location.name === locationName && a.type === type,
      )
      .map((a) => a.id);

    const selectedCount = typeArticles.filter((id) =>
      selectedArticles.value.includes(id),
    ).length;
    return selectedCount > 0 && selectedCount < typeArticles.length;
  };

  const toggleTypeSelection = (locationName: string, type: Type) => {
    if (isTypeFullySelected(locationName, type)) {
      const typeArticles = deployedArticles.value
        .filter(
          (a) =>
            a.location && a.location.name === locationName && a.type === type,
        )
        .map((a) => a.id);

      selectedArticles.value = selectedArticles.value.filter(
        (id) => !typeArticles.includes(id),
      );
    } else {
      selectTypeArticles(locationName, type);
    }
  };

  return {
    isArticleSelected,
    toggleArticleSelection,
    selectAll,
    deselectAll,
    selectLocationArticles,
    selectTypeArticles,
    isLocationFullySelected,
    isTypeFullySelected,
    isTypePartiallySelected,
    toggleTypeSelection,
  };
};
