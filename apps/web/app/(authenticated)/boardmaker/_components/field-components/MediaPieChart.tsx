/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Label, Pie, PieChart, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Color palette for months using Tailwind HSL variables
const CHART_COLORS = [
  "hsl(var(--chart-1))", // Blue
  "hsl(var(--chart-2))", // Green
  "hsl(var(--chart-3))", // Red
  "hsl(var(--chart-4))", // Purple
  "hsl(var(--chart-5))", // Orange
  "hsl(var(--chart-1))", // Teal
  "hsl(var(--chart-2))", // Pink
  "hsl(var(--chart-3))", // Yellow
];

export default function MediaPieChart({ field }: any) {
  const { card_json } = field?.media_card_data || {};

  // Calculate total revenue
  const totalRevenue =
    card_json?.reduce((sum: number, item: any) => sum + item.revenue, 0) || 0;

  // Generate chartConfig dynamically
  const chartConfig = card_json?.reduce(
    (config: ChartConfig, item: any, index: number) => {
      config[item.month] = {
        label: item.month,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
      return config;
    },
    {}
  ) as ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Monthly Revenue</CardTitle>
        <CardDescription>${totalRevenue.toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={card_json}
              dataKey="revenue"
              nameKey="month"
              innerRadius={60}
              strokeWidth={5}
            >
              {card_json.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
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
                          {totalRevenue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Revenue
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
    </Card>
  );
}
