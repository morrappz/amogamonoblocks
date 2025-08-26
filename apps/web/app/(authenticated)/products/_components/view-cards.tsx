import React from "react";
import { Product } from "../type";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { format } from "date-fns";
import { flexRender, Table } from "@tanstack/react-table";
import { fallbackImage } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

interface RecordsCardProps {
  records: Product[];
  table: Table<Product>;
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
        const actionCell = getActionCell(record.product_id?.toString() ?? "");

        return (
          <Card
            key={record?.product_id}
            className="w-full rounded-md relative"
          >
            <CardHeader className="flex items-start space-x-4">
              <div>
                <CardTitle>
                  {record?.product_title}
                </CardTitle>
                <CardDescription>Status: {record?.status}</CardDescription>
              </div>
            </CardHeader>

            {/* Product image positioned at the top-right */}
            <div className="absolute top-1 right-4 p-2">
              <Avatar className="size-16 border-2 border-gray-300">
                <AvatarImage
                  src={record?.product_small_image_link || fallbackImage}
                />
              </Avatar>
            </div>

            <CardContent>
              <p>ID: {record?.product_id}</p>
              <p>
                Created:{" "}
                {record?.created_date &&
                  format(record?.created_date, "PPP")}
              </p>
              <p>Product Number: {record?.product_number}</p>
            </CardContent>

            <div className="absolute right-0 bottom-0 p-4">
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
