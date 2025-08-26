import React from "react";
import { FinalBom } from "../type";
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
  records: FinalBom[];
  table: Table<FinalBom>;
}

export function CardsView({ records, table }: RecordsCardProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {records.map((record) => {
        const actionCell = table
          .getRowModel()
          .rowsById[record.final_bom_id?.toString() ?? ""].getAllCells()
          .find((cell) => cell.column.id === "actions");
        return (
          <Card key={record?.final_bom_id} className="w-full rounded-md relative">
            <CardHeader>
              <CardTitle>{record?.bom_name}</CardTitle>
              <CardDescription>Status: {record?.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>ID: {record?.final_bom_id}</p>
              <p>Model: {record?.model}</p>
              <p>Variant: {record?.variant}</p>
              <p>
                Created:{" "}
                {record?.created_date && format(record?.created_date, "PPP")}
              </p>
              {record?.updated_date && (
                <p>Updated: {format(record?.updated_date, "PPP")}</p>
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
