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

  // Column filters
  const columnFilters = ref([]);

  // Dropdown visibility state for filters
  const typeFilterOpen = ref(false);
  const tagsFilterOpen = ref(false);

  // Get unique types for filter options
  const getUniqueTypes = (data: Article[]) => {
    const types = new Set<string>();
    data.forEach((article) => {
      if (article.type) {
        types.add(article.type);
      }
    });
    return Array.from(types).sort();
  };

  // Get unique tags for filter options
  const getUniqueTags = (data: Article[]) => {
    const tags = new Set<string>();
    data.forEach((article) => {
      if (article.tags && article.tags.length > 0) {
        article.tags.forEach((tag) => {
          if (tag) {
            tags.add(tag);
          }
        });
      }
    });
    return Array.from(tags).sort();
  };

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

  // Create filter dropdown for Type column
  const createTypeFilter = (
    column: {
      getFilterValue: () => unknown;
      setFilterValue: (value: unknown) => void;
    },
    uniqueTypes: string[],
    isOpen: boolean,
  ) => {
    const currentFilter = column.getFilterValue() as string | undefined;

    return isOpen
      ? h(
          "div",
          {
            class:
              "absolute top-full left-0 z-50 mt-1 min-w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg",
            "data-filter-dropdown": "",
          },
          [
            h(
              "select",
              {
                class:
                  "w-full text-xs border-0 rounded-md px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500",
                value: currentFilter || "",
                onChange: (e: Event) => {
                  const value = (e.target as HTMLSelectElement).value;
                  column.setFilterValue(value === "" ? undefined : value);
                  typeFilterOpen.value = false;
                },
                onBlur: () => {
                  // Close dropdown when clicking outside
                  setTimeout(() => {
                    typeFilterOpen.value = false;
                  }, 100);
                },
              },
              [
                h("option", { value: "" }, "Alle Typen"),
                ...uniqueTypes.map((type) =>
                  h("option", { value: type }, type),
                ),
              ],
            ),
          ],
        )
      : null;
  };

  // Create filter dropdown for Tags column
  const createTagsFilter = (
    column: {
      getFilterValue: () => unknown;
      setFilterValue: (value: unknown) => void;
    },
    uniqueTags: string[],
    isOpen: boolean,
  ) => {
    const currentFilter = column.getFilterValue() as string | undefined;

    return isOpen
      ? h(
          "div",
          {
            class:
              "absolute top-full left-0 z-50 mt-1 min-w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg",
            "data-filter-dropdown": "",
          },
          [
            h(
              "select",
              {
                class:
                  "w-full text-xs border-0 rounded-md px-2 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500",
                value: currentFilter || "",
                onChange: (e: Event) => {
                  const value = (e.target as HTMLSelectElement).value;
                  column.setFilterValue(value === "" ? undefined : value);
                  tagsFilterOpen.value = false;
                },
                onBlur: () => {
                  // Close dropdown when clicking outside
                  setTimeout(() => {
                    tagsFilterOpen.value = false;
                  }, 100);
                },
              },
              [
                h("option", { value: "" }, "Alle Tags"),
                ...uniqueTags.map((tag) => h("option", { value: tag }, tag)),
              ],
            ),
          ],
        )
      : null;
  };

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
      header: ({ column, table }) => {
        const data = table
          .getPreFilteredRowModel()
          .rows.map((row) => row.original);
        const uniqueTypes = getUniqueTypes(data);
        const currentFilter = column.getFilterValue() as string | undefined;
        const hasActiveFilter = currentFilter && currentFilter !== "";

        return h("div", { class: "relative" }, [
          // Clickable header with icon
          h(
            "button",
            {
              class: `flex items-center gap-1 font-medium text-left ${
                hasActiveFilter ? "text-blue-600" : ""
              }`,
              "data-filter-dropdown": "",
              onClick: () => {
                typeFilterOpen.value = !typeFilterOpen.value;
              },
            },
            [
              "Typ",
              h(
                "svg",
                {
                  class: `w-3 h-3 ${hasActiveFilter ? "text-blue-600" : "text-gray-400"}`,
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  xmlns: "http://www.w3.org/2000/svg",
                },
                [
                  h("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    "stroke-width": "2",
                    d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
                  }),
                ],
              ),
            ],
          ),
          // Filter dropdown positioned absolutely
          createTypeFilter(column, uniqueTypes, typeFilterOpen.value),
        ]);
      },
      id: "Typ",
      enableGlobalFilter: false,
      filterFn: "includesString",
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
      header: ({ column, table }) => {
        const data = table
          .getPreFilteredRowModel()
          .rows.map((row) => row.original);
        const uniqueTags = getUniqueTags(data);
        const currentFilter = column.getFilterValue() as string | undefined;
        const hasActiveFilter = currentFilter && currentFilter !== "";

        return h("div", { class: "relative" }, [
          // Clickable header with icon
          h(
            "button",
            {
              class: `flex items-center gap-1 font-medium text-left ${
                hasActiveFilter ? "text-blue-600" : ""
              }`,
              "data-filter-dropdown": "",
              onClick: () => {
                tagsFilterOpen.value = !tagsFilterOpen.value;
              },
            },
            [
              "Tags",
              h(
                "svg",
                {
                  class: `w-3 h-3 ${hasActiveFilter ? "text-blue-600" : "text-gray-400"}`,
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24",
                  xmlns: "http://www.w3.org/2000/svg",
                },
                [
                  h("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    "stroke-width": "2",
                    d: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
                  }),
                ],
              ),
            ],
          ),
          // Filter dropdown positioned absolutely
          createTagsFilter(column, uniqueTags, tagsFilterOpen.value),
        ]);
      },
      cell: ({ row }) => {
        if (row.getIsGrouped()) return "";
        const tags = (row.original.tags || []) as Tag[];
        if (tags.length === 0) return "";

        const badges = tags.map(createTagBadge);
        return h("div", { class: "flex flex-wrap gap-1" }, badges);
      },
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const tags = (row.original.tags || []) as Tag[];
        return tags.includes(filterValue as Tag);
      },
      id: "Tags",
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
    columnFilters,
    typeFilterOpen,
    tagsFilterOpen,
    groupingOptions,
    handleRowClick,
    expanded,
    expandAllRows,
    getUniqueTypes,
    getUniqueTags,
  };
}
