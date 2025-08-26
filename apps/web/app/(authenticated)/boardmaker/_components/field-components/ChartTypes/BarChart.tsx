/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

interface BarChartProps {
  data: Record<string, any>[];
  dataKey: string;
  layout?: "vertical" | "horizontal";
}

const StyledBarChart: React.FC<BarChartProps> = ({
  data,
  dataKey,
  layout = "horizontal",
}) => {
  const processData = React.useCallback(
    (inputData: Record<string, any>[]) => {
      if (!inputData?.length || !dataKey) return [];

      // Initialize processing variables
      const valueMap = new Map<string, number>();
      const maxItems = 10;

      // Process each data item
      inputData.forEach((item) => {
        if (!item) return;

        const value = item[dataKey];
        if (value === undefined || value === null) {
          const key = "Not Available";
          valueMap.set(key, (valueMap.get(key) || 0) + 1);
          return;
        }

        const stringValue = String(value).trim();
        if (stringValue === "") {
          const key = "Empty";
          valueMap.set(key, (valueMap.get(key) || 0) + 1);
          return;
        }

        valueMap.set(stringValue, (valueMap.get(stringValue) || 0) + 1);
      });

      // Convert to array and sort by frequency
      const sortedData = Array.from(valueMap.entries())
        .map(([category, value]) => ({ category, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, maxItems);

      return sortedData;
    },
    [dataKey]
  );

  const chartData = React.useMemo(() => {
    return processData(data);
  }, [data, processData]);

  const chartConfig = {
    value: {
      label: "Count",
      color: "hsl(var(--chart-1))",
    },
  };

  const totalCount = data?.length || 0;
  const uniqueValues = chartData.length;

  if (!chartData.length) {
    return (
      <Card className="w-full max-w-4xl">
        <CardContent className="h-[400px] flex items-center justify-center text-muted-foreground">
          No data available for visualization
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle>Distribution Analysis</CardTitle>
        <CardDescription>
          Analyzing {dataKey} ({uniqueValues} unique values)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <BarChart
            data={chartData}
            layout={layout}
            margin={{
              top: 20,
              right: layout === "vertical" ? 120 : 30,
              left: layout === "vertical" ? 40 : 60,
              bottom: layout === "vertical" ? 20 : 80,
            }}
          >
            <CartesianGrid
              horizontal={layout === "horizontal"}
              vertical={layout === "vertical"}
              strokeDasharray="3 3"
              opacity={0.3}
            />
            {layout === "vertical" ? (
              <>
                <XAxis
                  type="number"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  width={100}
                  tick={({ x, y, payload }) => (
                    <text
                      x={x}
                      y={y}
                      dx={-10}
                      textAnchor="end"
                      fill="currentColor"
                      fontSize={12}
                    >
                      {String(payload.value).length > 20
                        ? `${String(payload.value).substring(0, 20)}...`
                        : payload.value}
                    </text>
                  )}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={({ x, y, payload }) => (
                    <text
                      x={x}
                      y={y}
                      dy={20}
                      textAnchor="end"
                      fill="currentColor"
                      fontSize={12}
                      transform={`rotate(-45, ${x}, ${y})`}
                    >
                      {String(payload.value).length > 20
                        ? `${String(payload.value).substring(0, 20)}...`
                        : payload.value}
                    </text>
                  )}
                />
                <YAxis
                  type="number"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
              </>
            )}
            <ChartTooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg bg-white p-2 shadow-md border">
                    <div className="font-medium">
                      {payload[0].payload.category}
                    </div>
                    <div>Count: {payload[0].value}</div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="value"
              fill="hsl(var(--chart-1))"
              radius={layout === "horizontal" ? [4, 4, 0, 0] : [0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Showing top {uniqueValues} most frequent values
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Total records: {totalCount.toLocaleString()} items
        </div>
      </CardFooter>
    </Card>
  );
};

export default StyledBarChart;
