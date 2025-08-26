/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";

type DataType = { [key: string]: any };

const ROWS_PER_PAGE_OPTIONS = [5, 10, 12, 20, 50];

const RenderTable = ({
  data,
  columns,
}: {
  data: DataType[];
  columns?: string[];
}) => {
  // Build column definitions for react-table
  const columnDefs: ColumnDef<DataType>[] = React.useMemo(
    () =>
      (columns ?? []).map((col) => ({
        accessorKey: col,
        header: col,
        cell: (info) =>
          typeof info.getValue() === "object"
            ? JSON.stringify(info.getValue(), null, 2)
            : String(info.getValue() ?? ""),
      })),
    []
  );

  // Pagination state
  const [pageIndex, setPageIndex] = React.useState(0);

  const [pageSize, setPageSize] = React.useState(5);
  const pageCount = Math.ceil(data.length / pageSize);

  // Paginated data
  const paginatedData = React.useMemo(
    () => data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    [data, pageIndex, pageSize]
  );

  const table = useReactTable({
    data: paginatedData,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination: { pageIndex, pageSize } },
  });

  React.useEffect(() => {
    setPageIndex(0);
  }, [pageSize, data]);

  if (!data || columns?.length === 0) {
    toast.error("No Data avaliable");
    return;
  }

  return (
    <div className="w-full   space-y-4 ">
      {data && data.length > 0 ? (
        <>
          <div className="flex items-center md:justify-between mt-2 gap-2 sm:gap-4 flex-wrap">
            <div className="flex p-1 sm:p-2.5 items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
                aria-label="First page"
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
                disabled={pageIndex === 0}
                aria-label="Previous page"
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPageIndex((p) => Math.min(p + 1, pageCount - 1))
                }
                disabled={pageIndex >= pageCount - 1}
                aria-label="Next page"
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(pageCount - 1)}
                disabled={pageIndex >= pageCount - 1}
                aria-label="Last page"
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Rows per page</span>
              <span className="sm:hidden">Rows</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-16 sm:w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROWS_PER_PAGE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs sm:text-sm">
              {pageIndex + 1} / {pageCount}
            </span>
          </div>
          <div className="w-full max-w-[350px] md:max-w-full  border rounded-lg">
            <Table className="">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        className="capitalize text-xs sm:text-sm whitespace-nowrap"
                        key={header.id}
                      >
                        {flexRender(
                          typeof header.column.columnDef.header === "string"
                            ? header.column.columnDef.header.replace(/_/g, " ")
                            : header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-xs sm:text-sm whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <p className="text-sm sm:text-base">No data available</p>
      )}
    </div>
  );
};

export default RenderTable;
