import { NextRequest, NextResponse } from "next/server";
import pug from "pug";
import { generateTextPug } from "@/app/(authenticated)/storymaker/_components/templates/textTemplates";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { metricList } = body;

  const template = generateTextPug(metricList);
  const html = pug.compile(template)({ metricList: {} });

  return NextResponse.json({ html });
}
