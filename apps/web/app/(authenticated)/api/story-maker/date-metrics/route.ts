/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  const metricList: any = [];

  data.map((field: any) => {
    if (
      field.extract_metric_group === "date" &&
      field.extract_metrics === true
    ) {
      metricList.push(
        `today_${field.column_name}`,
        `this_week_${field.column_name}`,
        `this_month_${field.column_name}`,
        `this_year_${field.column_name}`,
        `date_${field.column_name}`,
        `day_${field.column_name}`,
        `holiday_${field.column_name}`,
        `week_no_${field.column_name}`,
        `month_${field.column_name}`,
        `year_${field.column_name}`
      );
    }
  });

  return NextResponse.json({ metricList: metricList });
}
