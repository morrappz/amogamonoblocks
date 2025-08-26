import React from "react";
import { MyDoc } from "../type";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";
import { flexRender, Table } from "@tanstack/react-table";

interface RecordsCardProps {
  records: MyDoc[];
  table: Table<MyDoc>;
}

export function CardsView({ records, table }: RecordsCardProps) {
  
  const getActionCell = React.useCallback((recordId: string) => {
    return table
      .getRowModel()
      .rowsById[recordId]?.getAllCells()
      .find((cell) => cell.column.id === "actions");
  }, [table]);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {records.map((record) => {
        const actionCell = getActionCell(record.mydoc_id?.toString() ?? "");
        return (
          <Card key={record?.mydoc_id} className="w-full rounded-md relative">
            <CardHeader>
              <CardTitle>{record?.doc_name || "Untitled Document"}</CardTitle>
              <CardDescription>Status: {record?.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>ID: {record?.mydoc_id}</p>
              <p>
                Created:{" "}
                {record?.created_date && format(record?.created_date, "PPP")}
              </p>
              {record?.updated_date && (
                <p>Updated: {format(record?.updated_date, "PPP")}</p>
              )}
              {record?.shareurl && (
                <p>
                  Share URL: <a href={record?.shareurl}>view</a>
                </p>
              )}
            </CardContent>
            <div className="absolute right-0 bottom-0">
              {actionCell
                ? flexRender(
                    actionCell.column.columnDef.cell,
                    actionCell.getContext()
                  )
                : null}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
