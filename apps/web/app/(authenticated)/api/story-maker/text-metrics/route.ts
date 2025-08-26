/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const columns = await req.json();

  const metricList: any = [];

  columns.map((field: any) => {
    if (
      field.extract_metric_group === "text" &&
      field.extract_metrics === true
    ) {
      metricList.push(
        `${field.column_name}_count`,
        `${field.column_name}_sum`,
        `${field.column_name}_mean`,
        `${field.column_name}_median`,
        `${field.column_name}_mode`,
        `${field.column_name}_min`,
        `${field.column_name}_max`,
        `${field.column_name}_std`,
        `${field.column_name}_var`,
        `${field.column_name}_null_count`,
        `${field.column_name}_today`,
        `${field.column_name}_this_week`,
        `${field.column_name}_this_month`,
        `${field.column_name}_this_year`,
        `${field.column_name}_date`,
        `${field.column_name}_day`,
        `${field.column_name}_holiday`,
        `${field.column_name}_week_no`,
        `${field.column_name}_month`,
        `${field.column_name}_year`
      );
    }
  });

  return NextResponse.json({ metricList: metricList });
}
