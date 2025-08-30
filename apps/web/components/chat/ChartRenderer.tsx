"use client";

import { Pie, Bar, Line, Doughnut, Radar, PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  RadialLinearScale,
} from "chart.js";
import React from "react";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  RadialLinearScale
);

type ChartDataProps = {
  chartData: {
    type: string;
    title: string;
    labels?: string[];
    data: number[] | { label: string; value: number }[];
    xAxis?: string;
    yAxis?: string;
  };
};

export const ChartRenderer = ({ chartData }: ChartDataProps) => {
  if (!chartData || !chartData.data) {
    return <div>Invalid chart data</div>;
  }

  const { type, title } = chartData;

  // Handle both data formats
  let labels: string[];
  let data: number[];

  if (Array.isArray(chartData.data) && chartData.data.length > 0) {
    if (typeof chartData.data[0] === "object" && "label" in chartData.data[0]) {
      // New format: array of {label, value} objects
      const objectData = chartData.data as { label: string; value: number }[];
      labels = objectData.map((d) => d.label);
      data = objectData.map((d) => d.value);
    } else {
      // Old format: separate labels and data arrays
      labels = chartData.labels || [];
      data = chartData.data as number[];
    }
  } else {
    return <div>Invalid chart data format</div>;
  }

  const config = {
    data: {
      labels,
      datasets: [
        {
          label: title,
          data,
          backgroundColor: [
            "#36A2EB",
            "#FF6384",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
            "#FF9F40",
            "#E7E9ED",
            "#3cba9f",
            "#f4c20d",
            "#db3236",
          ],
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right" as const,
        },
        title: {
          display: true,
          text: title,
        },
      },
    },
  };

  switch (type) {
    case "pie-chart":
      return <Pie {...config} />;
    case "bar-chart":
      return <Bar {...config} />;
    case "line-chart":
      return <Line {...config} />;
    case "doughnut-chart":
      return <Doughnut {...config} />;
    case "radar-chart":
      return <Radar {...config} />;
    case "polar-area-chart":
      return <PolarArea {...config} />;
    default:
      return <div>Unsupported chart type: {type}</div>;
  }
};
