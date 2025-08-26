"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns";

interface QueryResultProps {
  results: Array<{
    fields: Array<{ name: string }>;
    rows: Array<Record<string, unknown>>;
  }>;
  chartConfig?: {
    type: string;
    data: Record<string, unknown>;
    options?: Record<string, unknown>;
  };
}

export default function QueryResult({
  results,
  chartConfig,
}: QueryResultProps) {
  const [activeTab, setActiveTab] = useState<string>(
    chartConfig ? "chart" : "data"
  );
  const { type, data, options } = chartConfig || {};
  if (!results || results.length === 0) {
    if (!chartConfig) {
      return null;
    }
    return (
      <Card className="mt-4 max-w-[95%]">
        <CardContent className="p-0 py-2 md:p-4">
          {chartConfig && (
            <div className="space-y-4">
              <Chart
                className="max-w-full max-h-full min-h-72"
                type={type}
                data={data}
                options={{
                  ...options,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const result = results[0];
  const rows = result.rows || [];
  const fields = result.fields || [];

  return (
    <Card className="max-w-[95%] w-[95%] mt-4">
      <Tabs defaultValue="data" onValueChange={setActiveTab} value={activeTab}>
        {chartConfig && (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart" disabled={!chartConfig}>
              Chart
            </TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="data">
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {fields.map((field) => (
                      <TableHead key={field.name}>{field.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(
                    (row: Record<string, unknown>, rowIndex: number) => (
                      <TableRow key={rowIndex}>
                        {fields.map((field) => (
                          <TableCell key={field.name}>
                            {formatCellValue(row[field.name])}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>

            {/* <div className="mt-4 space-y-2">
              <h3 className="font-semibold text-lg">Data Insights:</h3>
              <ul className="list-disc pl-5 space-y-1"></ul>
            </div> */}
          </CardContent>
        </TabsContent>

        <TabsContent value="chart">
          <CardContent className="p-4">
            {chartConfig && (
              <div className="space-y-4">
                <Chart
                  className="max-w-full max-h-full min-h-72"
                  type={type}
                  data={data}
                  options={{
                    ...options,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            )}
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
