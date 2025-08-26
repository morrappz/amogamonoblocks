"use client";

import {
  ExtendedRowAction,
  type Product,
  ProductStatus,
  productStatuses,
} from "../type";
import type { ColumnDef } from "@tanstack/react-table";
import { Ellipsis } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { quickUpdateRecord } from "../_lib/actions";
import { getStatusIcon } from "../_lib/utils";
import { fallbackImage, formatDate } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface GetColumnsProps {
  setRowAction: React.Dispatch<React.SetStateAction<ExtendedRowAction | null>>;
}

export function getColumns({
  setRowAction,
}: GetColumnsProps): ColumnDef<Product>[] {
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
      accessorKey: "product_small_image_link",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Avatar className="size-8">
              <AvatarImage
                src={row.getValue("product_small_image_link") || fallbackImage}
              />
            </Avatar>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = productStatuses.find(
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
        <DataTableColumnHeader column={column} title="Created Date" />
      ),
      cell: ({ cell }) => (
        <span className="max-w-[31.25rem] truncate font-medium">
          {cell.getValue() ? formatDate(cell.getValue() as Date) : ""}
        </span>
      ),
    },
    {
      accessorKey: "product_start_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Start Date" />
      ),
      cell: ({ cell }) => (
        <span className="max-w-[31.25rem] truncate font-medium">
          {cell.getValue() ? formatDate(cell.getValue() as Date) : ""}
        </span>
      ),
    },
    {
      accessorKey: "product_end_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product End Date" />
      ),
      cell: ({ cell }) => (
        <span className="max-w-[31.25rem] truncate font-medium">
          {cell.getValue() ? formatDate(cell.getValue() as Date) : ""}
        </span>
      ),
    },
    {
      accessorKey: "product_publish_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product Publish Date" />
      ),
      cell: ({ cell }) => (
        <span className="max-w-[31.25rem] truncate font-medium">
          {cell.getValue() ? formatDate(cell.getValue() as Date) : ""}
        </span>
      ),
    },
    {
      accessorKey: "product_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("product_name")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "product_group",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Group" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("product_group")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "product_category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("product_category")}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "product_publish_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Publish Status" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("product_publish_status")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "manage_stock",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Manage Stock" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("manage_stock") ? "Yes" : "No"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "product_short_description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("product_short_description")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "uom",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="UOM" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("uom")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("price")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "hsn_number",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="HSN Number" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.getValue("hsn_number")}
            </span>
          </div>
        );
      },
    },
    // {
    //   accessorKey: "recent_purchase_price",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Last Purchase Price" />
    //   ),
    //   cell: ({ row }) => {
    //     return (
    //       <div className="flex space-x-2">
    //         <span className="max-w-[31.25rem] truncate font-medium">
    //           {row.getValue("recent_purchase_price")}
    //         </span>
    //       </div>
    //     );
    //   },
    // },

    {
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
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "enhancer" })}
              >
                Enhancer
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.product_name || ""}
                    onValueChange={(value) => {
                      startUpdateTransition(() => {
                        toast.promise(
                          quickUpdateRecord({
                            id: row.original.product_id,
                            status: value as ProductStatus,
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
                    {productStatuses.map((status) => (
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
    },
  ];
}
