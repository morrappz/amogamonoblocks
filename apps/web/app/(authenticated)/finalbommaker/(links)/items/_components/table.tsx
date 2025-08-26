"use client";

import { type FinalBomItem, finalBomItemStatuses } from "../type";
import type {
  DataTableAdvancedFilterField,
  DataTableFilterField,
  DataTableRowAction,
} from "@/types";
import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { toSentenceCase } from "@/lib/utils";

import type { getDocumentCountByField, getRecords } from "../_lib/queries";
import { getStatusIcon } from "../_lib/utils";
import { DeleteRecordsDialog } from "./delete-dialog";
import { useFeatureFlags } from "./feature-flags-provider";
import { getColumns } from "./table-columns";
import { RecordsTableFloatingBar } from "./table-floating-bar";
import { RecordsTableToolbarActions } from "./table-toolbar-actions";
import { UpdateRecordSheet } from "./update-sheet";
import { Table } from "@tanstack/react-table";
import { CardsView } from "./view-cards";
import { SearchInput } from "@/components/data-table/search-input";

interface FinalBomItemTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getRecords>>,
      Awaited<ReturnType<typeof getDocumentCountByField>>
    ]
  >;
  searchParams: { [key: string]: string | string[] | undefined };
}

interface ViewOption {
  value: string;
  label: string;
  component: React.ComponentType<{
    records: FinalBomItem[];
    table: Table<FinalBomItem>;
  }> | null;
}

