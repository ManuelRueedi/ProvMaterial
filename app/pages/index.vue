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

const columnVisibility = ref({});

var { data } = await useFetch<ArticleView[]>("/api/articles/getAll", {
  key: "ArticleData",
  lazy: true,
  transform: (apiArticles): ArticleView[] => {
    if (!apiArticles) {
      return [];
    }
    return apiArticles.map((apiArticle) => {
      // Perform the transformation for each article
      const articleView: ArticleView = {
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

type HistoryView = {
  id?: string | number; // Eindeutige ID für jeden Eintrag ist gut für Vue's :key
  locationName: string;
  locationAddress: string;
  projectName: string;
  projectDescription: string;
  from: number; // Jahr oder Timestamp
  to: number; // Jahr oder Timestamp, 0 für aktuell
};

const historyData = ref<HistoryView[]>([
  {
    locationName: "Bühne Mitte Stars in Town",
    locationAddress: "Herrenacker",
    projectName: "Stars in Town",
    projectDescription: "Grosser Anlass mit vielen Sängern in Schaffhausen.",
    from: 1746117960,
    to: 1747759560,
  },
  {
    locationName: "Backstage Nord",
    locationAddress: "Gerberstrasse 5",
    projectName: "Openair Frauenfeld",
    projectDescription: "Grösstes Hip-Hop Festival Europas.",
    from: 1743000000,
    to: 1744200000,
  },
  {
    locationName: "Zelt Technik",
    locationAddress: "Reitplatzstrasse",
    projectName: "Jazz Festival",
    projectDescription: "Kleines aber feines Jazzfestival im Grünen.",
    from: 1738000000,
    to: 1738600000,
  },
  {
    locationName: "Energiezentrale",
    locationAddress: "Industriestrasse 12",
    projectName: "Street Parade Setup",
    projectDescription:
      "Stromversorgung für mobile Bühnen an der Street Parade.",
    from: 1750000000,
    to: 0,
  },
  {
    locationName: "Container Süd",
    locationAddress: "Güterbahnhof 1",
    projectName: "Firmenfeier Novartis",
    projectDescription: "Grossveranstaltung für Mitarbeitende.",
    from: 1741000000,
    to: 1741800000,
  },
  {
    locationName: "Lager Ost",
    locationAddress: "Weidlingstrasse 22",
    projectName: "Schulprojekt Energietage",
    projectDescription: "Stromversorgung für mobile Experimentierstationen.",
    from: 1739000000,
    to: 1739200000,
  },
]);

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

const showDetails = ref(false);
const selectedArticle = ref<ArticleView | null>(null);

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
  </div>
  <USlideover
    :side="isDesktop ? 'right' : 'bottom'"
    :close="{
      color: 'primary',
      variant: 'solid',
      size: 'xl',
    }"
    v-model:open="showDetails"
    :ui="{
      title: 'text-center text-3xl font-bold',
      description: 'text-center text-2xl ',
      header: 'justify-center py-7',
    }"
  >
    <!-- Header mit Titel und Close-Icon -->
    <template #title>
      <h1>
        {{ selectedArticle?.number }}
      </h1>
    </template>

    <!-- Beschreibung unter dem Titel -->
    <template #description>
      <h2>
        {{ selectedArticle?.type }}
      </h2>
    </template>

    <!-- Scrollbarer Haupt-Content -->
    <template #body>
      <div class="flex-1 overflow-y-auto">
        <!-- Details -->
        <div class="space-y-6 px-4">
          <!-- Länge -->
          <div
            v-if="selectedArticle?.length !== '0m'"
            class="flex flex-col items-center"
          >
            <h3
              class="mb-2 text-xl font-medium text-gray-800 dark:text-gray-200"
            >
              Länge
            </h3>
            <UBadge class="text-lg" color="neutral">
              {{ selectedArticle?.length }}
            </UBadge>
          </div>

          <!-- Anschluss -->
          <div
            v-if="selectedArticle?.connector"
            class="flex flex-col items-center"
          >
            <h3
              class="mb-2 text-xl font-medium text-gray-800 dark:text-gray-200"
            >
              Anschluss
            </h3>
            <UBadge class="text-lg" color="neutral">
              {{ selectedArticle.connector }}
            </UBadge>
          </div>

          <!-- Abgänge -->
          <div
            v-if="
              selectedArticle?.outputs &&
              Object.keys(selectedArticle.outputs).length
            "
            class="flex flex-col items-center"
          >
            <h3
              class="mb-2 text-xl font-medium text-gray-800 dark:text-gray-200"
            >
              Abgänge
            </h3>
            <div class="flex flex-wrap justify-center gap-2">
              <UBadge
                class="text-lg"
                v-for="(value, key) in selectedArticle.outputs"
                :key="key"
                color="neutral"
              >
                {{ value }}x {{ key }}
              </UBadge>
            </div>
          </div>

          <!-- Tags -->
          <div
            v-if="selectedArticle?.tags.length"
            class="flex flex-col items-center"
          >
            <h3
              class="mb-2 text-xl font-medium text-gray-800 dark:text-gray-200"
            >
              Tags
            </h3>
            <div class="flex flex-wrap justify-center gap-2">
              <UBadge
                class="text-lg"
                v-for="tag in selectedArticle.tags"
                :key="tag"
                :color="tag === 'defekt' ? 'error' : 'neutral'"
              >
                {{ tag }}
              </UBadge>
            </div>
          </div>

          <!-- Lagerort -->
          <div
            v-if="selectedArticle?.storageLocation"
            class="flex flex-col items-center"
          >
            <h3
              class="mb-2 text-xl font-medium text-gray-800 dark:text-gray-200"
            >
              Lagerort
            </h3>
            <div class="flex flex-wrap gap-1">
              <UBadge class="text-lg" color="neutral">
                {{ selectedArticle.storageLocation }}
              </UBadge>
              <UBadge
                v-if="selectedArticle.storageLocationSection"
                class="text-lg"
                color="neutral"
              >
                Nr.{{ selectedArticle.storageLocationSection }}
              </UBadge>
            </div>
          </div>

          <!-- Verlauf -->
          <div class="mt-12">
            <HistoryTimeline :history="historyData" />
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
