/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import React from "react";
import { Key } from "react";
import { PieChart, Pie, Label } from "recharts";
import GanttChart from "@/app/(authenticated)/agentmaker/_components/field-types/chat-with-data-auto/GanttChart";

const RenderTab = ({ field, data, formData, preference }: any) => {
  const card_json = field?.media_card_data?.card_json;
  const field_buttons = field?.cardui_json[0]?.chat_with_data?.buttons;

  const card_actions_json = field_buttons.find(
    (field: any) => field.button_text === preference
  )?.json;
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const formatColumnTitle = (title: string) => {
    return title
      .split("_")
      .map((word, index) =>
        index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
      )
      .join(" ");
  };

  const formatCellValue = (column: string, value: any) => {
    if (value === null) return "-";

    if (column.toLowerCase().includes("valuation")) {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        return "-";
      }
      const formattedValue = parsedValue.toFixed(2);
      const trimmedValue = formattedValue.replace(/\.?0+$/, "");
      return `$${trimmedValue}B`;
    }

    if (column.toLowerCase().includes("rate")) {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        return "-";
      }
      const percentage = (parsedValue * 100).toFixed(2);
      return `${percentage}%`;
    }

    if (column.toLowerCase().includes("date") && value) {
      try {
        return new Date(value).toLocaleDateString();
      } catch (e) {
        return value;
      }
    }

    return String(value);
  };

  // Function to calculate duration in days between two dates
  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Process data for chart
  const processDataForChart = () => {
    return data
      .map((item: any) => {
        const planDuration = calculateDuration(
          item.plan_start_date,
          item.plan_end_date
        );
        const actualDuration = calculateDuration(
          item.actual_start_date,
          item.actual_end_date
        );

        return {
          name:
            typeof item.plan_name === "string"
              ? item.plan_name
              : `Plan ${item.plan_id}`,
          planDuration: planDuration || 0,
          actualDuration: actualDuration || 0,
          planId: item.plan_id,
        };
      })
      .filter((item: any) => item.planDuration > 0 || item.actualDuration > 0);
  };

  const chartData = processDataForChart();

  const renderElement = (item: any) => {
    if (!item || !item.type) return null;

    switch (item.type) {
      case "Heading":
        return (
          <h5
            key={item.text}
            className={`${
              item.weight === "bolder" ? "font-bold text-2xl" : "font-normal"
            } ${
              item.isSubtle ? "text-gray-500" : "text-gray-900"
            } dark:text-white`}
          >
            {item.text}
          </h5>
        );
      case "Paragraph":
        return (
          <p
            key={item.text}
            className={`${
              item.weight === "bolder" ? "font-bold text-2xl" : "font-normal"
            } ${
              item.isSubtle ? "text-gray-500" : "text-gray-900"
            } dark:text-white`}
          >
            {item.text}
          </p>
        );
      case "Image":
        return (
          <Image
            key={item.url}
            src={item.url}
            alt={item.altText}
            width={300}
            height={300}
            className="mt-4 text-center mx-auto"
          />
        );
      case "Table":
        return (
          <div className="relative overflow-x-auto">
            <Table
              key="data-table"
              className="w-full mt-4 text-sm text-left text-gray-500 dark:text-gray-400"
            >
              <TableHeader className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <TableRow>
                  {columns?.map(
                    (column: any, index: Key | null | undefined) => (
                      <TableHead key={index} scope="col" className="px-6 py-3">
                        {formatColumnTitle(column)}
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((rowItem: any, index: Key | null | undefined) => (
                  <TableRow
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                  >
                    {columns?.map((column: any, cellIndex: any) =>
                      cellIndex === 0 ? (
                        <TableCell
                          key={cellIndex}
                          scope="row"
                          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                        >
                          {formatCellValue(column, rowItem[column])}
                        </TableCell>
                      ) : (
                        <TableCell key={cellIndex} className="px-6 py-4">
                          {formatCellValue(column, rowItem[column])}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      case "Chart":
        // Calculate total duration
        // const totalDuration = () => {
        //   return chartData.reduce(
        //     (acc: number, curr: { planDuration: number }) =>
        //       acc + curr.planDuration,
        //     0
        //   );
        // };

        // Prepare data for pie chart
        const pieChartData = chartData.map((item: any) => ({
          name: item.name,
          duration: item.planDuration,
          fill: `hsl(var(--chart-${Math.floor(Math.random() * 5) + 1}))`, // Random color from chart palette
        }));

        const pieChartConfig = {
          duration: {
            label: "Duration",
          },
          ...chartData.reduce(
            (acc: any, curr: any, index: any) => ({
              ...acc,
              [curr.name]: {
                label: curr.name,
                color: `hsl(var(--chart-${(index % 5) + 1}))`,
              },
            }),
            {}
          ),
        };

        return (
          <Card key="chart" className="w-full">
            <CardHeader className="items-center pb-0">
              <CardTitle>Project Duration Distribution</CardTitle>
              <CardDescription>Plan Duration Analysis</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={pieChartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={pieChartData}
                    dataKey="duration"
                    nameKey="name"
                    innerRadius={60}
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
                                {/* {totalDuration.toLocaleString()} */}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Total Days
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
      case "List Card":
        return (
          <Card key="list-card" className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">
                {item.title || "List Card"}
              </CardTitle>
              {item.description && (
                <CardDescription>{item.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.map((listItem: any, index: number) => {
                  // Get all keys from the current list item
                  const itemKeys = Object.keys(listItem);

                  // Try to find title-like keys for the main heading
                  const titleKey = itemKeys.find(
                    (key) =>
                      key.toLowerCase().includes("name") ||
                      key.toLowerCase().includes("title") ||
                      key.toLowerCase().includes("label")
                  );

                  // Try to find ID or description-like keys
                  const idKey = itemKeys.find(
                    (key) =>
                      key.toLowerCase().includes("id") ||
                      key.toLowerCase().includes("code")
                  );

                  // Try to find status-like keys
                  const statusKey = itemKeys.find(
                    (key) =>
                      key.toLowerCase().includes("status") ||
                      key.toLowerCase().includes("state") ||
                      key.toLowerCase().includes("condition")
                  );

                  return (
                    <div
                      key={index}
                      className="flex items-start p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {listItem.icon && (
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {listItem.icon}
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white truncate">
                            {titleKey
                              ? listItem[titleKey]
                              : `Item ${index + 1}`}
                          </h4>
                          {idKey && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {listItem[idKey]}
                            </p>
                          )}
                          <div>
                            {/* Display any additional fields that might be relevant */}
                            {itemKeys
                              .filter(
                                (key) =>
                                  !key.includes("icon") &&
                                  key !== titleKey &&
                                  key !== idKey &&
                                  key !== statusKey &&
                                  key !== "actions"
                              )
                              .slice(0, 2) // Limit to first 2 additional fields to avoid clutter
                              .map((key) => (
                                <p
                                  key={key}
                                  className="text-sm text-gray-500 dark:text-gray-400 mt-1"
                                >
                                  {typeof listItem[key] === "object"
                                    ? JSON.stringify(listItem[key])
                                    : listItem[key]}
                                </p>
                              ))}
                          </div>
                        </div>
                      </div>
                      {statusKey && listItem[statusKey] && (
                        <div className="flex-shrink-0 ml-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              String(listItem[statusKey])
                                .toLowerCase()
                                .includes("complete") ||
                              String(listItem[statusKey]).toLowerCase() ===
                                "done"
                                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                : String(listItem[statusKey])
                                    .toLowerCase()
                                    .includes("progress") ||
                                  String(listItem[statusKey])
                                    .toLowerCase()
                                    .includes("ongoing")
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {listItem[statusKey]}
                          </span>
                        </div>
                      )}
                      {listItem.actions && (
                        <div className="flex-shrink-0 ml-4">
                          <button
                            type="button"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            aria-label="View details"
                            tabIndex={0}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      case "Gantt Chart":
        return <GanttChart data={data} />;
      case "Tabs":
        return (
          <Tabs key="data-tabs" className="w-full" defaultValue="data">
            <TabsList defaultValue={"data"} className="grid grid-cols-2">
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="chart">Chart</TabsTrigger>
            </TabsList>
            <TabsContent value="data">
              {renderElement({ type: "Table" })}
            </TabsContent>
            <TabsContent value="chart">
              {renderElement({ type: "Chart" })}
            </TabsContent>
          </Tabs>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Card className="p-2.5">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 p-6">
          {card_actions_json &&
            card_actions_json[0]?.body?.[0]?.columns?.map(
              (column: any, colIndex: any) => (
                <div key={colIndex} className={`w-${column.width}/3`}>
                  {column.items?.map((item: any) => renderElement(item))}
                </div>
              )
            )}
          {!card_actions_json && (
            <>
              <h5 className="font-bold text-xl text-gray-900 dark:text-white mb-4">
                Project Plans Analysis
              </h5>
              {renderElement({ type: "Tabs" })}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RenderTab;
