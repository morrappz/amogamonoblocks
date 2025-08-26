/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect } from "react";
import { useMetrics } from "../../lib/MetricContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SkeletonCard } from "@/components/skeleton-card";

export const ExtractMetricJson = () => {
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
};

const ExtractMetrics = ({ data, componentName }: any) => {
  const apiUrl = componentName?.metricApi;
  const { metrics, setMetrics } = useMetrics();

  useEffect(() => {
    getMetricData(data);
  }, [data]);

  const getMetricData = async (data: any) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", "Basic YWRtaW46cGFzc3dvcmQxMjM=");

    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    };

    const response = await fetch(apiUrl, requestOptions);
    const result = await response.json();
    setMetrics(result);
  };
  return (
    <div>
      <Card>
        {metrics ? (
          Object.entries(metrics).map(([field, fieldMetrics]) => (
            <div key={field}>
              <CardHeader>
                <h2>{field.replace(/_/g, " ")}</h2>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="w-full">
                      <TableHead className="w-[50%]">Metric</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(fieldMetrics).map(([metric, value]) => (
                      <TableRow key={metric}>
                        <TableCell>{metric}</TableCell>
                        <TableCell>
                          {Array.isArray(value)
                            ? value.join(", ")
                            : typeof value === "object" && value !== null
                            ? Object.keys(value).length === 0
                              ? "Empty Object"
                              : JSON.stringify(value)
                            : value !== undefined && value !== null
                            ? String(value)
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </div>
          ))
        ) : (
          <SkeletonCard />
        )}
      </Card>
    </div>
  );
};

export default ExtractMetrics;
