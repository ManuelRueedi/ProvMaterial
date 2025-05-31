<script setup lang="ts">
import { h, resolveComponent } from "vue";
import {
  aggregationFns,
  getGroupedRowModel,
  type GroupingOptions,
} from "@tanstack/vue-table";
import { upperFirst } from "scule";
const { isDesktop } = useDevice();
import type { TableColumn, TableRow } from "@nuxt/ui";
import type { Connector, Type, Tags } from "@/composables/articles/types";

const UBadge = resolveComponent("UBadge");
const table = useTemplateRef("table");
const showDetails = ref(false);
const selectedArticle = ref<ArticleView | null>(null);

const columnVisibility = ref({});

// Change to client-side only data fetching
var { data } = await useFetch("/api/articles/getAll", {
  key: "ArticleData",
  lazy: true,
  server: false, // Only fetch on client side to avoid hydration mismatch
  transform: (apiArticles) => {
    if (!apiArticles) {
      return [];
    }
    return apiArticles.map((apiArticle) => {
      // Perform the transformation for each article
      const articleView = {
        ...apiArticle,
        projectName:
          apiArticle.projectName === ""
            ? "Ohne Project"
            : apiArticle.projectName,
        length: `${apiArticle.length}m`, // Transform length to string with unit
      };
      return articleView;
    });
  },
});

// Initialize data to empty array if undefined
if (!data.value) {
  data.value = [];
}

type ArticleView = {
  projectName: string;
  locationName: string;
  number: string;
  length: string; // e.g. "12m"
  storageLocation: string;
  storageLocationSection?: number;
  type: Type;
  connector: Connector;
  outputs: Partial<Record<Connector, number>>;
  tags: Tags[];
};

const columns: TableColumn<ArticleView>[] = [
  {
    id: "title",
    header: "Projekt / Standort",
    enableHiding: false,
  },
  {
    id: "projectName",
    accessorKey: "projectName",
    header: "Projekt",
    enableHiding: false,
  },
  {
    id: "locationName",
    accessorKey: "locationName",
    header: "Standort",
    enableHiding: false,
  },
  {
    accessorKey: "number",
    header: "Nummer",
    cell: ({ row }) =>
      row.getIsGrouped()
        ? `${row.getValue("number")} Artikel`
        : `${row.getValue("number")}`,
    aggregationFn: "count",
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Typ",
    id: "Typ",
    enableGlobalFilter: false,
  },
  {
    accessorKey: "length",
    header: "Länge",
    id: "Länge",
    enableGlobalFilter: false,
  },
  {
    accessorKey: "connector",
    header: "Anschluss",
    id: "Anschluss",
    enableGlobalFilter: false,
  },
  {
    accessorKey: "outputs",
    header: "Abgänge",
    cell: ({ row }) => {
      // Guard against undefined for grouped/aggregate rows
      const outputs = (row.getValue("Abgänge") || {}) as Partial<
        Record<Connector, number>
      >;
      const formatted = Object.entries(outputs)
        .filter(([, count]) => count !== undefined && count !== 0)
        .map(([key, count]) =>
          h(
            UBadge,
            {
              color: "neutral",
            },
            { default: () => `${key}×${count}` },
          ),
        );
      return h("div", { class: "flex flex-wrap gap-1" }, formatted) || "";
    },
    id: "Abgänge",
    enableColumnFilter: false,
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = (row.getValue("tags") || []) as Tags[];
      if (tags.length === 0) return "";
      return h(
        "div",
        { class: "flex flex-wrap gap-1" },
        tags.map((t) =>
          h(
            UBadge,
            {
              color: t === "defekt" ? "error" : "neutral",
            },
            { default: () => t },
          ),
        ),
      );
    },
    enableColumnFilter: false,
  },
  {
    accessorKey: "storageLocation",
    header: "Lagerort",
    id: "Lagerort",
    enableGlobalFilter: false,
  },
  {
    accessorKey: "storageLocationSection",
    header: "Lager Nr.",
    id: "Lager Nr.",
    enableGlobalFilter: false,
    aggregationFn: undefined, // disables aggregation
  },
];

const grouping_options = ref<GroupingOptions>({
  groupedColumnMode: "remove",
  getGroupedRowModel: getGroupedRowModel(),
});

function openDetails(row: TableRow<ArticleView>, e?: Event) {
  // find the <td> ancestor of whatever was clicked
  const td = (e?.target as HTMLElement).closest("td");
  if (!td) return;

  // zero-based index of the cell in that row
  const idx = td.cellIndex;

  // pull out the Column object
  const column = table.value!.tableApi.getVisibleLeafColumns()[idx];
  if (column === undefined) {
    return;
  }
  row.getCanExpand;
  if (row.getCanExpand()) {
    row.toggleExpanded();
  } else {
    selectedArticle.value = row.original;
    showDetails.value = true;
  }
}
const columnPinning = ref({
  left: [""],
  right: [""],
});
const globalFilter = ref("");
</script>

<template>
  <div class="flex h-full w-full flex-1 flex-col">
    <div class="border-accented flex justify-center gap-2 border-b px-4 py-3.5">
      <UInput v-model="globalFilter" class="max-w-sm" placeholder="Filter..." />
      <UDropdownMenu
        :items="
          table?.tableApi
            ?.getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => ({
              label: upperFirst(column.id),
              type: 'checkbox' as const,
              checked: column.getIsVisible(),
              onUpdateChecked(checked: boolean) {
                table?.tableApi
                  ?.getColumn(column.id)
                  ?.toggleVisibility(!!checked);
              },
              onSelect(e?: Event) {
                e?.preventDefault();
              },
            }))
        "
        :content="{ align: 'end' }"
      >
        <UButton
          label="Spalten"
          color="neutral"
          variant="outline"
          trailing-icon="ic:baseline-arrow-downward"
        />
      </UDropdownMenu>
    </div>

    <!-- Wrap table with ClientOnly to prevent server-side rendering -->
    <ClientOnly>
      <UTable
        sticky
        ref="table"
        v-model:column-visibility="columnVisibility"
        @select="openDetails"
        :data="data"
        :columns="columns"
        v-model:global-filter="globalFilter"
        v-model:column-pinning="columnPinning"
        :grouping="['projectName', 'locationName']"
        :grouping-options="grouping_options"
        :ui="{
          root: 'min-w-full',
          td: 'empty:p-0', // helps with the colspaned row added for expand slot
        }"
      >
        <template #title-cell="{ row }">
          <div v-if="row.getIsGrouped()" class="flex items-center">
            <span
              class="inline-block"
              :style="{ width: `calc(${row.depth} * 1rem)` }"
            />

            <UButton
              variant="outline"
              color="neutral"
              class="mr-2"
              size="xs"
              :icon="
                row.getIsExpanded() ? 'ic:baseline-minus' : 'ic:baseline-plus'
              "
              @click="row.toggleExpanded()"
            />
            <strong v-if="row.groupingColumnId === 'projectName'">{{
              row.original.projectName
            }}</strong>
            <strong v-else-if="row.groupingColumnId === 'locationName'">{{
              row.original.locationName
            }}</strong>
          </div>
        </template>
        <template #empty>
          <UCard>Keine Daten</UCard>
        </template>
      </UTable>

      <template #fallback>
        <div class="flex items-center justify-center p-12">
          <UButton loading label="Tabelle wird geladen..." :disabled="true" />
        </div>
      </template>
    </ClientOnly>
  </div>
  <ArticleHistoryDrawer
    v-model:showDetails="showDetails"
    :selectedArticle="selectedArticle"
  />
</template>
