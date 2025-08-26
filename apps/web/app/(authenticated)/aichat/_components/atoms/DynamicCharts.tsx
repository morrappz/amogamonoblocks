/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
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
  AreaChart,
  Area,
} from "recharts";
import RenderPieChart from "./Pie";
import { ChartData, metrics } from "../Conversational/ConversationalChat";
import { Button } from "@/components/ui/button";
import { Gantt, Task, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { Badge } from "@/components/ui/badge";
// import { toast } from "sonner";

const colors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00c49f",
];

interface DynamicChartProps {
  data: any[];
  chart: ChartData | undefined;
  type?: string | undefined;
  story_api?: string;
  title?: string;
  story?: string;
  metrics?: metrics | null;
  labelField?: string;
  valueField?: string;
}

const DynamicChart: React.FC<DynamicChartProps> = ({
  data,
  chart,
  title,
  // story_api,
  // story,
  // metrics,
  // labelField,
  // valueField,
}) => {
  const [chartTheme, setChartTheme] = React.useState("blue");
  const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.Day);
  // const [story, setStory] = React.useState("");
  const views = ["Day", "Week", "Month", "Year"];

  // React.useEffect(() => {
  //   if (story_api) {
  //     const fetchStory = async () => {
  //       try {
  //         const response = await fetch(story_api!);
  //         const result = await response.json();

  //         const pugTemplateJson = result[0]?.pug_template_json;
  //         const storyTemplate = await fetch("/api/story-maker/story-template", {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify({ template: pugTemplateJson, data }),
  //         });
  //         const story = await storyTemplate.json();
  //         if (!story.ok) {
  //           toast.error("Error creating story");
  //           return;
  //         }
  //         // setStory(story?.data);
  //       } catch (error) {
  //         toast.error(`Failed Creating Story ${error}`);
  //       }
  //     };

  //     fetchStory();
  //   }
  // }, [story_api, data]);

  const chartData = data.map((item) => ({
    name: chart?.xaxis ? item[chart.xaxis] : undefined,
    value: chart?.yaxis ? item[chart.yaxis] : undefined,
  }));

  const chartConfig: ChartConfig = {
    value: {
      label: chart?.xaxis,
      color: "red",
    },
  };

  const tasks: Task[] = React.useMemo(
    () =>
      chartData.map((item, index) => ({
        id: `task-${index + 1}`,
        name: `${chart?.title}`,
        start: new Date(item.name),
        end: new Date(item.value),
        type: "task",
        progress: 0,
        isDisabled: false,
        styles: {
          backgroundColor: chartTheme,
          progressColor: chartTheme,
          progressSelectedColor: "#000000",
        },
      })),
    [chartData, chartTheme, chart]
  );

  if (!data?.length) {
    return <div className="p-4 text-gray-500">No data available</div>;
  }

  const renderChart = () => {
    switch (chart && chart.type && chart.type.toLowerCase()) {
      case "bar-chart":
        return (
          <ChartContainer config={chartConfig}>
            <BarChart width={600} accessibilityLayer data={chartData}>
              <XAxis dataKey="name" />
              <YAxis dataKey={"value"} />
              <Bar radius={4} dataKey="name" fill={chartTheme} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        );
      case "bar-chart-horizontal":
        return (
          <ChartContainer config={chartConfig}>
            <BarChart
              width={600}
              accessibilityLayer
              layout="vertical"
              data={chartData}
            >
              <YAxis dataKey={"value"} type="category" />
              <XAxis dataKey="name" type="number" />
              <Bar dataKey="name" fill={chartTheme} radius={4} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </ChartContainer>
        );
      case "bar-chart-multiple":
        return (
          <ChartContainer config={chartConfig}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <YAxis />
              <Bar dataKey="value" radius={4} fill={chartTheme} />
              <Bar dataKey="name" radius={4} fill={chartTheme} />
            </BarChart>
          </ChartContainer>
        );
      case "line-chart":
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={chartTheme}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        );
      case "area-chart":
        return (
          <AreaChart data={chartData} accessibilityLayer>
            <CartesianGrid />
            <XAxis
              dataKey={"name"}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area dataKey={"value"} type={"natural"} fill={chartTheme} />
          </AreaChart>
        );
      case "pie-chart":
        return (
          <RenderPieChart
            data={chartData}
            colors={colors}
            chartTheme={chartTheme}
          />
        );
      case "gantt-chart":
        return (
          <div
            style={{
              width: "100%",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div style={{ width: "800px", minWidth: "600px" }}>
              <Gantt
                tasks={tasks}
                handleWidth={50}
                columnWidth={100}
                viewMode={viewMode}
              />
            </div>
          </div>
        );
      default:
        return <div>No Data on Response</div>;
    }
  };
  return (
    <Card className=" w-full   overflow-y-auto">
      <div className="hidden justify-end flex-wrap">
        {colors.map((item, index) => (
          <Button variant={"ghost"} key={index} className="">
            <span
              onClick={() => setChartTheme(item)}
              className="flex flex-col items-center cursor-pointer"
            >
              <div
                className="w-6 h-6 rounded-md mb-1 border-2 border-gray-200"
                style={{ backgroundColor: item }}
              />
            </span>
          </Button>
        ))}
      </div>
      {chart?.type === "gantt-chart" && (
        <div className="flex gap-2.5 mt-2.5 justify-end cursor-pointer">
          {views.map((view, index) => (
            <Badge
              variant={"outline"}
              className="rounded-full"
              key={index}
              onClick={() =>
                setViewMode(ViewMode[view as keyof typeof ViewMode])
              }
            >
              {view}
            </Badge>
          ))}
        </div>
      )}
      <CardContent className="pt-6">
        {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
        {chartData?.length > 0 ? (
          <ChartContainer config={chartConfig}>{renderChart()}</ChartContainer>
        ) : (
          <div className="text-center">
            <p>No Data on Response</p>
          </div>
        )}
        {/* <div className=" w-full p-2.5 rounded-md">
          <div
            dangerouslySetInnerHTML={{
              __html: story,
            }}
          />
        </div> */}
      </CardContent>
    </Card>
  );
};

export default DynamicChart;
