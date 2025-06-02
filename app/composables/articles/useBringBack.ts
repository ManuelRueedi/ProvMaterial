import type { Type } from "@/composables/articles/types";

export const useBringBack = (
  deployedArticles: Ref<any[]>,
  selectedArticles: Ref<string[]>,
) => {
  const isArticleSelected = (articleNumber: string): boolean =>
    selectedArticles.value.includes(articleNumber);

  const toggleArticleSelection = (articleNumber: string) => {
    const index = selectedArticles.value.indexOf(articleNumber);
    if (index > -1) {
      selectedArticles.value.splice(index, 1);
    } else {
      selectedArticles.value.push(articleNumber);
    }
  };

  const selectAll = () => {
    selectedArticles.value = deployedArticles.value.map((a) => a.number);
  };

  const deselectAll = () => {
    selectedArticles.value = [];
  };

  const selectLocationArticles = (locationName: string) => {
    const locationArticles = deployedArticles.value
      .filter((a) => a.locationName === locationName)
      .map((a) => a.number);

    locationArticles.forEach((id) => {
      if (!selectedArticles.value.includes(id)) {
        selectedArticles.value.push(id);
      }
    });
  };

  const selectTypeArticles = (locationName: string, type: Type) => {
    const typeArticles = deployedArticles.value
      .filter((a) => a.locationName === locationName && a.type === type)
      .map((a) => a.number);

    typeArticles.forEach((id) => {
      if (!selectedArticles.value.includes(id)) {
        selectedArticles.value.push(id);
      }
    });
  };

  const isLocationFullySelected = (locationName: string): boolean => {
    const locationArticles = deployedArticles.value
      .filter((a) => a.locationName === locationName)
      .map((a) => a.number);

    return (
      locationArticles.length > 0 &&
      locationArticles.every((id) => selectedArticles.value.includes(id))
    );
  };

  const isTypeFullySelected = (locationName: string, type: Type): boolean => {
    const typeArticles = deployedArticles.value
      .filter((a) => a.locationName === locationName && a.type === type)
      .map((a) => a.number);

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
      .filter((a) => a.locationName === locationName && a.type === type)
      .map((a) => a.number);

    const selectedCount = typeArticles.filter((id) =>
      selectedArticles.value.includes(id),
    ).length;
    return selectedCount > 0 && selectedCount < typeArticles.length;
  };

  const toggleTypeSelection = (locationName: string, type: Type) => {
    if (isTypeFullySelected(locationName, type)) {
      const typeArticles = deployedArticles.value
        .filter((a) => a.locationName === locationName && a.type === type)
        .map((a) => a.number);

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
