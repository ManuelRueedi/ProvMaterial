import { h, computed } from "vue";
import { getGroupedRowModel, type GroupingOptions } from "@tanstack/vue-table";
import type { TableColumn, TableRow } from "@nuxt/ui";
import type { Connector, Tag, Article } from "@/composables/articles/types";

// Define types for table API
interface ExpandableRow {
  getCanExpand: () => boolean;
  id: string;
  subRows?: ExpandableRow[];
}

interface GroupedRowModel {
  rows: ExpandableRow[];
}

interface TableApi {
  getGroupedRowModel: () => GroupedRowModel;
}

interface SortableColumn {
  getIsSorted: () => false | "asc" | "desc";
  toggleSorting: (desc?: boolean) => void;
}

export function useArticleTable() {
  // Table configuration
  const tableUi = reactive({
    root: "min-w-full",
    td: "empty:p-0", // helps with the colspaned row added for expand slot
  });

  // Initialize table state with proper SSR support
  const columnVisibility = ref({});
  const columnPinning = ref({
    left: [""],
    right: [""],
  });
  const globalFilter = ref("");
  const sorting = ref([]);
  const expanded = ref({});

  // Function to expand all grouped rows
  const expandAllRows = (tableApi: TableApi) => {
    if (!tableApi) return;

    const groupedRowModel = tableApi.getGroupedRowModel();
    const newExpanded: Record<string, boolean> = {};

    // Expand all grouped rows
    groupedRowModel.rows.forEach((row: ExpandableRow) => {
      if (row.getCanExpand()) {
        newExpanded[row.id] = true;
        // Also expand nested groups
        const expandNestedRows = (parentRow: ExpandableRow) => {
          if (parentRow.subRows) {
            parentRow.subRows.forEach((subRow: ExpandableRow) => {
              if (subRow.getCanExpand()) {
                newExpanded[subRow.id] = true;
                expandNestedRows(subRow);
              }
            });
          }
        };
        expandNestedRows(row);
      }
    });

    expanded.value = newExpanded;
  };

  // Grouping options
  const groupingOptions = ref<GroupingOptions>({
    groupedColumnMode: "remove",
    getGroupedRowModel: getGroupedRowModel(),
  });

  // Create badge component for outputs - use plain HTML badge for now
  const createOutputBadge = (key: string, count: number) =>
    h(
      "span",
      {
        class:
          "inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10",
      },
      `${key}×${count}`,
    );

  // Create badge component for tags - use plain HTML badge for now
  const createTagBadge = (tag: Tag) =>
    h(
      "span",
      {
        class: `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
          tag === "defekt"
            ? "bg-red-50 text-red-700 ring-red-600/10"
            : "bg-gray-50 text-gray-600 ring-gray-500/10"
        }`,
      },
      tag,
    );

  // Helper function to create sortable column headers using plain HTML button
  const createSortableHeader = (column: SortableColumn, label: string) => {
    const isSorted = column.getIsSorted();

    return h(
      "button",
      {
        class: "flex items-center gap-1 text-left font-medium",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      },
      [
        label,
        h(
          "span",
          {
            class: "flex items-center justify-center w-4 h-4",
          },
          [
            h(
              "svg",
              {
                class: "w-3 h-3",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                xmlns: "http://www.w3.org/2000/svg",
              },
              [
                isSorted === "asc"
                  ? h("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M7 11l5-5m0 0l5 5m-5-5v12",
                    })
                  : isSorted === "desc"
                    ? h("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M17 13l-5 5m0 0l-5-5m5 5V6",
                      })
                    : h("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4",
                      }),
              ],
            ),
          ],
        ),
      ],
    );
  };

  // Column definitions
  const columns = computed<TableColumn<Article>[]>(() => [
    {
      id: "title",
      header: "Projekt / Standort",
      enableHiding: false,
    },
    {
      id: "projectName",
      accessorFn: (row) => row.project?.name || "Ohne Project",
      header: "Projekt",
      enableHiding: false,
    },
    {
      id: "locationName",
      accessorFn: (row) => row.location?.name || "Unbekannt",
      header: "Standort",
      enableHiding: false,
    },
    {
      accessorKey: "id",
      header: "Nummer",
      cell: ({ row }) =>
        row.getIsGrouped()
          ? `${row.getValue("id")} Artikel`
          : `${row.getValue("id")}`,
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
      accessorKey: "lengthInMeter",
      header: ({ column }) => createSortableHeader(column, "Länge"),
      id: "Länge",
      enableGlobalFilter: false,
      cell: ({ row }) =>
        row.getIsGrouped() ? "" : `${row.original.lengthInMeter}m`,
    },
    {
      accessorKey: "connector",
      header: ({ column }) => createSortableHeader(column, "Anschluss"),
      id: "Anschluss",
      enableGlobalFilter: false,
      sortingFn: (rowA, rowB, columnId) => {
        // Define the connector ordering based on ConnectorEnum - include all values
        const connectorOrder = [
          "T13",
          "T23",
          "CEE16",
          "CEE32",
          "J40",
          "CEE63",
          "CEE125",
          "Powerlock 500A",
          "Powerlock 800A",
        ] as const;

        const connectorA = rowA.getValue(columnId) as Connector;
        const connectorB = rowB.getValue(columnId) as Connector;

        const indexA = connectorOrder.indexOf(connectorA);
        const indexB = connectorOrder.indexOf(connectorB);

        // Handle unknown connectors by putting them at the end
        const orderA = indexA === -1 ? connectorOrder.length : indexA;
        const orderB = indexB === -1 ? connectorOrder.length : indexB;

        return orderA - orderB;
      },
    },
    {
      accessorKey: "outputs",
      header: "Abgänge",
      cell: ({ row }) => {
        // Check if row is grouped and return empty if so
        if (row.getIsGrouped()) return "";

        // Guard against undefined for grouped/aggregate rows
        const outputs = (row.original.outputs || {}) as Partial<
          Record<Connector, number>
        >;
        const badges = Object.entries(outputs)
          .filter(([, count]) => count !== undefined && count !== 0)
          .map(([key, count]) => createOutputBadge(key, count!));

        return badges.length > 0
          ? h("div", { class: "flex flex-wrap gap-1" }, badges)
          : "";
      },
      id: "Abgänge",
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        if (row.getIsGrouped()) return "";
        const tags = (row.original.tags || []) as Tag[];
        if (tags.length === 0) return "";

        const badges = tags.map(createTagBadge);
        return h("div", { class: "flex flex-wrap gap-1" }, badges);
      },
    },
    {
      accessorFn: (row) => row.storageLocation?.name || "Unbekannt",
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
  ]);

  // Handle row click/expansion
  function handleRowClick(
    row: TableRow<Article>,
    e: Event | undefined,
    table: Ref<{ tableApi?: any } | null>, // eslint-disable-line @typescript-eslint/no-explicit-any
    onShowDetails: (article: Article) => void,
  ) {
    // Find the <td> ancestor of whatever was clicked
    const td = (e?.target as HTMLElement)?.closest("td");
    if (!td) return;

    // Zero-based index of the cell in that row
    const idx = td.cellIndex;

    // Pull out the Column object
    const column = table.value?.tableApi?.getVisibleLeafColumns()?.[idx];
    if (!column) return;

    if (row.getCanExpand()) {
      row.toggleExpanded();
    } else {
      onShowDetails(row.original);
    }
  }

  return {
    tableUi,
    columns,
    columnVisibility,
    columnPinning,
    globalFilter,
    sorting,
    groupingOptions,
    handleRowClick,
    expanded,
    expandAllRows,
  };
}
