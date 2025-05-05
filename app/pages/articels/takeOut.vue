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
  <USeparator class="h-2 w-full p-3" color="neutral" type="solid" />
  <UButton
    :color="error ? 'error' : 'primary'"
    :loading="isLoading"
    class="mx-auto my-5 flex w-full max-w-xl justify-center justify-self-center"
    @click="findArticles(config)"
    >Suchen</UButton
  >
  <UTable
    v-if="tableItems.length"
    @select="onSelect"
    :loading="isLoading"
    :columns="tableColumns"
    :data="tableItems"
    v-model:row-selection="rowSelection"
  ></UTable>
  <div v-for="bundle in tableBundles" class="flex flex-col">
    <UTable
      :loading="isLoading"
      :columns="tableColumns"
      :data="bundle"
    ></UTable>
    <UButton class="justify-center justify-self-center"
      >Alle Hinzufügen</UButton
    >
  </div>
</template>

<script lang="ts" setup>
import { useConfigurator } from "@/composables/articels/useConfigurator";
import { TypeEnum } from "@/composables/articels/types";
import type { TableColumn, TableRow } from "@nuxt/ui";
import type { Type, Config, Connector } from "@/composables/articels/types";
import type {
  HandlerResult,
  ArticleWithOutputs,
  ArticleBundle,
} from "~~/server/api/articels/search.post"; // adjust import

const toast = useToast();

const rowSelection = ref<Record<string, boolean>>({});

function onSelect(row: TableRow<foundArticel>, e?: Event) {
  /* If you decide to also select the column you can do this  */
  row.toggleSelected(!row.getIsSelected());

  console.log(rowSelection);
}

type foundArticel = {
  Nummer: string;
  Länge: string;
  Ort: string;
  Platz: ArticleWithOutputs["storageLocationSection"];
};

const tableColumns: TableColumn<foundArticel>[] = [
  {
    accessorKey: "Nummer",
    header: "Nummer",
  },
  {
    accessorKey: "Länge",
    header: "Länge",
  },
  {
    accessorKey: "Ort",
    header: "Ort",
  },
  {
    accessorKey: "Platz",
    header: "Platz",
  },
];

// normalize to an array of ArticleWithOutputs
const itemsArray = computed<ArticleWithOutputs[]>(() => {
  if (!articlesResult.value) return [];
  return Array.isArray(articlesResult.value)
    ? articlesResult.value
    : articlesResult.value.items;
});

// map to the first table’s shape
const tableItems = computed<foundArticel[]>(() =>
  itemsArray.value.map((item) => ({
    Nummer: item.id,
    Länge: item.lengthInMeter + " m",
    Ort: (item.storageLocation as any).name,
    Platz: item.storageLocationSection,
  })),
);

// map the bundles (if any)
const tableBundles = computed<foundArticel[][]>(() => {
  if (
    !articlesResult.value ||
    Array.isArray(articlesResult.value) ||
    !("bundles" in articlesResult.value)
  )
    return [];

  return articlesResult.value.bundles.map((bundle) =>
    bundle.map((item) => ({
      Nummer: item.id,
      Länge: item.lengthInMeter + " m",
      Ort: (item.storageLocation as any).name,
      Platz: item.storageLocationSection,
    })),
  );
});

const articlesResult = ref<HandlerResult | null>(null);
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

    articlesResult.value = data;
  } catch (err: any) {
    toast.add({
      title: "Error!",
      description: err.message,
      icon: "ic:baseline-close",
      color: "error",
    });
    error.value = err.message || "Unknown error";
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
