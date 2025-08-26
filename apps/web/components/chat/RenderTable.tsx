"use client";
import React from "react";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "../ui/table";
import { Button } from "../ui/button";
import {
  ChevronsLeft,
  ChevronsRight,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { generateCsv } from "@/utils/generateCsv";
import { Badge } from "../ui/badge";

interface TableProps {
  headers: string[];
  rows: string[][];
}

const RenderTable = ({
  table,
  title,
}: {
  table: TableProps;
  title: string;
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(1);
  const rowsPerPage = 10;

  const totalRows = table?.rows || [];
  const totalPages = Math.ceil(totalRows.length / rowsPerPage);
  const paginatedRows = totalRows.slice(
    (currentIndex - 1) * rowsPerPage,
    currentIndex * rowsPerPage
  );
  return (
    <div>
      <Table className="w-full text-sm text-left border border-muted rounded-lg overflow-hidden shadow-sm">
        <TableHeader className="bg-muted text-gray-700 uppercase tracking-wide text-xs">
          <TableRow>
            {table?.headers?.map((header, i) => (
              <TableHead
                key={i}
                className="px-4 py-3 font-medium border-b border-gray-200"
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedRows?.map((row, rowIndex) => (
            <TableRow
              key={rowIndex}
              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              {row.map((cell, cellIndex) => (
                <TableCell
                  key={cellIndex}
                  className="px-4 py-2 whitespace-nowrap"
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="border-t-2 flex justify-between  p-2.5 w-full">
        <div>
          <span className="flex">Total: {totalRows?.length}</span>
        </div>
        <div>
          <span>
            Page {currentIndex} of {totalPages}
          </span>
        </div>
        <div className="gap-2.5 flex">
          <Button
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 1))}
            disabled={currentIndex === 1}
            size={"icon"}
            variant={"outline"}
          >
            <ChevronsLeft className="w-5 h-5" />
          </Button>

          <Button
            onClick={() =>
              setCurrentIndex((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentIndex === totalPages}
            size={"icon"}
            variant={"outline"}
          >
            <ChevronsRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
      {/* <div className="border flex justify-between rounded-md p-2.5">
        <div className="flex items-center gap-5">
          <div className="bg-muted w-fit p-2.5 rounded-lg">
            <FileSpreadsheet className="text-green-500 h-5 w-5" />
          </div>
          <p className="font-semibold">{title}</p>
          <Badge className="bg-green-300">CSV</Badge>
        </div>
        <div>
          <Button onClick={() => generateCsv({ table })} size={"icon"}>
            <Download className="w-5 h-5 " />
          </Button>
        </div>
      </div> */}
    </div>
  );
};

export default RenderTable;
