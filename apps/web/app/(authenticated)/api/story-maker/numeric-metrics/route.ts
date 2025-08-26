/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const columns = await req.json();

  const metricList: any = [];

  columns.map((field: any) => {
    if (
      field.extract_metric_group === "number" &&
      field.extract_metrics === true
    ) {
      metricList.push(
        `count_${field.column_name}`,
        `sum_${field.column_name}`,
        `mean_${field.column_name}`,
        `median_${field.column_name}`,
        `mode_${field.column_name}`,
        `min_${field.column_name}`,
        `max_${field.column_name}`,
        `std_${field.column_name}`,
        `var_${field.column_name}`,
        `null_count_${field.column_name}`
      );
    }
  });

  return NextResponse.json({ metricList });
}
