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

type ChartDataProps = {
  chartData: {
    type: string;
    title: string;
    labels: string[];
    data: number[];
  };
};

export const ChartRenderer = ({ chartData }: ChartDataProps) => {
  if (!chartData || !chartData.data) {
    return <div>Invalid chart data</div>;
  }

  const { type, title, labels, data } = chartData;

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
