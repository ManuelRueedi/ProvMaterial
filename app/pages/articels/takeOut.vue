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
  <USeparator class="h-2 w-full max-w-xl p-3" color="neutral" type="solid" />
  <UButton
    :color="error ? 'warning' : 'primary'"
    :loading="isLoading"
    class="mx-auto my-5 flex w-full max-w-xl justify-center justify-self-center"
    @click="findArticles(config)"
    >Suchen</UButton
  >
  <div
    class="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-center gap-7 pt-5"
  >
    <UTable
      class="flex w-full max-w-xl px-5"
      v-if="tableItems.length"
      @select="openDetails"
      :loading="isLoading"
      :columns="tableColumns"
      :data="tableItems"
    ></UTable>
    <UTable
      class="flex w-full max-w-xl px-5"
      v-for="bundle in tableBundles"
      @select="openDetails"
      :loading="isLoading"
      :columns="tableColumns"
      :data="bundle"
    ></UTable>
  </div>
  <USlideover
    :side="isDesktop ? 'right' : 'bottom'"
    v-model:open="showDetails"
    class="flex flex-col items-center px-6 text-center"
  >
    <template #title>Artikel Info</template>
    <template #description
      >Mehr informationen über den ausgewählten artikel.</template
    >
    <template #content>
      <h1 class="mt-8 text-4xl">
        {{ selectedArticle?.number }}
      </h1>
      <h2 class="mb-8 text-2xl">
        {{ selectedArticle?.type }}
      </h2>
      <div class="space-y-6">
        <div
          v-if="selectedArticle?.length !== '0 m'"
          class="flex flex-col items-center"
        >
          <h1 class="mb-2 text-xl">Länge</h1>
          <UBadge class="text-lg" color="neutral">{{
            selectedArticle?.length
          }}</UBadge>
        </div>

        <div
          v-if="selectedArticle?.connector !== null"
          class="flex flex-col items-center"
        >
          <h1 class="mb-2 text-xl">Anschluss</h1>
          <UBadge class="text-lg" color="neutral">{{
            selectedArticle?.connector
          }}</UBadge>
        </div>

        <div
          v-if="
            selectedArticle?.outputs &&
            Object.keys(selectedArticle.outputs).length
          "
          class="flex flex-col items-center"
        >
          <h1 class="mb-2 text-xl">Abgänge</h1>
          <div class="flex flex-wrap justify-center gap-2">
            <UBadge
              class="text-lg"
              v-for="(value, key) in selectedArticle.outputs"
              :key="key"
              color="neutral"
            >
              {{ key }}: {{ value }}
            </UBadge>
          </div>
        </div>

        <div
          v-if="selectedArticle?.tags.length"
          class="flex flex-col items-center"
        >
          <h1 class="mb-2 text-xl">Tags</h1>
          <div class="flex flex-wrap justify-center gap-2">
            <UBadge
              class="text-lg"
              v-for="tag in selectedArticle.tags"
              :key="tag"
              color="neutral"
            >
              {{ tag }}
            </UBadge>
          </div>
        </div>

        <div class="flex flex-col items-center">
          <h1 class="mb-2 text-lg">Standort</h1>
          <UBadge color="neutral" class="text-xl">{{
            selectedArticle?.locationName
          }}</UBadge>
        </div>

        <div class="flex flex-col items-center">
          <h1 class="mb-2 text-xl">Platz Nr.</h1>
          <UBadge class="text-lg" color="neutral">{{
            selectedArticle?.storageLocationId
          }}</UBadge>
        </div>
      </div>
      <div class="mt-6 mb-4 flex w-full justify-center gap-4">
        <UButton class="text-lg">Hinzufügen</UButton>
        <UButton class="text-lg">Austragen</UButton>
      </div>
    </template>
  </USlideover>
</template>

<script lang="ts" setup>
import { useConfigurator } from "@/composables/articels/useConfigurator";
import { TypeEnum } from "@/composables/articels/types";
import type { TableColumn, TableRow } from "@nuxt/ui";
import type {
  Type,
  Config,
  Connector,
  Tags,
} from "@/composables/articels/types";
import type {
  HandlerResult,
  Article,
} from "~~/server/api/articels/search.post";
import { errorMap } from "@/composables/useFriendlyError";
const { isDesktop } = useDevice();

const toast = useToast();

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
  length: `${a.lengthInMeter} m`,
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
    const data = await $fetch<HandlerResult>("/api/articels/search", {
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
