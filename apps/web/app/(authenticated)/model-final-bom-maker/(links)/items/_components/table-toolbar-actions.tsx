"use client";

import type { FinalBomItem } from "../type";
import type { Table } from "@tanstack/react-table";
import { Download, Loader2, SendToBackIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

import { DeleteRecordsDialog } from "./delete-dialog";
import { useState } from "react";
import { exportTableToCSV } from "@/lib/export";

interface RecordsTableToolbarActionsProps {
  table: Table<FinalBomItem>;
}

export function RecordsTableToolbarActions({
  table,
}: RecordsTableToolbarActionsProps) {

  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  
  const searchParams = useSearchParams();
  
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const finalBomId = searchParams.get("final_bom_id");

      const response = await fetch(`/api/final-bom-data/export?id=${finalBomId}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "FinalBOMItemsFull.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);  
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteRecordsDialog
          records={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/model-final-bom-maker")}
        className="gap-2"
      >
        <SendToBackIcon className="size-4" aria-hidden="true" />
        <span className="hidden sm:block">Back to BOM</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          exportTableToCSV(table, {
            filename: "FinalBOMItems",
            excludeColumns: ["select", "actions"],
          })
        }
        className="gap-2"
      >
        <Download className="size-4" aria-hidden="true" />
        <span className="hidden sm:block">Export</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="gap-2"
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="size-4" aria-hidden="true" />
        )}
        <span className="hidden sm:block">
          {isExporting ? "Exporting..." : "Export All"}
        </span>
      </Button>
      {/**
       * Other actions can be added here.
       * For example, import, view, etc.
       */}
    </div>
  );
}
