"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "../../ui/card";
import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableHeader,
  TableCell,
} from "../../ui/table";

import { Button } from "../../ui/button";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import RenderTable from "./RenderTable";
import { ChartRenderer } from "./ChartRender";

type RawChartData = {
  type: string;
  xAxis: string;
  yAxis: string;
  data: {
    type: string;
    labels: string[];
    data: { label: string; value: number }[];
  };
};

type ChartRendererData = {
  type: string;
  title: string;
  labels: string[];
  data: number[];
};

// export function transformToChartRendererFormat(
//   rawChart: RawChartData
// ): ChartRendererData {
//   return {
//     type: rawChart.data.type,
//     title: `${rawChart.yAxis} by ${rawChart.xAxis}`,
//     labels: rawChart.data.data.map((d) => d.label),
//     data: rawChart.data.data.map((d) => d.value),
//   };
// }

const AnalyticCardFileApi = ({
  analyticCardWithFileApi,
}: {
  analyticCardWithFileApi: any;
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(1);
  const rowsPerPage = 10;

  const totalRows = analyticCardWithFileApi?.table?.data?.rows || [];
  const totalPages = Math.ceil(totalRows.length / rowsPerPage);
  const paginatedRows = totalRows.slice(
    (currentIndex - 1) * rowsPerPage,
    currentIndex * rowsPerPage
  );
  return (
    <div className="w-full mt-2.5">
      <Card className="p-2.5  space-y-2.5">
        <CardTitle>{analyticCardWithFileApi?.table?.title}</CardTitle>
        <CardDescription>
          {analyticCardWithFileApi?.table?.description}
        </CardDescription>
        <CardContent className="w-full  p-0">
          <div className=" w-full ">
            <Tabs defaultValue="table" className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="chart">Chart</TabsTrigger>
              </TabsList>
              <TabsContent value="table">
                {/* <Table className="w-full text-sm text-left border border-muted rounded-lg overflow-hidden shadow-sm">
                  <TableHeader className="bg-muted text-gray-700 uppercase tracking-wide text-xs">
                    <TableRow>
                      {analyticCard?.tabs?.table.headers?.map((header, i) => (
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
                    {paginatedRows?.map((row, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        {row.map((cell, colIndex) => (
                          <TableCell
                            key={colIndex}
                            className="px-4 py-2 whitespace-nowrap"
                          >
                            {cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table> */}
                <RenderTable table={analyticCardWithFileApi?.table} />
                {/* <div className="border-t-2 flex justify-between  p-2.5 w-full">
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
                      onClick={() =>
                        setCurrentIndex((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentIndex === 1}
                      size={"icon"}
                      variant={"outline"}
                    >
                      <ChevronsLeft className="w-5 h-5" />
                    </Button>

                    <Button
                      onClick={() =>
                        setCurrentIndex((prev) =>
                          Math.min(prev + 1, totalPages)
                        )
                      }
                      disabled={currentIndex === totalPages}
                      size={"icon"}
                      variant={"outline"}
                    >
                      <ChevronsRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div> */}
              </TabsContent>
              <TabsContent value="chart">
                <ChartRenderer chart={analyticCardWithFileApi?.chart} />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <p className="font-semibold">
            {analyticCardWithFileApi?.story?.title}
          </p>
          <p className="text-muted-foreground">
            {analyticCardWithFileApi?.story?.description}
          </p>
          {analyticCardWithFileApi?.story?.data?.map((item, index) => (
            <span key={index}>{item}</span>
          ))}
        </CardFooter>
      </Card>
    </div>
  );
};

export default AnalyticCardFileApi;
