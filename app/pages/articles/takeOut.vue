<template>
  <!-- Article Search Form Component -->
  <ArticlesArticleSearchForm @select-article="openDetails" />

  <ClientOnly>
    <USlideover
      :close="{
        color: 'primary',
        variant: 'solid',
        size: 'xl',
      }"
      :side="isDesktop ? 'right' : 'bottom'"
      v-model:open="showDetails"
      :ui="{
        title: 'text-center text-3xl font-bold',
        description: 'text-center text-2xl ',
        header: 'justify-center py-7',
        body: 'flex flex-col gap-5',
      }"
    >
      <template #title>
        {{ selectedArticle?.number }}
      </template>
      <template #description>
        {{ selectedArticle?.type }}
      </template>
      <template #body>
        <ArticleDetails :article="selectedArticle">
          <UButton
            size="xl"
            class="mt-6 mb-4 flex w-full justify-center gap-4"
            @click="showTakeOut = true"
            >Austragen
          </UButton>
        </ArticleDetails>
      </template>
    </USlideover>
  </ClientOnly>

  <!-- Take Out Slideover -->
  <ClientOnly>
    <ArticlesTakeOutSlideover
      v-model:open="showTakeOut"
      :article="selectedArticle"
      @take-out="handleTakeOut"
    />
  </ClientOnly>
</template>

<script lang="ts" setup>
import type { Type, Connector, Tags } from "@/composables/articles/types";

const { isDesktop } = useDevice();

const toast = useToast();

const showTakeOut = ref(false);

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
    console.log(data);
    toast.add({
      title: "Artikel erfolgreich ausgetragen",
      color: "success",
    });
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

interface TableItem {
  number: string;
  length: string; // "12.5 m"
  locationName: string; // warehouse name
  storageLocationId: string; // section code
  type: Type;
  connector: Connector;
  outputs: Record<Connector, number>;
  tags: Tags[];
}

function openDetails(article: TableItem) {
  selectedArticle.value = article;
  showDetails.value = true;
}
</script>
