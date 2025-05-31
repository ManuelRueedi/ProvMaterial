<template>
  <div
    class="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-7 pt-5"
  >
    <!-- Typ -->
    <labeledSelection
      icon="ic:baseline-view-in-ar"
      :items="TypeEnum.options"
      v-model="config.type"
    >
      Typ
    </labeledSelection>

    <!-- Strombelastbarkeit -->
    <labeledSelection
      icon="ic:baseline-electric-bolt"
      :items="ampacityOptions"
      v-model="config.ampacity"
    >
      Nennstrom
    </labeledSelection>

    <!-- Anschluss -->
    <labeledSelection
      v-if="connectorOptions.length"
      icon="ic:baseline-power"
      :items="connectorOptions"
      v-model="config.connector"
    >
      Anschluss
    </labeledSelection>
    <!-- Länge -->
    <div
      class="flex w-full max-w-xl flex-col gap-2 px-10 [@media(min-width:400px)]:flex-row"
    >
      <UBadge
        class="min-w-30 flex-1/3 justify-center"
        icon="ic:baseline-settings-ethernet"
        size="md"
        color="neutral"
        variant="solid"
      >
        Länge
      </UBadge>
      <UInputNumber
        class="flex-2/3"
        :step="5"
        :min="0"
        :max="250"
        v-model="config.length"
      ></UInputNumber>
    </div>
    <!-- Tags -->
    <div
      v-if="tagsEnabled"
      class="flex w-full max-w-xl flex-col gap-2 px-10 [@media(min-width:400px)]:flex-row"
    >
      <UBadge
        class="min-w-30 flex-1/3 justify-center"
        icon="ic:baseline-tag"
        size="md"
        color="neutral"
        variant="solid"
      >
        Tags
      </UBadge>
      <USelect
        class="flex-2/3"
        v-model="config.tags"
        multiple
        :items="tagsOptions"
      />
    </div>
    <!-- Abgänge -->
    <div
      v-if="socketsEnabled"
      class="flex w-full max-w-xl flex-col gap-2 px-10"
    >
      <div
        class="flex w-full flex-col gap-2 [@media(min-width:400px)]:flex-row"
      >
        <UBadge
          icon="ic:baseline-outlet"
          class="min-w-30 flex-1/3 justify-center"
          size="md"
          color="neutral"
          variant="solid"
        >
          Abgänge
        </UBadge>
        <USelect
          class="flex-2/3"
          :items="socketsOptions"
          v-model="selectedSocket"
        />
      </div>
      <div class="mb-5 flex w-full gap-2">
        <UButton
          @click="setSelectedSocket"
          class="min-w-30 flex-1/3 justify-center"
          >hinzufügen</UButton
        >
        <UInputNumber
          v-model="selectedSocketNumber"
          class="flex-2/3"
        ></UInputNumber>
      </div>
    </div>
  </div>
  <div
    v-for="(value, key) in config.sockets"
    class="flex w-full max-w-xl gap-2 justify-self-center px-10 pb-2"
  >
    <UButton
      @click="removeSocketFromSelection(key)"
      class="min-w-30 flex-1/3 justify-center"
      color="error"
      icon="ic:baseline-remove"
    />
    <UBadge :key="key" color="neutral" class="flex-2/3 justify-center">
      {{ value }} X {{ key }}
    </UBadge>
  </div>
  <div class="flex w-full justify-center">
    <USeparator class="h-2 w-full max-w-xl p-3" color="neutral" type="solid" />
  </div>
  <UButton
    :color="error ? 'warning' : 'primary'"
    :loading="isLoading"
    class="mx-auto my-5 flex w-full max-w-xl justify-center justify-self-center"
    @click="findArticles(config)"
    >Suchen</UButton
  >
  <div
    class="max-w-8xl mx-auto flex w-full flex-wrap justify-center gap-8 pt-5"
  >
    <UCard v-if="tableItems.length" class="h-fit w-full max-w-xl shadow-sm">
      <UTable
        class="w-full"
        @select="openDetails"
        :loading="isLoading"
        :columns="tableColumns"
        :data="tableItems"
      ></UTable>
    </UCard>
    <div class="flex w-full max-w-xl flex-col gap-4" v-if="tableBundles.length">
      <UCard
        v-for="(bundle, index) in tableBundles"
        :key="index"
        class="flex w-full max-w-xl flex-col shadow-sm"
      >
        <UTable
          @select="openDetails"
          :loading="isLoading"
          :columns="tableColumns"
          :data="bundle"
        ></UTable>

        <template #footer>
          <UButton block @click="" variant="subtle" label="Alle austragen">
          </UButton>
        </template>
      </UCard>
    </div>
  </div>
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
        <USlideover
          :close="{
            color: 'primary',
            variant: 'solid',
            size: 'xl',
          }"
          :side="isDesktop ? 'right' : 'bottom'"
          :ui="{
            title: 'text-center text-3xl font-bold',
            description: 'text-center text-2xl ',
            header: 'justify-center py-7',
            body: 'flex flex-col gap-5',
          }"
        >
          <template #title>
            <h1>Austragen</h1>
          </template>
          <template #description>
            <h2>
              {{ selectedArticle?.number }}
            </h2>
          </template>
          <template #body>
            <div class="flex flex-row justify-center gap-1">
              <USelectMenu
                class="w-4/4"
                size="lg"
                :items="projects"
                labelKey="name"
                :loading="projectsPending"
                v-model="selectedProject"
                placeholder="Projekt"
              >
              </USelectMenu>
              <UButton class="ml-2 justify-center p-2" color="neutral">
                Hinzufügen
              </UButton>
            </div>
            <div v-if="selectedProject">
              {{ selectedProject.description }}
            </div>

            <div class="flex flex-row justify-center gap-1">
              <USelectMenu
                class="w-3/4"
                size="lg"
                :items="locations"
                labelKey="name"
                :loading="locationsPending"
                v-model="selectedLocation"
                placeholder="Standort"
              >
              </USelectMenu>
              <UButton class="ml-2 justify-center p-2" color="neutral">
                Hinzufügen
              </UButton>
            </div>
            <div v-if="selectedLocation">
              {{ selectedLocation.address }}
            </div>
            <UButton
              size="xl"
              :disabled="selectedLocation === undefined"
              @click="TakeOutArticle"
              class="mt-6 flex w-full justify-center"
              >Austragen
            </UButton>
          </template>
          <UButton size="xl" class="mt-6 mb-4 flex w-full justify-center gap-4"
            >Austragen
          </UButton>
        </USlideover>
      </ArticleDetails>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useConfigurator } from "@/composables/articles/useConfigurator";
