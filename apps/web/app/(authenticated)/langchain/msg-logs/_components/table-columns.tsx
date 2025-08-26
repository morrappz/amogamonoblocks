"use client";

import { ContactStatus, contactStatuses, Message } from "../type";
import type { DataTableRowAction } from "@/types";
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
import { formatDate } from "@/lib/utils";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Message> | null>
  >;
}

export function getColumns({
  setRowAction,
}: GetColumnsProps): ColumnDef<Message>[] {
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
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        console.log("row-----", row);
        const role = row.original.role;

        if (!role) return null;

        // const Icon = getStatusIcon(role);

        return (
          <div className="flex w-[6.25rem] items-center">
            {/* <Icon
              className="mr-2 size-4 text-muted-foreground"
              aria-hidden="true"
            /> */}
            <span className="capitalize">{role}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ cell }) =>
        cell.getValue() ? formatDate(cell.getValue() as Date) : "",
    },
    {
      accessorKey: "content",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Content" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[10rem] truncate font-medium">
              {row.getValue("content")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "chat_group",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Chat Group" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[20rem] break-words truncate font-medium">
              {row.original.chat_group}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "prompt_tokens",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Prompt Tokens" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.original.prompt_tokens}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "completion_tokens",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Completion Tokens" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[31.25rem] truncate font-medium">
              {row.original.completion_tokens}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "total_tokens",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total Tokens" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <p className="max-w-[31.25rem] truncate font-medium">
              {row.original.total_tokens}
            </p>
          </div>
        );
      },
    },
    // {
    //   id: "actions",
    //   maxSize: 28,
    //   cell: function Cell({ row }) {
    //     const [isUpdatePending, startUpdateTransition] = React.useTransition();

    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button
    //             aria-label="Open menu"
    //             variant="ghost"
    //             className="flex size-8 p-0 data-[state=open]:bg-muted"
    //           >
    //             <Ellipsis className="size-4" aria-hidden="true" />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end" className="w-40">
    //           <DropdownMenuItem
    //             onSelect={() => setRowAction({ row, type: "update" })}
    //           >
    //             Edit
    //           </DropdownMenuItem>
    //           <DropdownMenuSub>
    //             <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
    //             <DropdownMenuSubContent>
    //               <DropdownMenuRadioGroup
    //                 value={row.original.user_name || ""}
    //                 onValueChange={(value) => {
    //                   startUpdateTransition(() => {
    //                     toast.promise(
    //                       quickUpdateRecord({
    //                         id: row.original.user_catalog_id,
    //                         status: value as ContactStatus,
    //                       }).then((data) => {
    //                         if (data.error) throw data.error;
    //                         return { ...data };
    //                       }),
    //                       {
    //                         loading: "Updating...",
    //                         success: "Status updated",
    //                         error: (err) => err,
    //                       }
    //                     );
    //                   });
    //                 }}
    //               >
    //                 {contactStatuses.map((status) => (
    //                   <DropdownMenuRadioItem
    //                     key={status}
    //                     value={status}
    //                     className="capitalize"
    //                     disabled={isUpdatePending}
    //                   >
    //                     {status}
    //                   </DropdownMenuRadioItem>
    //                 ))}
    //               </DropdownMenuRadioGroup>
    //             </DropdownMenuSubContent>
    //           </DropdownMenuSub>
    //           <DropdownMenuSeparator />
    //           <DropdownMenuItem
    //             onSelect={() => setRowAction({ row, type: "delete" })}
    //           >
    //             Delete
    //             <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    //   size: 40,
    // },
  ];
}
