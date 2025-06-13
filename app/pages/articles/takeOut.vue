<template>
  <h1 class="my-5 text-center text-3xl font-bold">Auslagern</h1>
  <!-- Article Search Form Component -->
  <ArticleSearchForm
    ref="searchFormRef"
    @select-article="openDetails"
    @select-bundle="openBundleDetails"
  />
  <!-- ensure the map is only rendered on the client side -->
  <ClientOnly>
    <!-- Single Article Slideover -->
    <USlideover
      v-model:open="showDetails"
      :side="isDesktop ? 'right' : 'bottom'"
      :close="false"
      :ui="{
        header: 'min-h-0 p-0 border-0',
        content: 'max-w-2xl',
      }"
    >
      <!-- Hidden title for accessibility -->
      <template #title>
        <span class="sr-only">Artikelinfo</span>
      </template>

      <!-- Hidden description for accessibility -->
      <template #description>
        <span class="sr-only"
          >Detailansicht des Artikels mit Austragemöglichkeit</span
        >
      </template>
      <template #body>
        <div class="absolute top-5 right-10 z-10 flex shadow-sm">
          <UButton
            icon="ic:baseline-close"
            variant="soft"
            color="error"
            size="xl"
            @click="showDetails = false"
          />
        </div>
        <ArticleDetails :article="selectedArticle" @take-out="handleTakeOut" />
      </template>
    </USlideover>

    <!-- Bundle Slideover -->
    <USlideover
      v-model:open="showBundleDetails"
      :close="bundleClose"
      :side="isDesktop ? 'right' : 'bottom'"
      :ui="bundleUi"
    >
      <template #title> {{ selectedBundle?.length }} Artikel </template>
      <template #description>
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="article in selectedBundle"
            :key="article.id"
            variant="soft"
            color="primary"
            class="text-xl"
          >
            {{ article.id }}
          </UBadge>
        </div>
      </template>
      <template #body>
        <ArticleBundleDetails
          :articles="selectedBundle || []"
          @take-out="handleBundleTakeOut"
        />
      </template>
    </USlideover>
  </ClientOnly>
</template>

<script lang="ts" setup>
import type { Article } from "@/composables/articles/types";
import { errorMap } from "@/composables/useFriendlyError";

const { isDesktop } = useDevice();

const toast = useToast();

const bundleClose = reactive({
  color: "primary" as const,
  variant: "solid" as const,
  size: "xl" as const,
});

const bundleUi = reactive({
  title: "text-center text-3xl font-bold",
  description: "text-center text-2xl ",
  header: "justify-center py-7",
  body: "flex flex-col gap-5",
  content: "max-w-2xl",
});

// Template ref for the search form component
const searchFormRef = ref<{ refreshSearch: () => void } | null>(null);

async function handleTakeOut(
  articleId: string,
  locationId: number,
  projectId?: number,
) {
  try {
    await $fetch(`/api/articles/${encodeURIComponent(articleId)}/takeOut`, {
      body: {
        newLocationId: locationId,
        newProjectId: projectId,
      },
      method: "PUT",
    });
    toast.add({
      title: "Artikel erfolgreich ausgetragen",
      color: "success",
    });

    // Refresh search results to reflect the change
    searchFormRef.value?.refreshSearch();

    // Close the slideover after successful take out
    showDetails.value = false;
  } catch (error: unknown) {
    console.error("Error taking out article:", error);

    // Extract error message from server response
    const errorMessage = "Der Artikel konnte nicht ausgetragen werden.";

    // Use friendly error mapping if available, otherwise use extracted message
    const friendlyError = errorMap(error);

    toast.add({
      title: friendlyError.title || "Fehler beim Austragen",
      description: friendlyError.description || errorMessage,
      color: friendlyError.color || "error",
      icon: friendlyError.icon,
    });
  }
}

const showDetails = ref(false);
const selectedArticle = ref<Article | null>(null);
const showBundleDetails = ref(false);
const selectedBundle = ref<Article[] | null>(null);

function openDetails(article: Article) {
  selectedArticle.value = article;
  showDetails.value = true;
}

function openBundleDetails(bundle: Article[]) {
  selectedBundle.value = bundle;
  showBundleDetails.value = true;
}

async function handleBundleTakeOut(
  articleIds: string[],
  locationId: number,
  projectId?: number,
) {
  try {
    await $fetch("/api/articles/takeOutMultiple", {
      body: {
        articleIds: articleIds,
        newLocationId: locationId,
        newProjectId: projectId,
      },
      method: "PUT",
    });
    toast.add({
      title: "Artikel erfolgreich ausgetragen",
      description: `${articleIds.length} Artikel wurden erfolgreich ausgetragen`,
      color: "success",
    });

    // Refresh search results to reflect the change
    searchFormRef.value?.refreshSearch();

    // Close the slideover after successful take out
    showBundleDetails.value = false;
  } catch (error: unknown) {
    console.error("Error taking out articles:", error);

    // Extract error message from server response
    const errorMessage = "Die Artikel konnten nicht ausgetragen werden.";

    // Use friendly error mapping if available, otherwise use extracted message
    const friendlyError = errorMap(error);

    toast.add({
      title: friendlyError.title || "Fehler beim Austragen",
      description: friendlyError.description || errorMessage,
      color: friendlyError.color || "error",
      icon: friendlyError.icon,
    });
  }
}
</script>
