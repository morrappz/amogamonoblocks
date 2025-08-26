"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Step3({
  finalBomData
}: {
  finalBomData: Record<string, string>[] | undefined;
}) {
  
  const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 5,
    });
  
  const pageSizeOptions = [5, 10, 20, 30, 50];
  
  // Create columns based on the data
  const columns = useMemo<ColumnDef<unknown, unknown>[]>(() => {
    if (!finalBomData || finalBomData.length === 0) return [];

    return Object.keys(finalBomData[0]).map((key) => ({
      accessorKey: key,
      header: key
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex]);
  
  const memoizedTableData = useMemo(() => finalBomData, [finalBomData]);

  const table = useReactTable({
    data: memoizedTableData || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { pagination },
  });

  return (
    <div className="space-y-6 w-full">
      <h2 className="text-xl font-bold">Show Final BOM Data</h2>
      
            <Card>
              <CardContent className="p-0 overflow-auto">
                <div className="rounded-md border overflow-x-auto max-h-[300px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              colSpan={header.colSpan}
                              style={{
                                position: "relative",
                                width: header.getSize(),
                                minWidth: header.getSize(),
                              }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                              {header.column.getCanResize() && (
                                <div
                                  onMouseDown={header.getResizeHandler()}
                                  onTouchStart={header.getResizeHandler()}
                                  className={` absolute right-0 top-0 h-full w-1 bg-secondary cursor-col-resize select-none touch-none ${
                                    header.column.getIsResizing()
                                      ? "isResizing"
                                      : ""
                                  }`}
                                ></div>
                              )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell
                                key={cell.id}
                                className="p-1"
                                style={{ width: cell.column.getSize() }}
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            No data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      Rows per page:
                    </span>
                    <select
                      value={pagination.pageSize}
                      onChange={(e) => {
                        setPagination((prev) => ({
                          ...prev,
                          pageSize: Number(e.target.value),
                        }));
                      }}
                      className="h-8 w-20 rounded-md border border-input bg-background px-2"
                    >
                      {pageSizeOptions.map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                          {pageSize}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    {table.getState().pagination.pageIndex *
                      table.getState().pagination.pageSize +
                      1}{" "}
                    to{" "}
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) *
                        table.getState().pagination.pageSize,
                        finalBomData?.length || 0
                    )}{" "}
                    of {finalBomData?.length || 0} entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => {
                        // table.previousPage();
                        setPagination((prev) => ({
                          ...prev,
                          pageIndex: prev.pageIndex - 1,
                        }));
                      }}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm">
                      Page {table.getState().pagination.pageIndex + 1} of{" "}
                      {table.getPageCount()}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => {
                        //   table.nextPage();
                        setPagination((prev) => ({
                          ...prev,
                          pageIndex: prev.pageIndex + 1,
                        }));
                      }}
                      disabled={!table.getCanNextPage()}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
    </div>
  );
}
