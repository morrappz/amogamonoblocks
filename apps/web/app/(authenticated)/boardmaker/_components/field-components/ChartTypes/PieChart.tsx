/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface PieChartProps {
  data: Record<string, any>[];
  dataKey: string;
}

const StyledPieChart: React.FC<PieChartProps> = ({ data, dataKey }) => {
  const chartData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      const value = item[dataKey];
      if (value !== null && value !== undefined) {
        counts[String(value)] = (counts[String(value)] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      fill: COLORS[index % COLORS.length],
    }));
  }, [data, dataKey]);

  const totalCount = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const chartConfig = Object.fromEntries(
    chartData.map((item, index) => [
      item.name,
      {
        label: item.name,
        color: COLORS[index % COLORS.length],
      },
    ])
  );

  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle>Data Distribution</CardTitle>
        <CardDescription>Distribution by {dataKey}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-fit"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalCount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {chartData.length} distinct values found
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Distribution analysis for {dataKey}
        </div>
      </CardFooter>
    </Card>
  );
};

export default StyledPieChart;
