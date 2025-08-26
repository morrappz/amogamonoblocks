/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { metrics } from "../ConversationalChat";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const colorPalette = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00c49f",
];

const RenderPieChart = ({
  data,
  story,
  metrics,
}: {
  data: any;
  story?: string;
  metrics?: metrics | null;
}) => {
  const chartData = {
    labels: data.map((item) => new Date(item.created_date).toLocaleString()),
    datasets: [
      {
        label: "Order payments",
        data: data.map((item) => parseFloat(item.order_payment_amount)),
        backgroundColor: colorPalette,
      },
    ],
  };

  return (
    <Card className="p-2.5 mt-2">
      <CardContent className="flex flex-col items-center w-full">
        <div className="max-w-[70%] flex items-center w-full ">
          <Pie data={chartData} />
        </div>

        <CardFooter className="flex w-full flex-col space-y-2.5">
          <div className="mb-2 border-b p-2.5">
            {story && (
              <div
                className="text-[15px] space-y-2.5 text-muted-foreground"
                dangerouslySetInnerHTML={{
                  __html: story,
                }}
              />
            )}
          </div>

          {metrics && (
            <div className="w-full text-[15px]">
              <h2 className="text-lg">Order metrics</h2>
              <p>Total Orders: {metrics.count_order_number}</p>
              <p>Total Revenue: {metrics.sum_order_payment_amount}</p>
              <p>Max Order Value: {metrics.max_order_payment_amount}</p>
              <p>Min Order Value: {metrics?.min_order_payment_amount}</p>
              <hr />
              <p className="mt-5">
                First Order Date: {metrics?.first_order_date}
              </p>
              <p>Last Order Date: {metrics?.last_order_date}</p>
              <p>Orders by Date: {JSON.stringify(metrics?.orders_by_date)}</p>
              <p>
                Orders by Weekday: {JSON.stringify(metrics?.orders_by_weekday)}
              </p>
            </div>
          )}
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default RenderPieChart;
