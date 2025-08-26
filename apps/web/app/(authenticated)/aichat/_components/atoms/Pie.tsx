import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, Label } from "recharts";

interface RenderProps {
  data: {
    name: unknown;
    value: unknown;
  }[];
  colors: string[];
  chartTheme: string;
}

const RenderPieChart: React.FC<RenderProps> = ({
  data,
  colors,
  chartTheme,
}) => {
  return (
    <div className=" flex justify-center">
      <PieChart width={400} height={250}>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          fill={chartTheme}
          strokeWidth={5}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy in viewBox") {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline={"middle"}
                  >
                    <tspan>{""}</tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};

export default RenderPieChart;
