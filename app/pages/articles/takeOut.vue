<template>
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
      :side="isDesktop ? 'right' : 'bottom'"
      v-model:open="showDetails"
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
      <template #content>
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
      :close="{
        color: 'primary',
        variant: 'solid',
        size: 'xl',
      }"
      :side="isDesktop ? 'right' : 'bottom'"
      v-model:open="showBundleDetails"
      :ui="{
        title: 'text-center text-3xl font-bold',
        description: 'text-center text-2xl ',
        header: 'justify-center py-7',
        body: 'flex flex-col gap-5',
      }"
    >
      <template #title> {{ selectedBundle?.length }} Artikel </template>
      <template #description>
        {{ selectedBundle?.map((article) => article.number).join(", ") }}
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
import type { TableItem } from "@/composables/articles/types";

const { isDesktop } = useDevice();

const toast = useToast();

// Template ref for the search form component
const searchFormRef = ref<{ refreshSearch: () => void } | null>(null);

async function handleTakeOut(
  articleId: string,
  locationId: number,
  projectId?: number,
) {
  try {
    const data = await $fetch(
      `/api/articles/${encodeURIComponent(articleId)}/takeOut`,
      {
        body: {
          newLocationId: locationId,
          newProjectId: projectId,
        },
        method: "PUT",
      },
    );
    toast.add({
      title: "Artikel erfolgreich ausgetragen",
      color: "success",
    });

    // Refresh search results to reflect the change
    searchFormRef.value?.refreshSearch();

    // Close the slideover after successful take out
    showDetails.value = false;
  } catch (error) {
    toast.add({
      title: "Fehler beim Austragen",
      description: "Der Artikel konnte nicht ausgetragen werden.",
      color: "error",
    });
  }
}

const showDetails = ref(false);
const selectedArticle = ref<TableItem | null>(null);
const showBundleDetails = ref(false);
const selectedBundle = ref<TableItem[] | null>(null);

function openDetails(article: TableItem) {
  selectedArticle.value = article;
  showDetails.value = true;
}

function openBundleDetails(bundle: TableItem[]) {
  selectedBundle.value = bundle;
  showBundleDetails.value = true;
}

async function handleBundleTakeOut(
  articleIds: string[],
  locationId: number,
  projectId?: number,
) {
  try {
    const data = await $fetch("/api/articles/takeOutMultiple", {
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
  } catch (error) {
    toast.add({
      title: "Fehler beim Austragen",
      description: "Die Artikel konnten nicht ausgetragen werden.",
      color: "error",
    });
  }
}
</script>
