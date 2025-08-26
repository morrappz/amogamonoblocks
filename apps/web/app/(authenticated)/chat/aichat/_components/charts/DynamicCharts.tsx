/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import RenderPieChart from "./Pie";
import { metrics } from "../ConversationalChat";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface DynamicChartProps {
  data: any[];
  type: string;
  title?: string;
  story?: string;
  metrics?: metrics | null;
}

const DynamicChart: React.FC<DynamicChartProps> = ({
  data,
  type,
  title,
  story,
  metrics,
}) => {
  const chartConfig: ChartConfig = {
    value: {
      label: "Value",
      color: COLORS[0],
    },
  };

  const renderChart = () => {
    switch (type.toLowerCase()) {
      case "bar-chart":
        return (
          <BarChart width={600} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        );

      case "line-chart":
        return (
          <LineChart width={600} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLORS[0]}
              strokeWidth={2}
            />
          </LineChart>
        );

      case "pie-chart":
        return <RenderPieChart data={data} story={story} metrics={metrics} />;

      default:
        return <RenderPieChart story={story} metrics={metrics} data={data} />;
    }
  };

  return (
    <Card className="w-full h-full pb-5 overflow-y-auto">
      <CardContent className="pt-6">
        {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
        <ChartContainer config={chartConfig}>{renderChart()}</ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DynamicChart;
