import { generateNumericTemplate } from "@/app/(authenticated)/storymaker/_components/templates/numericTemplates";
import { NextResponse } from "next/server";
import pug from "pug";

export async function POST(req: Request) {
  const numericMetrics = await req.json();
  const { metricList } = numericMetrics;
  const template = generateNumericTemplate(metricList);
  const html = pug.compile(template)({ metricList: {} });

  return NextResponse.json({
    html,
  });
}
