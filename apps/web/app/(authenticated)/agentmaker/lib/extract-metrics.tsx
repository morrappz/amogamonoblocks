/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMetrics } from "./MetricContext";

const ExtractMetrices = ({ data }: any) => {
  const [schema, setSchema] = useState<
    { fieldName: string; fieldType: string }[]
  >([]);
  //   const [metrics, setMetrics] = useState<Record<string, any> | null>(null);
  const { setMetrics } = useMetrics();
  const { metrics } = useMetrics();

  console.log(schema);

  // Function to generate schema dynamically from data
  const generateSchema = (data: Array<any>) => {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Data must be a non-empty array.");
    }

    const sample = data[0];
    return Object.keys(sample).map((key) => {
      const value = sample[key];
      let fieldType: string | "date" = typeof value;

      if (fieldType === "object" && value instanceof Date) {
        fieldType = "date";
      }

      return { fieldName: key, fieldType };
    });
  };

  const extractMetrics = (data: Array<any>, schema: Array<any>) => {
    const metrics: Record<string, any> = {};

    schema.forEach((fieldSchema) => {
      const { fieldName, fieldType } = fieldSchema;
      if (fieldType === "number") {
        const values = data.map((item) => item[fieldName]);
        const sortedValues = [...values].sort((a, b) => a - b);

        metrics[fieldName] = {
          "Sum of total values": values.reduce((sum, val) => sum + val, 0),
          Average: values.reduce((sum, val) => sum + val, 0) / values.length,
          Minimum: Math.min(...values),
          Maximum: Math.max(...values),
          Median:
            sortedValues.length % 2 === 0
              ? (sortedValues[sortedValues.length / 2 - 1] +
                  sortedValues[sortedValues.length / 2]) /
                2
              : sortedValues[Math.floor(sortedValues.length / 2)],
        };
      } else if (fieldType === "string") {
        const uniqueValues = new Set(data.map((item) => item[fieldName]));
        metrics[fieldName] = {
          "Unique Values": Array.from(uniqueValues),
          "Unique Count": uniqueValues.size,
        };
      }
    });

    return metrics;
  };

  useEffect(() => {
    try {
      const generatedSchema = generateSchema(data);
      setSchema(generatedSchema);

      const calculatedMetrics = extractMetrics(data, generatedSchema);
      setMetrics(calculatedMetrics);
    } catch (error: any) {
      console.error("Error:", error.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div>
      {metrics &&
        Object.entries(metrics).map(([field, fieldMetrics]) => (
          <div key={field}>
            <h2>{field.replace(/_/g, " ")}</h2>
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
          </div>
        ))}
    </div>
  );
};

export default ExtractMetrices;
