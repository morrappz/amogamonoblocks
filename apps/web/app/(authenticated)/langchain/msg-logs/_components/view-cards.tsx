import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";
import { flexRender, Table } from "@tanstack/react-table";
import { Message } from "../type";

interface RecordsCardProps {
  records: Message[];
  table: Table<Message>;
}

export function CardsView({ records, table }: RecordsCardProps) {
  const getActionCell = React.useCallback(
    (recordId: string) => {
      return table
        .getRowModel()
        .rowsById[recordId]?.getAllCells()
        .find((cell) => cell.column.id === "actions");
    },
    [table]
  );

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {records.map((record) => {
        const actionCell = getActionCell(record.id?.toString() ?? "");
        return (
          <Card key={record?.id} className="w-full rounded-md relative">
            <CardHeader>
              <CardTitle>{record?.role}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                CreatedAt:{" "}
                {record?.createdAt && format(record?.createdAt, "PPP")}
              </p>
              {record?.content && (
                <p className="truncate">Content: {record?.content}</p>
              )}
              <p>Prompt Tokens: {record?.prompt_tokens}</p>
              <p>Completion Tokens: {record?.completion_tokens}</p>
              <p>Total Tokens: {record?.total_tokens}</p>
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