export function FinalBomItemTable({ promises, searchParams }: FinalBomItemTableProps) {
  const { featureFlags } = useFeatureFlags();

  const [{ data, pageCount }, statusCounts] = React.use(promises);
  
  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<FinalBomItem> | null>(null);

  const columns = React.useMemo(() => getColumns(), []);
  
  /**
   * This component can render either a faceted filter or a search filter based on the `options` prop.
   *
   * @prop options - An array of objects, each representing a filter option. If provided, a faceted filter is rendered. If not, a search filter is rendered.
   *
   * Each `option` object has the following properties:
   * @prop {string} label - The label for the filter option.
   * @prop {string} value - The value for the filter option.
   * @prop {React.ReactNode} [icon] - An optional icon to display next to the label.
   * @prop {boolean} [withCount] - An optional boolean to display the count of the filter option.
   */
  const filterFields: DataTableFilterField<FinalBomItem>[] = [
    {
      id: "status",
      label: "Status",
      options: finalBomItemStatuses.map((status) => ({
        label: toSentenceCase(status),
        value: status,
        icon: getStatusIcon(status),
        count: statusCounts[status] || 0, // Ensure undefined values are handled
      })),
    },
  ];

  /**
   * Advanced filter fields for the data table.
   * These fields provide more complex filtering options compared to the regular filterFields.
   *
   * Key differences from regular filterFields:
   * 1. More field types: Includes 'text', 'multi-select', 'date', and 'boolean'.
   * 2. Enhanced flexibility: Allows for more precise and varied filtering options.
   * 3. Used with DataTableAdvancedToolbar: Enables a more sophisticated filtering UI.
   * 4. Date and boolean types: Adds support for filtering by date ranges and boolean values.
   */
  const advancedFilterFields: DataTableAdvancedFilterField<FinalBomItem>[] = [
    {
      id: "bom_type",
      label: "BOM Type",
      type: "text",
    },
    {
      id: "bom_name",
      label: "BOM Name",
      type: "text",
    },
    {
      id: "bom_code",
      label: "BOM Code",
      type: "text",
    },
    {
      id: "model",
      label: "Model",
      type: "text",
    },
    {
      id: "variant",
      label: "Variant",
      type: "text",
    },
    {
      id: "frame",
      label: "Frame",
      type: "text",
    },
    {
      id: "engine",
      label: "Engine",
      type: "text",
    },
    {
      id: "mission",
      label: "Mission",
      type: "text",
    },
    {
      id: "c_l",
      label: "c_l",
      type: "text",
    },
    {
      id: "c_part_no",
      label: "c_part_no",
      type: "text",
    },
    {
      id: "c_part_name",
      label: "c_part_name",
      type: "text",
    },
    {
      id: "c_c",
      label: "c_c",
      type: "text",
    },
    {
      id: "c_d",
      label: "c_d",
      type: "text",
    },
    {
      id: "c_sec",
      label: "c_sec",
      type: "text",
    },
    {
      id: "c_item",
      label: "c_item",
      type: "text",
    },
    {
      id: "c_sgr",
      label: "c_sgr",
      type: "text",
    },
    {
      id: "c_share",
      label: "c_share",
      type: "text",
    },
    {
      id: "c_p_mp_code",
      label: "c_p_mp_code",
      type: "text",
    },
    {
      id: "c_l1_part_no",
      label: "c_l1_part_no",
      type: "text",
    },
    {
      id: "c_b",
      label: "c_b",
      type: "text",
    },
    {
      id: "c_sfx",
      label: "c_sfx",
      type: "text",
    },
    {
      id: "c_line_no",
      label: "c_line_no",
      type: "text",
    },
    {
      id: "c_e_f",
      label: "c_e_f",
      type: "text",
    },
    {
      id: "c_inproc",
      label: "c_inproc",
      type: "text",
    },
    {
      id: "c_gr",
      label: "c_gr",
      type: "text",
    },
    {
      id: "c_parent_part_no",
      label: "c_parent_part_no",
      type: "text",
    },
    {
      id: "c_p_mp_part",
      label: "c_p_mp_part",
      type: "text",
    },
    {
      id: "c_qty_l1",
      label: "c_qty_l1",
      type: "text",
    },
    {
      id: "c_parent_seq",
      label: "c_parent_seq",
      type: "text",
    },
    {
      id: "c_seq",
      label: "c_seq",
      type: "text",
    },
    {
      id: "c_mp",
      label: "c_mp",
      type: "text",
    },
    {
      id: "c_sgrseq",
      label: "c_sgrseq",
      type: "text",
    },
    {
      id: "c_op",
      label: "c_op",
      type: "text",
    },
    {
      id: "c_env",
      label: "c_env",
      type: "text",
    },
    {
      id: "c_sn",
      label: "c_sn",
      type: "text",
    },
    {
      id: "c_hns",
      label: "c_hns",
      type: "text",
    },
    {
      id: "c_hg_target_weight",
      label: "c_hg_target_weight",
      type: "text",
    },
    {
      id: "c_basic_part_no",
      label: "c_basic_part_no",
      type: "text",
    },
    {
      id: "c_appl_dc_no",
      label: "c_appl_dc_no",
      type: "text",
    },
    {
      id: "c_dwg_issue_dc_no",
      label: "c_dwg_issue_dc_no",
      type: "text",
    },
    {
      id: "c_femd",
      label: "c_femd",
      type: "text",
    },
    {
      id: "c_sw",
      label: "c_sw",
      type: "text",
    },
    {
      id: "c_begin",
      label: "c_begin",
      type: "text",
    },
    {
      id: "c_end",
      label: "c_end",
      type: "text",
    },
    {
      id: "c_loc1_a",
      label: "c_loc1_a",
      type: "text",
    },
    {
      id: "c_loc2_a",
      label: "c_loc2_a",
      type: "text",
    },
    {
      id: "c_loc3_a",
      label: "c_loc3_a",
      type: "text",
    },
    {
      id: "status",
      label: "Status",
      type: "multi-select",
      options: finalBomItemStatuses.map((status) => ({
        label: toSentenceCase(status),
        value: status,
        icon: getStatusIcon(status),
        count: statusCounts[status] || 0, // Ensure undefined values are handled
      })),
    }
  ];

  const enableAdvancedTable = featureFlags.includes("advancedTable");
  const enableFloatingBar = featureFlags.includes("floatingBar");

  /** Define here what display names you need in the columns dropdown */
  const columnDisplayNames: Record<string, string> = {
  };

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: enableAdvancedTable,
    initialState: {
      sorting: [{ id: "created_date", desc: true }],
      columnPinning: { right: ["actions"] },
      columnVisibility: {
        status: false, // Hide the status column by default
      },
    },
    
    getRowId: (originalRow) => originalRow.final_bom_item_id?.toString(),
    shallow: false,
    clearOnDefault: true,
  });

  const isMobile = useIsMobile();
  const [view] = React.useState<string>(() => {
    return isMobile ? "card" : "table";
  });

  const viewOptions: ViewOption[] = React.useMemo(
    () => [
      { value: "table", label: "Table View", component: null },
      { value: "card", label: "Card View", component: CardsView },
    ],
    []
  );

  const selectedViewOption = React.useMemo(() => {
    return (
      viewOptions.find((option) => option.value === view) || viewOptions[0]
    );
  }, [view, viewOptions]);

  return (
    <>
      <DataTable
        table={table}
        floatingBar={
          enableFloatingBar ? <RecordsTableFloatingBar table={table} /> : null
        }
        viewComponent={
          selectedViewOption?.component !== null ? (
            <selectedViewOption.component records={data} table={table} />
          ) : null
        }
      >
        {enableAdvancedTable ? (
          <DataTableAdvancedToolbar
            table={table}
            shallow={false}
            filterFields={advancedFilterFields}
            showColumnVisibilitySelect={selectedViewOption?.value === "table"}
            columnDisplayNames={columnDisplayNames}
            /*endContent={
              <>
                <DataTableViewOptions
                  views={viewOptions}
                  view={view}
                  setView={setView}
                />
                <Button
                  size="sm"
                  onClick={() =>
                    setRowAction({ row: {} as Row<FinalBomItem>, type: "new" })
                  }
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:block">Add</span>
                </Button>
              </>
            }*/
          >
            <RecordsTableToolbarActions table={table} />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar
            table={table}
            showColumnVisibilitySelect={selectedViewOption?.value === "table"}
            startContent={<SearchInput shallow={false} />}
            columnDisplayNames={columnDisplayNames}
            /*endContent={
              <>
                <DataTableViewOptions
                  views={viewOptions}
                  view={view}
                  setView={setView}
                />
                <Button
                  size="sm"
                  onClick={() =>
                    setRowAction({ row: {} as Row<FinalBomItem>, type: "new" })
                  }
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:block">Add</span>
                </Button>
              </>
            }*/
          >
            <RecordsTableToolbarActions table={table} />
          </DataTableToolbar>
        )}
      </DataTable>

      <UpdateRecordSheet
        // key={JSON.stringify(rowAction?.row.original || {})}
        open={rowAction?.type === "update" || rowAction?.type === "new"}
        isNew={rowAction?.type === "new"}
        onOpenChange={() => setRowAction(null)}
        record={rowAction?.row.original ?? null}
        searchParams={searchParams}
      />
      <DeleteRecordsDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        records={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  );
}
