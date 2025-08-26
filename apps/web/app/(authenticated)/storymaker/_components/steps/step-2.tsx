"use client";
import React, { useEffect } from "react";
import { ExtractMetricGroupScope, StoryGroup } from "../../types/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

const Step2 = ({
  selectedStoryGroup,
  userDefinedColumns,
  setUserDefinedColumns,
  userDefinedMetricScope,
  rowAction,
}: {
  selectedStoryGroup: StoryGroup;
  userDefinedColumns: StoryGroup;
  setUserDefinedColumns: (columns: StoryGroup) => void;
  userDefinedMetricScope: ExtractMetricGroupScope;
  rowAction: string;
}) => {
  useEffect(() => {
    if (rowAction === "new") {
      const updatedStoryGroup = {
        ...selectedStoryGroup,
        data_model_json: {
          ...selectedStoryGroup.data_model_json,
          extract_metric_group_scope: userDefinedMetricScope,
        },
      };
      setUserDefinedColumns(updatedStoryGroup);
    }
  }, [
    selectedStoryGroup,
    setUserDefinedColumns,
    userDefinedMetricScope,
    rowAction,
  ]);

  return (
    <div>
      <h1 className="text-2xl mb-4 font-semibold">
        {userDefinedColumns?.data_model_json?.source_table_name}
      </h1>
      <Table className="border rounded-lg">
        <TableHeader className="border rounded">
          <TableRow>
            <TableHead>
              <Checkbox
                onCheckedChange={(checked) => {
                  const updatedColumns =
                    userDefinedColumns.data_model_json.columns.map((c) => ({
                      ...c,
                      extract_metrics: checked,
                    }));
                  setUserDefinedColumns({
                    ...userDefinedColumns,
                    data_model_json: {
                      ...userDefinedColumns.data_model_json,
                      columns: updatedColumns,
                    },
                  });
                }}
              />
            </TableHead>
            <TableHead>Column Name</TableHead>
            <TableHead>Column Type</TableHead>
            <TableHead>Required</TableHead>
            <TableHead>Extract Group</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userDefinedColumns?.data_model_json?.columns.map((column) => (
            <TableRow key={column.column_name}>
              <TableCell>
                <Checkbox
                  checked={column.extract_metrics}
                  onCheckedChange={(checked) => {
                    const updatedColumns =
                      userDefinedColumns.data_model_json.columns.map((c) =>
                        c.column_name === column.column_name
                          ? { ...c, extract_metrics: checked }
                          : c
                      );
                    setUserDefinedColumns({
                      ...userDefinedColumns,
                      data_model_json: {
                        ...userDefinedColumns.data_model_json,
                        columns: updatedColumns,
                      },
                    });
                  }}
                />
              </TableCell>
              <TableCell>{column.column_name}</TableCell>
              <TableCell>{column.column_type}</TableCell>
              <TableCell>{column.required ? "Yes" : "No"}</TableCell>
              <TableCell>{column.extract_metric_group}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Step2;
