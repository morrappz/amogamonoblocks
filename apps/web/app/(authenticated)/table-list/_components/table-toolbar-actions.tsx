"use client";

import type { Table } from "@tanstack/react-table";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { exportTableToCSV } from "@/lib/export";

import { DeleteRecordsDialog } from "./delete-dialog";
import type { Contact } from "../type";

interface RecordsTableToolbarActionsProps {
  table: Table<Contact>;
  onDelete: (ids: number[]) => void;
}

export function RecordsTableToolbarActions({
  table,
  onDelete,
}: RecordsTableToolbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteRecordsDialog
          records={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onDelete={onDelete}
        />
      ) : null}
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "contact",
            excludeColumns: ["select", "actions"],
          })
        }
        className="gap-2"
      >
        <Download className="size-4" aria-hidden="true" />
        <span className="hidden sm:block">Export</span>
      </Button>
      {/**
       * Other actions can be added here.
       * For example, import, view, etc.
       */}
    </div>
  );
}
