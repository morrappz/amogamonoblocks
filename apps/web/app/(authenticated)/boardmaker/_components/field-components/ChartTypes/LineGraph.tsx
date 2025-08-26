/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

interface LineChartProps {
  data: Record<string, any>[];
  dataKey: string;
  displayMode?: "raw" | "count" | "cumulative";
}

const LineGraph: React.FC<LineChartProps> = ({
  data,
  dataKey,
  displayMode = "raw",
}) => {
  const chartData = React.useMemo(() => {
    if (!data || !data.length) return [];

    switch (displayMode) {
      case "count": {
        // Count occurrences over time
        const counts: Record<string, number> = {};
        return data.map((item, index) => {
          const value = item[dataKey];
          const key = value === null ? "Not Provided" : String(value);
          counts[key] = (counts[key] || 0) + 1;
          return {
            index: `Point ${index + 1}`,
            value: counts[key],
            originalValue: key,
          };
        });
      }
      case "cumulative": {
        // Cumulative sum over time
        let sum = 0;
        return data.map((item, index) => {
          const value = item[dataKey];
          if (typeof value === "number") {
            sum += value;
          }
          return {
            index: `Point ${index + 1}`,
            value: sum,
            originalValue: value,
          };
        });
      }
      default: {
        // Raw values with proper handling of non-numeric data
        return data.map((item, index) => {
          const value = item[dataKey];
          let processedValue = 0;

          if (typeof value === "number") {
            processedValue = value;
          } else if (typeof value === "string") {
            // For strings, use their length as a numeric value
            processedValue = value.length;
          }

          return {
            index: `Point ${index + 1}`,
            value: processedValue,
            originalValue: value,
          };
        });
      }
    }
  }, [data, dataKey, displayMode]);

  const chartConfig = {
    value: {
      label: dataKey,
      color: "hsl(var(--chart-1))",
    },
  };

  const getGrowthRate = () => {
    if (chartData.length < 2) return 0;
    const firstValue = chartData[0].value;
    const lastValue = chartData[chartData.length - 1].value;
    return firstValue !== 0
      ? (((lastValue - firstValue) / firstValue) * 100).toFixed(1)
      : 0;
  };

  // Custom tooltip to show both processed and original values
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-2">
          <p className="text-sm font-medium">{payload[0].payload.index}</p>
          <p className="text-sm">Value: {payload[0].value}</p>
          <p className="text-sm text-muted-foreground">
            Original: {payload[0].payload.originalValue}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle>Trend Analysis</CardTitle>
        <CardDescription>
          {dataKey} Over Time ({displayMode} view)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 40,
              bottom: 20,
            }}
            accessibilityLayer
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              opacity={0.3}
            />
            <XAxis
              dataKey="index"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <ChartTooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{
                stroke: "hsl(var(--chart-1))",
                strokeWidth: 2,
                r: 4,
                fill: "white",
              }}
              activeDot={{
                stroke: "hsl(var(--chart-1))",
                strokeWidth: 2,
                r: 6,
                fill: "white",
              }}
              connectNulls
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {Number(getGrowthRate()) >= 0 ? "Increased" : "Decreased"} by{" "}
          {Math.abs(Number(getGrowthRate()))}% overall
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Analyzing {chartData.length} data points
        </div>
      </CardFooter>
    </Card>
  );
};

export default LineGraph;
