import { NextRequest, NextResponse } from "next/server";
import pug from "pug";
import { generateDatePug } from "@/app/(authenticated)/storymaker/_components/templates/dateTemplates";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { metricList } = body;

  const template = generateDatePug(metricList);
  const html = pug.compile(template)({ metrics: {} });

  return NextResponse.json({ html });
}
