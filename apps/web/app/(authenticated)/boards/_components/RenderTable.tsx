/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

const RenderTable = ({
  contentJson,
  apiToken,
}: {
  contentJson: any[];
  apiToken?: string;
}) => {
  const { table } = contentJson[0];
  const [tableData, setTableData] = React.useState([]);

  React.useEffect(() => {
    if (contentJson[0]?.type === "graphql") {
      const fetchGraphql = async (id: number, query: string, api: string) => {
        const response = await fetch("/api/boards/graphql", {
          method: "POST",
          body: JSON.stringify({ query, api }),
        });
        const result = await response.json();
        setTableData(result);
      };

      table.forEach(
        (item: { id: number; name: string; query: string; api: string }) => {
          fetchGraphql(item.id, item.query, item.api);
        }
      );
    }
  }, [contentJson, table]);

  React.useEffect(() => {
    if (contentJson[0]?.type === "api") {
      const fetchApiData = async (api: string, cardName: string) => {
        try {
          const response = await fetch(api, {
            method: "GET",
            headers: {
              Authorization: apiToken!,
            },
          });
          const result = await response.json();
          console.log("result-----", result);
          setTableData(result);
        } catch (error) {
          console.error(`Error fetching data for card ${cardName}:`, error);
        }
      };
      fetchApiData(table[0].api, table[0].name);
    }
  }, [contentJson, apiToken, table]);

  return (
    <div>
      {tableData && tableData.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(tableData[0]).map((column, index) => (
                  <TableHead key={index} className="capitalize">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item, index) => (
                <TableRow key={index}>
                  {Object.keys(tableData[0]).map((key, index) => (
                    <TableCell key={index}>
                      {typeof item[key] === "object"
                        ? JSON.stringify(item[key], null, 2) // Format nested objects
                        : item[key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default RenderTable;
