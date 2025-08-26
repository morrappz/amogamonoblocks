"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Card, CardContent, CardDescription, CardTitle } from "../../ui/card";

import RenderTable from "./RenderTable";
import { ChartRenderer } from "./ChartRender";

type RawChartData = {
  type: string;
  xAxis: string;
  yAxis: string;
  data: { label: string; value: number }[];
};

type ChartRendererData = {
  type: string;
  title: string;
  labels: string[];
  data: number[];
};

export function transformToChartRendererFormat(
  rawChart: RawChartData
): ChartRendererData {
  return {
    type: rawChart.type,
    title: `${rawChart.yAxis} by ${rawChart.xAxis}`,
    labels: rawChart.data.map((d) => d.label),
    data: rawChart.data.map((d) => d.value),
  };
}

const AnalyticCard = ({
  data,
  tableColumns,
}: {
  data: any[];
  tableColumns: string[] | undefined;
}) => {
  return (
    <div className="w-full mt-2.5">
      <Card className="p-2.5  space-y-2.5">
        <CardContent className="w-full  p-0">
          <div className=" w-full ">
            <Tabs defaultValue="table" className="w-full">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="chart">Chart</TabsTrigger>
              </TabsList>
              <TabsContent value="table">
                <RenderTable data={data} tableColumns={tableColumns} />
              </TabsContent>
              <TabsContent value="chart">
                <ChartRenderer data={data} />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticCard;
