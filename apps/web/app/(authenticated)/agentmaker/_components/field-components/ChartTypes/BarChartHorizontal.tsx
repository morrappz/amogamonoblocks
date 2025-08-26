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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface HorizontalBarChartProps {
  data: Record<string, any>[];
  dataKey: string;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  dataKey,
}) => {
  const chartData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      const value = item[dataKey];
      if (value !== null && value !== undefined) {
        counts[String(value)] = (counts[String(value)] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({
        category: name,
        value,
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [data, dataKey]);

  const chartConfig = {
    value: {
      label: "Count",
      color: "hsl(var(--chart-1))",
    },
  };

  const totalCount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle>Horizontal Distribution Analysis</CardTitle>
        <CardDescription>Distribution by {dataKey}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <BarChart
            data={chartData}
            layout="vertical"
            accessibilityLayer
            margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
          >
            <CartesianGrid
              horizontal={true}
              strokeDasharray="3 3"
              opacity={0.3}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              width={100}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="value"
              fill="hsl(var(--chart-1))"
              radius={[0, 4, 4, 0]}
              barSize={20}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Top value: {chartData[0]?.category} ({chartData[0]?.value}{" "}
          occurrences)
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Total count: {totalCount.toLocaleString()} items across{" "}
          {chartData.length} categories
        </div>
      </CardFooter>
    </Card>
  );
};

export default HorizontalBarChart;
