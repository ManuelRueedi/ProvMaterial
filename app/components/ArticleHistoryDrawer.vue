<script setup lang="ts">
import type { HistoryView } from "~~/server/api/articles/[articleId]/history.get";
import type { Article } from "@/composables/articles/types";

/* external state — provide these from the parent */
const props = defineProps<{
  showDetails: boolean;
  selectedArticle: Article | null;
}>();

const emit = defineEmits<{
  (e: "update:showDetails", value: boolean): void;
  (e: "articleDeleted" | "articleEdited", articleId: string): void;
}>();

const { isDesktop } = useDevice();

/* --- 1. lazy fetch ------------------------------------------------------- */
const {
  data: historyData,
  pending,
  error,
  refresh,
} = useLazyAsyncData<HistoryView[]>(
  "article-history",
  () => {
    const articleId = props.selectedArticle?.id;
    if (!articleId) throw new Error("No article ID available");
    return $fetch<HistoryView[]>(
      `/api/articles/${encodeURIComponent(articleId)}/history`,
    );
  },
  { immediate: false },
);

// Transform API data format to HistoryTimeline format
const transformedHistory = computed(() => {
  if (!historyData.value) return [];

  return historyData.value.map((item) => ({
    locationName: item.locationName,
    locationAddress: item.locationAddress,
    projectName: item.projectName || "Kein Projekt",
    projectDescription: item.projectDescription || "",
    // Convert milliseconds to seconds
    from: Math.floor(item.from / 1000),
    // Convert null to 0 for current entries
    to: item.to ? Math.floor(item.to / 1000) : 0,
    id: item.from.toString(),
    takeOutUser: item.takeOutUser,
    bringBackUser: item.bringBackUser,
  }));
});

/* --- 2. run every time the drawer opens ---------------------------------- */
watch(
  () => props.showDetails,
  (open) => {
    if (open && props.selectedArticle) refresh();
  },
);

/* --- 3. also refetch if another article is selected while the drawer stays open */
watch(
  () => props.selectedArticle?.id,
  () => {
    if (props.showDetails && props.selectedArticle) refresh();
  },
);

/* --- 4. Action handlers -------------------------------------------------- */
const toast = useToast();
const deleteLoading = ref(false);

const handleDelete = async () => {
  if (!props.selectedArticle) return;

  // Show confirmation dialog
  const confirmed = confirm(
    `Sind Sie sicher, dass Sie den Artikel "${props.selectedArticle.id}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`,
  );

  if (!confirmed) return;

  deleteLoading.value = true;
  try {
    await $fetch(
      `/api/articles/${encodeURIComponent(props.selectedArticle.id)}/delete`,
      {
        method: "DELETE",
      },
    );

    // Emit event to parent to handle cleanup (like refreshing article list)
    emit("articleDeleted", props.selectedArticle.id);

    // Close the drawer
    emit("update:showDetails", false);
  } catch (error: unknown) {
    console.error("Error deleting article:", error);

    // Extract error message from server response
    const errorMessage =
      error &&
      typeof error === "object" &&
      "data" in error &&
      error.data &&
      typeof error.data === "object" &&
      "statusMessage" in error.data
        ? String(error.data.statusMessage)
        : "Der Artikel konnte nicht gelöscht werden.";

    toast.add({
      title: "Fehler beim Löschen",
      description: errorMessage,
      color: "error",
      icon: "i-heroicons-exclamation-triangle",
    });
  } finally {
    deleteLoading.value = false;
  }
};

const handleEdit = () => {
  if (!props.selectedArticle) return;

  // Emit the articleEdited event to trigger the edit slideover
  emit("articleEdited", props.selectedArticle.id);
};
</script>

<template>
  <USlideover
    :side="isDesktop ? 'right' : 'bottom'"
    :open="props.showDetails"
    :close="false"
    :ui="{
      header: 'min-h-0 p-0 border-0',
    }"
    @update:open="emit('update:showDetails', $event)"
  >
    <template #header> </template>
    <!-- Hidden title for accessibility -->
    <template #title>
      <span class="sr-only hidden">Artikelinfo</span>
    </template>

    <!-- Hidden description for accessibility -->
    <template #description>
      <span class="sr-only hidden"
        >Zeigt Artikeldetails und Verlaufsinformationen an</span
      >
    </template>

    <!-- Scrollbarer Haupt-Content -->
    <template #body>
      <!-- Close Button -->
      <div class="absolute top-5 right-10 z-10 flex shadow-sm">
        <UButton
          icon="ic:baseline-close"
          variant="soft"
          color="error"
          size="xl"
          @click="emit('update:showDetails', false)"
        />
      </div>

      <ArticleInfoDisplay
        v-if="props.selectedArticle"
        :article="props.selectedArticle"
      />
      <USeparator label="Verlauf" />

      <!-- Verlauf -->
      <div class="my-12">
        <div v-if="pending" class="flex justify-center">
          <UButton loading label="Lade Verlauf..." :disabled="true" />
        </div>

        <UAlert
          v-else-if="error"
          color="error"
          :title="error.statusMessage ?? 'Fehler'"
        />

        <HistoryTimeline v-else :history="transformedHistory" />
      </div>

      <!-- Floating Action Buttons -->
      <div
        v-if="props.selectedArticle"
        class="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 transform gap-4"
      >
        <UButton
          variant="solid"
          color="primary"
          size="lg"
          icon="ic:baseline-edit"
          @click="handleEdit"
        >
          Bearbeiten
        </UButton>
        <UButton
          variant="solid"
          color="error"
          size="lg"
          icon="ic:baseline-delete"
          :loading="deleteLoading"
          @click="handleDelete"
        >
          Löschen
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