import { TypeEnum } from "@/composables/articles/types";
import type { TableColumn, TableRow } from "@nuxt/ui";
import type {
  Type,
  Config,
  Connector,
  Tags,
} from "@/composables/articles/types";
import type {
  HandlerResult,
  Article,
} from "~~/server/api/articles/search.post";
import { errorMap } from "@/composables/useFriendlyError";
const { isDesktop } = useDevice();

const toast = useToast();

//---------Austragen---------------

const { data: projects, pending: projectsPending } = await useFetch<
  {
    id: number;
    name: string;
    description: string;
  }[]
>("/api/projects/getAll", { lazy: true });

const { data: locations, pending: locationsPending } = await useFetch<
  {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    isStorageLocation: boolean;
  }[]
>("/api/locations/getAll", { lazy: true });

const selectedProject = ref();
const selectedLocation = ref();

async function TakeOutArticle() {
  const articleId = selectedArticle.value?.number as string;
  const data = await $fetch(
    `/api/articles/${encodeURIComponent(articleId)}/takeOut`,
    {
      body: {
        newLocationId: Number(selectedLocation.value.id),
        newProjectId:
          selectedProject.value !== undefined
            ? selectedProject.value.id
            : undefined,
      },
      method: "PUT",
    },
  );
  console.log(data);
}

const tableColumns: TableColumn<TableItem>[] = [
  {
    accessorKey: "number",
    header: "Nummer",
  },
  {
    accessorKey: "length",
    header: "Länge",
  },
  {
    accessorKey: "locationName",
    header: "Ort",
  },
  {
    accessorKey: "storageLocationId",
    header: "Platz",
  },
];

const showDetails = ref(false);
const selectedArticle = ref<TableItem | null>(null);

function openDetails(row: TableRow<TableItem>, e?: Event) {
  selectedArticle.value = row.original;
  showDetails.value = true;
}

interface TableItem {
  number: string;
  length: string; // “12.5 m”
  locationName: string; // warehouse name
  storageLocationId: string; // section code
  type: Type;
  connector: Connector;
  outputs: Record<Connector, number>;
  tags: Tags[];
}

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

/** ───────────────────────────────────────────────────────────────
 *  Simple list (always present)                                      */
const tableItems = computed<TableItem[]>(() => {
  if (!foundArticls.value) return [];
  return foundArticls.value.items.map(articleToTableItem);
});

/** ───────────────────────────────────────────────────────────────
 *  Bundles – only if the backend returned them                      */
const tableBundles = computed<TableItem[][]>(() => {
  if (!foundArticls.value || !("bundles" in foundArticls.value)) return [];
  return foundArticls.value.bundles.map((bundle) =>
    bundle.map(articleToTableItem),
  );
});

const foundArticls = ref<HandlerResult | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

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

const {
  config,
  ampacityOptions,
  connectorOptions,
  socketsEnabled,
  socketsOptions,
  tagsOptions,
  tagsEnabled,
} = useConfigurator();

const selectedSocket = ref<Connector>("CEE16");
const selectedSocketNumber = ref(1);

const setSelectedSocket = () => {
  if (selectedSocket.value && selectedSocketNumber.value > 0) {
    config.sockets = {
      ...config.sockets,
      [selectedSocket.value]: selectedSocketNumber.value,
    };
  }
};

const removeSocketFromSelection = (
  key: keyof NonNullable<Config["sockets"]>,
) => {
  const { [key]: _, ...rest } = config.sockets;
  config.sockets = rest;
};
</script>
