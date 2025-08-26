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
} from "chart.js";
import React from "react";
import { useChatStore } from "./useStore";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

export const ChartRenderer = ({ data }: { data: any }) => {
  const { chartData } = useChatStore();
  if (!chartData || !chartData.type) {
    return <div>Invalid chart data</div>;
  }

  const labels = data.map((item) => item[chartData.xaxis] || "N/A");
  const values = data.map((item) => item[chartData.yaxis] || 0);

  const { type, title } = chartData;

  const config = {
    data: {
      labels,
      datasets: [
        {
          label: title,
          data: values,
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
