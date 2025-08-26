"use client";

import { type FinalBomItem, finalBomItemStatuses } from "../type";
import type { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Checkbox } from "@/components/ui/checkbox";
import { getStatusIcon } from "../_lib/utils";
import { formatDate } from "@/lib/utils";

export function getColumns(): ColumnDef<FinalBomItem>[] {
  return [
    {
      id: "select",
      maxSize: 28,
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = finalBomItemStatuses.find(
          (status) => status === row.original.status
        );

        if (!status) return null;

        const Icon = getStatusIcon(status);

        return (
          <div className="flex w-[6.25rem] items-center">
            <Icon
              className="mr-2 size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="capitalize">{status}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "created_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ cell }) =>
        <span className="max-w-[31.25rem] truncate font-medium">
          {cell.getValue() ? formatDate(cell.getValue() as Date) : ""}
        </span>
    },
    {
      accessorKey: "bom_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="BOM Type" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("bom_type")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "bom_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="BOM Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("bom_name")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "bom_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="BOM Code" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("bom_code")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "model",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Model" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("model")}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "variant",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Variant" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("variant")}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "frame",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Frame" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("frame")}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "engine",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Engine" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("engine")}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "mission",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mission" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("mission")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_l",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="l" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_l")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_part_no",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="part_no" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_part_no")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_part_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="part_name" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_part_name")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_c",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="c" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_c")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_d",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="d" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_d")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_sec",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="sec" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_sec")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_item",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="item" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_item")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_sgr",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="sgr" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_sgr")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "c_share",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="share" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_share")}
            </span>
          </div>
        );
      },
    },
  {
      accessorKey: "c_p_mp_code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="p_mp_code" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_p_mp_code")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_l1_part_no",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="l1_part_no" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_l1_part_no")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_b",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="b" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_b")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_sfx",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="sfx" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_sfx")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_line_no",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="line_no" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_line_no")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_e_f",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="e_f" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_e_f")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_inproc",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="inproc" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_inproc")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_gr",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="gr" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_gr")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_parent_part_no",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="parent_part_no" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_parent_part_no")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_p_mp_part",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="p_mp_part" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_p_mp_part")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_qty_l1",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="qty_l1" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_qty_l1")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_parent_seq",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="parent_seq" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_parent_seq")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_seq",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="seq" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_seq")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_mp",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="mp" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_mp")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_sgrseq",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="sgrseq" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_sgrseq")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_op",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="op" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_op")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_env",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="env" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_env")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_sn",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="sn" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_sn")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_hns",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="hns" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_hns")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_hg_target_weight",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="hg_target_weight" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_hg_target_weight")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_basic_part_no",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="basic_part_no" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_basic_part_no")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_appl_dc_no",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="appl_dc_no" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_appl_dc_no")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_dwg_issue_dc_no",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="dwg_issue_dc_no" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_dwg_issue_dc_no")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_femd",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="femd" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_femd")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_sw",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="sw" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_sw")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_begin",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="begin" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_begin")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_end",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="end" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_end")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "c_loc1_a",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="loc1_a" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_loc1_a")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_loc2_a",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="loc2_a" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_loc2_a")}
            </span>
          </div>
        );
      },
    },
    
    {
      accessorKey: "c_loc3_a",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="loc3_a" /> 
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("c_loc3_a")}
            </span>
          </div>
        );
      },
    },
    /*{
      id: "actions",
      cell: function Cell({ row }) {
        const [isUpdatePending, startUpdateTransition] = React.useTransition();

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open menu"
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "update" })}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.bom_name || ""}
                    onValueChange={(value) => {
                      startUpdateTransition(() => {
                        toast.promise(
                          quickUpdateRecord({
                            id: row.original.final_bom_item_id,
                            status: value as FinalBomItemStatus,
                          }).then((data) => {
                            if (data.error) throw data.error;
                            return { ...data };
                          }),
                          {
                            loading: "Updating...",
                            success: "Status updated",
                            error: (err) => err,
                          }
                        );
                      });
                    }}
                  >
                    {finalBomItemStatuses.map((status) => (
                      <DropdownMenuRadioItem
                        key={status}
                        value={status}
                        className="capitalize"
                        disabled={isUpdatePending}
                      >
                        {status}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "delete" })}
              >
                Delete
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },*/
  ];
}
