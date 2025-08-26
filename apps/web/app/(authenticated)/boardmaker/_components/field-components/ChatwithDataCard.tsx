/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, useState } from "react";
import { DynamicChart } from "../chat-with-data-auto/dynamic-chart";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import ExtractMetrices from "../../lib/extract-metrics";
import { useMetrics } from "../../lib/MetricContext";
import ExtractMetrics, { ExtractMetricJson } from "./ExtractMetrics";
import NarrativeTemplate from "./NarrativeTemplate";

function Actionables() {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold">Suggested Actions:</h4>
      <ul className="space-y-2">
        <li className="flex items-start gap-2">
          <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
          <p className="text-sm">
            Investigate the significant revenue increase in August to identify
            contributing factors and potentially replicate the success.
          </p>
        </li>
        <li className="flex items-start gap-2">
          <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
          <p className="text-sm">
            Analyze the slight dip in revenue during April and May to understand
            any seasonal trends or external factors affecting sales.
          </p>
        </li>
        <li className="flex items-start gap-2">
          <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
          <p className="text-sm">
            Consider implementing strategies to stabilize revenue fluctuations
            and maintain consistent growth month-over-month.
          </p>
        </li>
      </ul>
    </div>
  );
}

export function MetricJson() {
  const { metrics } = useMetrics();
  return (
    <Card>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[500px]">
          {JSON.stringify(metrics, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

const ChatwithDataCard = ({
  results,
  columns,
  chartConfig,
  componentName,
  apiData,
}: any) => {
  // Process the data based on which props are provided
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const generateChartApiConfig = (data: any[]) => {
    if (!data || data.length === 0) return null;

    // Clean and transform the data
    const cleanedData = data.map((item) => {
      const cleanedItem: { [key: string]: any } = {};

      Object.entries(item).forEach(([key, value]) => {
        if (typeof value === "string") {
          // Try to convert string values that look like numbers (including currency)
          const numericString = value.replace(/[^0-9.-]+/g, "");
          const numericValue = parseFloat(numericString);

          if (!isNaN(numericValue)) {
            cleanedItem[key] = numericValue;
          } else {
            cleanedItem[key] = value;
          }
        } else {
          cleanedItem[key] = value;
        }
      });

      return cleanedItem;
    });

    // Find xKey (first non-numeric field) and yKeys (numeric fields)
    const keys = Object.keys(cleanedData[0]);
    const xKey = keys.find((key) => typeof cleanedData[0][key] === "string");
    const yKeys = keys.filter((key) => typeof cleanedData[0][key] === "number");

    // Generate colors for each yKey
    // const colors = yKeys.reduce((acc, key, index) => {
    //   acc[key] = `hsl(var(--chart-${(index % 5) + 1}))`;
    //   return acc;
    // }, {} as Record<string, string>);

    return {
      xKey,
      yKeys,
    };
  };

  const processData = () => {
    if (results && Array.isArray(results) && results.length > 0) {
      // Clean the results data
      const cleanedResults = results.map((item) => {
        const cleanedItem: { [key: string]: any } = {};
        Object.entries(item).forEach(([key, value]) => {
          if (typeof value === "string") {
            // Convert currency strings to numbers
            const numericString = value.replace(/[^0-9.-]+/g, "");
            const numericValue = parseFloat(numericString);
            cleanedItem[key] = !isNaN(numericValue) ? numericValue : value;
          } else {
            cleanedItem[key] = value;
          }
        });
        return cleanedItem;
      });

      return {
        data: cleanedResults,
        columnTitles: columns || Object.keys(cleanedResults[0]),
        chartType: componentName?.component_name,
      };
    }

    if (apiData?.dataApi_response && Array.isArray(apiData.dataApi_response)) {
      const responseData = apiData.dataApi_response;
      const allKeys =
        responseData.length > 0 ? Object.keys(responseData[0]) : [];

      // Clean the API response data
      const formattedData = responseData
        .filter(
          (item: any) =>
            item && Object.values(item).some((value) => value !== null)
        )
        .map((item: any) => {
          const cleanedItem: { [key: string]: any } = {};
          Object.entries(item).forEach(([key, value]) => {
            if (typeof value === "string") {
              // Convert currency strings to numbers
              const numericString = value.replace(/[^0-9.-]+/g, "");
              const numericValue = parseFloat(numericString);
              cleanedItem[key] = !isNaN(numericValue) ? numericValue : value;
            } else {
              cleanedItem[key] = value;
            }
          });
          return cleanedItem;
        });

      const chartApiConfig = generateChartApiConfig(formattedData);

      return {
        data: formattedData,
        columnTitles: allKeys,
        chartType: apiData.component_name || componentName?.component_name,
        chartApiConfig,
      };
    }

    return {
      data: [],
      columnTitles: [],
      chartType: "",
    };
  };

  const { data, columnTitles, chartApiConfig } = processData();

  // Return early if no data
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const formatColumnTitle = (title: string) => {
    return title
      .split("_")
      .map((word, index) =>
        index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
      )
      .join(" ");
  };

  const formatCellValue = (column: string, value: any) => {
    if (value === null || value === undefined) return "";

    if (column.toLowerCase().includes("valuation")) {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        return "";
      }
      const formattedValue = parsedValue.toFixed(2);
      const trimmedValue = formattedValue.replace(/\.?0+$/, "");
      return `$${trimmedValue}B`;
    }
    if (column.toLowerCase().includes("rate")) {
      const parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        return "";
      }
      const percentage = (parsedValue * 100).toFixed(2);
      return `${percentage}%`;
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value);
  };

  // const renderChart = () => {
  //   switch (chartType) {
  //     case "Data Card Donut Chart":
  //       return <PieChart data={data} dataKey={columnTitles} />;
  //     case "Data Card Line Chart":
  //       return <LineGraph data={data} dataKey={columnTitles} />;
  //     case "Data Card Bar Chart":
  //       return <BarChart data={data} dataKey={columnTitles} />;
  //     case "Data Card Bar Chart Horizontal":
  //       return <HorizontalBarChart data={data} dataKey={columnTitles} />;
  //   }
  // };

  const renderChart = () => {
    const activeConfig = chartConfig || chartApiConfig;

    if (activeConfig && data.length > 0) {
      return (
        <DynamicChart
          chartData={data}
          chartConfig={activeConfig}
          // componentName={chartType}
        />
      );
    }

    return (
      <div className="flex justify-center items-center">
        Chart not available
      </div>
    );
  };

  const totalPages = Math.ceil(data.length / recordsPerPage);
  const currentData = data.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <Card className="p-2.5 overflow-x-auto  md:w-[760px]">
        <Tabs className="w-full" defaultValue="data">
          <TabsList defaultValue={"data"} className="grid grid-cols-7 gap-2.5">
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="key-metrics">Metrics</TabsTrigger>
            <TabsTrigger value="key-metrics-json">KM JSON</TabsTrigger>
            <TabsTrigger value="narrative">Narrative</TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="actionables">Actionables</TabsTrigger>
          </TabsList>
          <TabsContent value="json">
            <pre>{JSON.stringify({ chat_with_db_data: data }, null, 2)}</pre>
            <pre>
              {JSON.stringify(
                { chart_data: chartConfig ? chartConfig : chartApiConfig },
                null,
                2
              )}
            </pre>
          </TabsContent>
          <TabsContent value="key-metrics">
            {componentName?.metricApiEnabled ? (
              <ExtractMetrics data={data} componentName={componentName} />
            ) : (
              <ExtractMetrices data={data} />
            )}
          </TabsContent>
          <TabsContent value="key-metrics-json">
            {componentName?.metricApiEnabled ? (
              <ExtractMetricJson />
            ) : (
              <MetricJson />
            )}
          </TabsContent>
          <TabsContent value="narrative">
            <NarrativeTemplate data={data} componentName={componentName} />
          </TabsContent>
          <TabsContent value="data">
            <Table className="min-w-full overflow-x-auto divide-y divide-border">
              <TableHeader className="bg-secondary sticky top-0 shadow-sm">
                <TableRow>
                  {columnTitles?.map(
                    (column: any, index: Key | null | undefined) => (
                      <TableHead
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        {formatColumnTitle(column)}
                      </TableHead>
                    )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody className="bg-card overflow-x-auto divide-y divide-border">
                {currentData.map((item: any, index: Key | null | undefined) => (
                  <TableRow key={index} className="hover:bg-muted">
                    {columnTitles?.map((column: any, cellIndex: any) => (
                      <TableCell
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                      >
                        {formatCellValue(column, item[column])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex gap-2.5 items-center">
              <div>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  // variant="outline"
                  className="cursor-pointer border rounded p-1"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 10)}
                >
                  <ChevronsLeft className="w-5 h-5" />
                </button>
                <button
                  // variant="outline"
                  className="cursor-pointer border rounded p-1"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  className="cursor-pointer border rounded p-1"
                  // variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  className="cursor-pointer border rounded p-1"
                  // variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 10)}
                >
                  <ChevronsRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="chart">
            <div className="mt-4">{renderChart()}</div>
          </TabsContent>
          <TabsContent value="actionables">
            <Actionables />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ChatwithDataCard;
