/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

const RenderTable = ({ data }: { data: { name: string; value: number }[] }) => {
  return (
    <div className="max-w-[700px] overflow-x-auto">
      {data && data.length > 0 ? (
        <Table className="border overflow-x-scroll rounded-md">
          <TableHeader>
            <TableRow>
              {Object.keys(data[0]).map((column, index) => (
                <TableHead key={index} className="capitalize">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item: any, index) => (
              <TableRow key={index}>
                {Object.keys(data[0]).map((key, index) => (
                  <TableCell key={index}>
                    {typeof item[key] === "object"
                      ? JSON.stringify(item[key], null, 2) // Format nested objects
                      : item[key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default RenderTable;
